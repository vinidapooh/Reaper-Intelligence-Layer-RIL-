
export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  ROADMAP = 'ROADMAP',
  KNOWLEDGE = 'KNOWLEDGE',
  SETTINGS = 'SETTINGS',
  CHATS = 'CHATS'
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // base64 for images/binary, text content for text files
  isImage: boolean;
}

export interface LogEntry {
  id: string;
  type: 'system' | 'user' | 'ai' | 'info' | 'error' | 'success' | 'audio-cue';
  message: string;
  code?: string;
  manualSteps?: string[];
  actionIds?: string[];
  timestamp: Date;
  isExecuted?: boolean;
  transcription?: string;
  attachments?: Attachment[];
}

export interface Chat {
  id: string;
  title: string;
  logs: LogEntry[];
  createdAt: Date;
  updatedAt: Date;
  projectState?: {
    tracks: string[];
    selectedCount: number;
    lastAction: string;
    detectedGroove?: number; // BPM or Deviation %
  };
}

export interface AIResponse {
  luaCode?: string;
  manualSteps?: string[];
  actionIds?: string[];
  explanation?: string;
  error?: string;
  groundingUrls?: string[];
  projectInspection?: boolean;
  grooveLogic?: boolean; // If true, triggers the groove analysis UI
}
