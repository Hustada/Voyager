export interface BotStatus {
  connected: boolean;
  health: number;
  hunger: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  biome: string;
  timeOfDay: string;
  equipment: (string | null)[];
}

export interface InventoryItem {
  name: string;
  count: number;
}

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  attempts: number;
  timestamp: string;
  code?: string;
}

export interface Skill {
  name: string;
  description: string;
  code: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'action' | 'critic' | 'curriculum' | 'skill' | 'error' | 'info';
  message: string;
}

export interface CodeEntry {
  id: string;
  task: string;
  code: string;
  timestamp: string;
  success?: boolean;
}

export interface VoyagerState {
  status: BotStatus;
  inventory: InventoryItem[];
  currentTask: Task | null;
  completedTasks: string[];
  failedTasks: string[];
  skills: Skill[];
  logs: LogEntry[];
  currentCode: CodeEntry | null;
  codeHistory: CodeEntry[];
}
