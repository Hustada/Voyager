import { createServer } from 'http';
import { spawn, execSync } from 'child_process';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { rmSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const VOYAGER_DIR = join(__dirname, '..');

let voyagerProcess = null;
let wsClients = new Set();

// WebSocket server for real-time logs
const wss = new WebSocketServer({ port: 8765 });

wss.on('connection', (ws) => {
  console.log('Dashboard connected');
  wsClients.add(ws);

  // Send current status
  ws.send(JSON.stringify({
    type: 'status',
    running: voyagerProcess !== null
  }));

  ws.on('close', () => {
    wsClients.delete(ws);
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data);

    if (msg.type === 'start') {
      startVoyager(msg.port, msg.apiKey);
    } else if (msg.type === 'stop') {
      stopVoyager();
    } else if (msg.type === 'clear') {
      clearProgress();
    }
  });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wsClients.forEach(ws => {
    if (ws.readyState === 1) ws.send(msg);
  });
}

function startVoyager(port, apiKey) {
  if (voyagerProcess) {
    broadcast({ type: 'log', level: 'error', message: 'Voyager is already running' });
    return;
  }

  broadcast({ type: 'log', level: 'info', message: `Starting Voyager on port ${port}...` });

  // Check for existing progress
  const ckptDir = join(VOYAGER_DIR, 'ckpt');
  if (existsSync(ckptDir)) {
    broadcast({ type: 'log', level: 'info', message: 'Found existing progress - resuming...' });
  } else {
    broadcast({ type: 'log', level: 'info', message: 'Starting fresh (no saved progress)' });
  }

  // Create run script with the port
  const pythonCode = `
import sys
sys.path.insert(0, '${VOYAGER_DIR}')
from voyager import Voyager

voyager = Voyager(
    mc_port=${port},
    openai_api_key='${apiKey}',
    action_agent_model_name='gpt-4o',
    curriculum_agent_model_name='gpt-4o',
    critic_agent_model_name='gpt-4o',
    curriculum_agent_qa_model_name='gpt-4o-mini',
    skill_manager_model_name='gpt-4o-mini',
)
voyager.learn()
`;

  voyagerProcess = spawn('/opt/homebrew/Caskroom/miniconda/base/bin/python', ['-c', pythonCode], {
    cwd: VOYAGER_DIR,
    env: { ...process.env, PYTHONUNBUFFERED: '1', OPENAI_API_KEY: apiKey }
  });

  voyagerProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => {
      // Parse log type from ANSI codes
      let level = 'info';
      let cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '');

      if (line.includes('[32m') || line.includes('Action Agent')) level = 'action';
      else if (line.includes('[31m') || line.includes('Critic')) level = 'critic';
      else if (line.includes('[35m') || line.includes('Curriculum') || line.includes('Starting task')) level = 'curriculum';
      else if (line.includes('[33m') || line.includes('Skill Manager')) level = 'skill';
      else if (line.includes('[41m') || line.includes('Error')) level = 'error';

      broadcast({ type: 'log', level, message: cleanLine });
    });
  });

  voyagerProcess.stderr.on('data', (data) => {
    broadcast({ type: 'log', level: 'error', message: data.toString() });
  });

  voyagerProcess.on('close', (code) => {
    broadcast({ type: 'log', level: 'info', message: `Voyager exited with code ${code}` });
    broadcast({ type: 'status', running: false });
    voyagerProcess = null;
  });

  broadcast({ type: 'status', running: true });
}

function stopVoyager() {
  if (voyagerProcess) {
    broadcast({ type: 'log', level: 'info', message: 'Stopping Voyager...' });

    // Kill node mineflayer processes too
    spawn('pkill', ['-9', '-f', 'node.*index.js']);

    voyagerProcess.kill('SIGTERM');
    setTimeout(() => {
      if (voyagerProcess) voyagerProcess.kill('SIGKILL');
    }, 3000);
  }
}

function clearProgress() {
  if (voyagerProcess) {
    broadcast({ type: 'log', level: 'error', message: 'Stop Voyager before clearing progress' });
    return;
  }

  const ckptDir = join(VOYAGER_DIR, 'ckpt');
  const mineflayerCkpt = join(VOYAGER_DIR, 'voyager', 'env', 'mineflayer', 'ckpt');

  try {
    if (existsSync(ckptDir)) {
      rmSync(ckptDir, { recursive: true, force: true });
    }
    if (existsSync(mineflayerCkpt)) {
      rmSync(mineflayerCkpt, { recursive: true, force: true });
    }
    broadcast({ type: 'log', level: 'info', message: 'Cleared all progress - bot will start fresh' });
  } catch (e) {
    broadcast({ type: 'log', level: 'error', message: `Failed to clear: ${e.message}` });
  }
}

console.log('Voyager Control Server running on ws://localhost:8765');

// Cleanup on exit
process.on('SIGINT', () => {
  stopVoyager();
  process.exit();
});
