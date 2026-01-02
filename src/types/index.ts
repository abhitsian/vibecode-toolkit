// Core types for vibecode-toolkit

export interface BugContext {
  timestamp: string;
  description?: string;
  screenshot?: string;
  gitDiff?: string;
  gitBranch?: string;
  gitCommit?: string;
  consoleErrors?: string[];
  browserInfo?: BrowserInfo;
  systemInfo?: SystemInfo;
}

export interface BrowserInfo {
  url?: string;
  consoleErrors?: string[];
  networkErrors?: string[];
  localStorage?: Record<string, any>;
  sessionStorage?: Record<string, any>;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion?: string;
  bunVersion?: string;
}

export interface CaptureOptions {
  output?: string;
  clipboard?: boolean;
  browser?: boolean;
  git?: boolean;
  screenshot?: boolean;
  description?: string;
}

export interface SnapshotData {
  name: string;
  timestamp: string;
  screenshot: string;
  hash: string;
}

export interface LogFilter {
  exclude?: string[];
  include?: string[];
  level?: 'error' | 'warn' | 'info' | 'debug' | 'all';
}
