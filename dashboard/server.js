import { spawn, execSync } from 'child_process';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { rmSync, existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const VOYAGER_DIR = join(__dirname, '..');

let voyagerProcess = null;
let voyagerPid = null;
let wsClients = new Set();

// Buffer for logs - persists across dashboard refreshes
const LOG_BUFFER_SIZE = 500;
let logBuffer = [];

// Track state for new connections
let currentState = {
  running: false,
  completedTasks: [],
  failedTasks: [],
  skills: [],
  currentTask: null
};

// Activity tracking for bot presence detection
let lastActivityTime = null;
const ACTIVITY_TIMEOUT_MS = 30000; // 30 seconds without activity = inactive

// Patterns that indicate the bot is actively doing something in-game
const ACTIVITY_PATTERNS = [
  /Position: x=/,
  /Health: [\d.]+\/20/,
  /Hunger: [\d.]+\/20/,
  /Inventory \(\d+\/36\)/,
  /Biome: \w+/,
  /Starting task /,
  /Completed task /,
  /Task failed/,
  /Code:/,
  /Action Agent/,
  /Critic.*success|failure/i,
];

// WebSocket server for real-time logs
const wss = new WebSocketServer({ port: 8765 });

wss.on('connection', (ws) => {
  console.log('Dashboard connected');
  wsClients.add(ws);

  // Load saved state from ckpt files
  loadSavedState();

  // Send current status and state
  ws.send(JSON.stringify({
    type: 'status',
    running: voyagerProcess !== null,
    activityStatus: getActivityStatus(),
    lastActivityTime: lastActivityTime
  }));

  // Send saved state (skills, completed tasks)
  ws.send(JSON.stringify({
    type: 'state',
    ...currentState
  }));

  // Send buffered logs
  logBuffer.forEach(log => {
    ws.send(JSON.stringify(log));
  });

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

function loadSavedState() {
  try {
    // Load skills - try shared_skills first, then fall back to ckpt/skill
    const sharedSkillsPath = join(VOYAGER_DIR, 'shared_skills', 'skills.json');
    const localSkillsPath = join(VOYAGER_DIR, 'ckpt', 'skill', 'skills.json');
    const skillsPath = existsSync(sharedSkillsPath) ? sharedSkillsPath : localSkillsPath;

    if (existsSync(skillsPath)) {
      const skillsData = JSON.parse(readFileSync(skillsPath, 'utf8'));
      currentState.skills = Object.entries(skillsData).map(([name, data]) => ({
        name,
        description: data.description || '',
        code: data.code || '',
        // Multi-bot attribution fields
        createdBy: data.created_by || 'legacy',
        createdByName: data.created_by_name || 'Legacy Bot',
        createdAt: data.created_at || null,
        version: data.version || 1,
        successCount: data.success_count || 0,
        failCount: data.fail_count || 0
      }));
      console.log(`Loaded ${currentState.skills.length} skills from ${skillsPath}`);
    }

    // Load completed/failed tasks
    const curriculumPath = join(VOYAGER_DIR, 'ckpt', 'curriculum');
    const completedPath = join(curriculumPath, 'completed_tasks.json');
    const failedPath = join(curriculumPath, 'failed_tasks.json');

    if (existsSync(completedPath)) {
      currentState.completedTasks = JSON.parse(readFileSync(completedPath, 'utf8'));
    }
    if (existsSync(failedPath)) {
      currentState.failedTasks = JSON.parse(readFileSync(failedPath, 'utf8'));
    }

    // Load bot profiles for color/name info
    const profilesPath = join(VOYAGER_DIR, 'bot_profiles.json');
    if (existsSync(profilesPath)) {
      currentState.botProfiles = JSON.parse(readFileSync(profilesPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading saved state:', e.message);
  }
}

function broadcast(data) {
  const msg = JSON.stringify(data);
  wsClients.forEach(ws => {
    if (ws.readyState === 1) ws.send(msg);
  });
}

function isActivityMessage(message) {
  return ACTIVITY_PATTERNS.some(pattern => pattern.test(message));
}

function getActivityStatus() {
  if (!currentState.running) return 'offline';
  if (!lastActivityTime) return 'inactive';

  const timeSinceActivity = Date.now() - lastActivityTime;
  return timeSinceActivity < ACTIVITY_TIMEOUT_MS ? 'active' : 'inactive';
}

function broadcastStatus() {
  broadcast({
    type: 'status',
    running: currentState.running,
    activityStatus: getActivityStatus(),
    lastActivityTime: lastActivityTime
  });
}

function addLog(level, message) {
  const log = {
    type: 'log',
    level,
    message,
    timestamp: new Date().toISOString()
  };

  // Add to buffer
  logBuffer.push(log);
  if (logBuffer.length > LOG_BUFFER_SIZE) {
    logBuffer.shift();
  }

  // Check if this is meaningful activity
  if (isActivityMessage(message)) {
    const wasInactive = getActivityStatus() === 'inactive';
    lastActivityTime = Date.now();

    // If we just became active, broadcast status change
    if (wasInactive && currentState.running) {
      broadcastStatus();
    }
  }

  // Broadcast to clients
  broadcast(log);

  // Update state based on log content
  updateStateFromLog(message, level);
}

function updateStateFromLog(message, level) {
  // Track current task
  if (message.includes('Starting task ')) {
    const match = message.match(/Starting task (.+) for at most/);
    if (match) {
      currentState.currentTask = match[1];
    }
  }

  // Track completed tasks
  if (message.includes('Completed task ')) {
    const match = message.match(/Completed task (.+)\./);
    if (match && !currentState.completedTasks.includes(match[1])) {
      currentState.completedTasks.push(match[1]);
      currentState.currentTask = null;
    }
  }

  // Track skills
  if (message.includes('Skill Manager generated description for ')) {
    const match = message.match(/generated description for (\w+):/);
    if (match && !currentState.skills.find(s => s.name === match[1])) {
      currentState.skills.push({
        name: match[1],
        description: 'Learned skill',
        code: ''
      });
    }
  }
}

function startVoyager(port, apiKey) {
  if (voyagerProcess) {
    addLog('error', 'Voyager is already running');
    return;
  }

  addLog('info', `Starting Voyager on port ${port}...`);

  // Check for existing progress
  const ckptDir = join(VOYAGER_DIR, 'ckpt');
  if (existsSync(ckptDir)) {
    addLog('info', 'Found existing progress - resuming...');
    loadSavedState();
  } else {
    addLog('info', 'Starting fresh (no saved progress)');
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

  voyagerPid = voyagerProcess.pid;
  console.log(`Voyager started with PID: ${voyagerPid}`);

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

      addLog(level, cleanLine);
    });
  });

  voyagerProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => {
      addLog('error', line.replace(/\x1b\[[0-9;]*m/g, ''));
    });
  });

  voyagerProcess.on('close', (code) => {
    addLog('info', `Voyager exited with code ${code}`);
    voyagerProcess = null;
    voyagerPid = null;
    currentState.running = false;
    currentState.currentTask = null;
    lastActivityTime = null;
    broadcastStatus();
  });

  currentState.running = true;
  lastActivityTime = Date.now(); // Mark as active on start
  broadcastStatus();
}

function stopVoyager() {
  addLog('info', 'Stopping Voyager...');

  try {
    // Kill all related processes aggressively
    execSync('pkill -9 -f "python.*voyager" || true', { stdio: 'ignore' });
    execSync('pkill -9 -f "node.*index.js" || true', { stdio: 'ignore' });
    execSync('pkill -9 -f "node.*mineflayer" || true', { stdio: 'ignore' });
  } catch (e) {
    // Ignore errors
  }

  // Also kill via process handle if we have it
  if (voyagerProcess) {
    try {
      voyagerProcess.kill('SIGKILL');
    } catch (e) {
      // Ignore
    }
  }

  voyagerProcess = null;
  voyagerPid = null;
  currentState.running = false;
  currentState.currentTask = null;
  lastActivityTime = null;

  broadcastStatus();
  addLog('info', 'Voyager stopped');
}

function clearProgress() {
  if (voyagerProcess) {
    addLog('error', 'Stop Voyager before clearing progress');
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

    // Clear in-memory state
    currentState.completedTasks = [];
    currentState.failedTasks = [];
    currentState.skills = [];
    currentState.currentTask = null;
    logBuffer = [];

    // Notify clients
    broadcast({ type: 'state', ...currentState });
    addLog('info', 'Cleared all progress - bot will start fresh');
  } catch (e) {
    addLog('error', `Failed to clear: ${e.message}`);
  }
}

console.log('Voyager Control Server running on ws://localhost:8765');

// Periodic activity check - detect when bot goes inactive
let lastBroadcastedStatus = null;
setInterval(() => {
  if (currentState.running) {
    const currentStatus = getActivityStatus();
    if (currentStatus !== lastBroadcastedStatus) {
      lastBroadcastedStatus = currentStatus;
      broadcastStatus();
    }
  }
}, 5000); // Check every 5 seconds

// Cleanup on exit
process.on('SIGINT', () => {
  stopVoyager();
  process.exit();
});
