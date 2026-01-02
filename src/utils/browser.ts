import type { BrowserInfo } from '../types/index.js';

/**
 * Attempts to read browser console logs from Chrome DevTools
 * Note: This is a placeholder. Full implementation requires browser extension.
 */
export async function getBrowserConsole(): Promise<BrowserInfo | null> {
  // This will be implemented via the browser extension
  // For now, we'll return null and provide instructions
  return null;
}

/**
 * Gets browser console from a log file (if user exported it)
 */
export async function parseBrowserLog(logPath: string): Promise<BrowserInfo> {
  const file = Bun.file(logPath);
  const content = await file.text();

  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  // Parse console log format
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('Error') || line.includes('error')) {
      consoleErrors.push(line);
    }
    if (line.includes('Failed to load') || line.includes('404') || line.includes('500')) {
      networkErrors.push(line);
    }
  }

  return {
    consoleErrors,
    networkErrors,
  };
}

/**
 * Instructions for manually capturing browser console
 */
export function getBrowserCaptureInstructions(): string {
  return `
To capture browser console logs:

Chrome/Edge:
1. Open DevTools (F12 or Cmd+Opt+I)
2. Go to Console tab
3. Right-click and select "Save as..."
4. Save the log file
5. Run: vibe capture --browser-log <path-to-log>

Firefox:
1. Open DevTools (F12)
2. Go to Console tab
3. Right-click and select "Export Visible Messages to File"
4. Save and use with: vibe capture --browser-log <path-to-log>

Or install the VibeDev browser extension for one-click capture!
`.trim();
}
