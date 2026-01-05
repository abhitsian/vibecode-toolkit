# VibeDev Standalone App Architecture

## Why Standalone App?

Browser extensions are **too limited** for the full VibeDev vision:
- Can't capture desktop app bugs
- Can't do screen/video recording
- No global hotkeys
- Limited to browser context

A **standalone app** can capture EVERYTHING, EVERYWHERE.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VibeDev App                          │
│                  (Menu Bar / System Tray)               │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Browser    │  │   Desktop    │  │   Terminal   │
│  Plugin      │  │  Capture     │  │   Monitor    │
│              │  │              │  │              │
│ - Deep DOM   │  │ - Screen rec │  │ - Error logs │
│ - Network    │  │ - Window ctx │  │ - Git state  │
│ - Console    │  │ - Process    │  │ - Commands   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
           ┌──────────────────────────┐
           │   Capture Engine         │
           │   - Screenshots          │
           │   - Video recording      │
           │   - Audio (optional)     │
           │   - Mouse/keyboard track │
           │   - Timeline builder     │
           └──────────────────────────┘
                         │
                         ▼
           ┌──────────────────────────┐
           │   Storage & Sync         │
           │   - Local DB             │
           │   - .vibe/ integration   │
           │   - Cloud sync (opt)     │
           └──────────────────────────┘
                         │
                         ▼
           ┌──────────────────────────┐
           │   Outputs                │
           │   - Markdown reports     │
           │   - Video files          │
           │   - MCP server           │
           │   - Team sharing         │
           └──────────────────────────┘
```

## Core Components

### 1. Menu Bar App (macOS) / System Tray (Windows/Linux)

```
┌─────────────────────────┐
│  🎸 VibeDev            │
├─────────────────────────┤
│  ⌨️  Quick Capture      │  Cmd+Shift+V
│  🎥 Start Recording     │  Cmd+Shift+R
│  📸 Screenshot          │  Cmd+Shift+S
│  ⏸️  Pause Monitoring   │
├─────────────────────────┤
│  Recent Captures        │
│    • Auth bug (2m ago)  │
│    • UI glitch (5m ago) │
├─────────────────────────┤
│  ⚙️  Settings           │
│  📊 Dashboard           │
│  🚀 Quit VibeDev        │
└─────────────────────────┘
```

**Features:**
- Always running in background
- Global hotkeys work from ANY app
- Quick access to recent captures
- Settings and preferences

### 2. Capture Engine

**Screenshot Capture:**
```typescript
interface ScreenCapture {
  captureFullScreen(): Promise<Image>;
  captureWindow(windowId: string): Promise<Image>;
  captureRegion(rect: Rectangle): Promise<Image>;
  captureInteractive(): Promise<Image>; // User selects region
}
```

**Video Recording:**
```typescript
interface VideoRecorder {
  startRecording(options: {
    includeAudio?: boolean;
    includeCursor?: boolean;
    fps?: number;
    quality?: 'low' | 'medium' | 'high';
  }): void;

  stopRecording(): Promise<VideoFile>;

  addAnnotation(text: string, timestamp: number): void;
  addMarker(label: string): void; // "Bug appears here"
}
```

**Context Gathering:**
```typescript
interface ContextCollector {
  // Detect which app is active
  getActiveApp(): {
    name: string;
    pid: number;
    window: string;
    type: 'browser' | 'terminal' | 'ide' | 'other';
  };

  // Get app-specific context
  getBrowserContext(): BrowserInfo; // If Chrome/Firefox
  getTerminalContext(): TerminalInfo; // If Terminal/iTerm
  getIDEContext(): IDEInfo; // If VSCode/Cursor

  // System context
  getSystemInfo(): SystemInfo;
  getGitContext(): GitInfo;
  getProcessLogs(pid: number): LogLines;
}
```

### 3. Browser Plugin (Optional Enhancement)

**Native Messaging:**
```javascript
// Browser extension sends to app
chrome.runtime.sendNativeMessage('com.vibedev.app', {
  type: 'capture',
  context: {
    url: window.location.href,
    console: capturedErrors,
    network: failedRequests,
    localStorage: {...},
  }
}, response => {
  console.log('App received context');
});
```

**App receives:**
```typescript
// Native messaging host
app.on('browser-message', (message) => {
  // Combine browser context with app context
  const fullCapture = {
    ...message.context, // Deep browser data
    screenshot: takeScreenshot(),
    gitDiff: getGitDiff(),
    systemInfo: getSystemInfo(),
  };

  createCapture(fullCapture);
});
```

### 4. Terminal Monitor

**Error Detection:**
```typescript
interface TerminalMonitor {
  // Monitor terminal output
  watchTerminal(terminalPid: number): void;

  // Auto-detect errors
  onError(callback: (error: {
    message: string;
    stackTrace: string;
    command: string;
    timestamp: Date;
  }) => void): void;

  // Auto-capture on crash
  autoCaptureOnCrash: boolean;
}
```

**Implementation (macOS):**
```typescript
// Use Accessibility API or AppleScript
const terminal = getActiveTerminal();
const output = terminal.getRecentOutput(100); // Last 100 lines

// Pattern match for errors
if (output.match(/Error:|Exception:|FAIL:/)) {
  autoCapture({
    description: 'Terminal error detected',
    context: output,
  });
}
```

## Technology Stack

### Option A: Electron (Cross-platform)

**Pros:**
- ✅ Cross-platform (macOS, Windows, Linux)
- ✅ Web technologies (TypeScript, React)
- ✅ Easy browser integration
- ✅ Fast development

**Cons:**
- ❌ Large bundle size (~100MB)
- ❌ Higher resource usage
- ❌ Less native feel

### Option B: Native (Recommended)

**macOS:** Swift + SwiftUI
**Windows:** C# + WPF or Rust
**Linux:** Rust + GTK

**Pros:**
- ✅ Small bundle (~10MB)
- ✅ Low resource usage
- ✅ Native OS integration
- ✅ Better performance
- ✅ System APIs (screen recording, accessibility)

**Cons:**
- ❌ Separate codebases per platform
- ❌ Longer development time

### Option C: Tauri (Best of Both)

**Hybrid:** Rust backend + Web frontend

**Pros:**
- ✅ Small bundle (~15MB)
- ✅ Fast performance
- ✅ Cross-platform
- ✅ Web UI (TypeScript/React)
- ✅ Native APIs via Rust

**Cons:**
- ⚠️ Less mature than Electron
- ⚠️ Some platform-specific code needed

**Recommendation:** Start with **Tauri**

## Key Features

### 1. Global Hotkeys

```typescript
// Register system-wide
registerHotkey('Cmd+Shift+V', () => {
  captureQuick();
});

registerHotkey('Cmd+Shift+R', () => {
  startRecording();
});

registerHotkey('Cmd+Shift+S', () => {
  captureScreenshotInteractive();
});
```

### 2. Smart Context Detection

```typescript
async function captureContext() {
  const activeApp = getActiveApp();

  let context = {};

  if (activeApp.type === 'browser') {
    // Get browser plugin data if available
    context = await getBrowserContext();
  } else if (activeApp.type === 'terminal') {
    context = await getTerminalOutput();
  } else if (activeApp.type === 'ide') {
    context = await getIDEContext();
  }

  return {
    app: activeApp,
    screenshot: await captureWindow(activeApp.windowId),
    context,
    git: await getGitContext(),
    system: getSystemInfo(),
  };
}
```

### 3. Video Recording with Timeline

```typescript
// Start recording
const recording = recorder.start({
  includeAudio: true,
  includeCursor: true,
  fps: 30,
});

// User triggers events
recording.addMarker('Bug appears');
recording.addMarker('Clicked submit button');
recording.addMarker('Error displayed');

// Stop and process
const video = await recording.stop();

// Generate timeline
const timeline = {
  duration: video.duration,
  markers: [
    { time: 5.2, label: 'Bug appears' },
    { time: 8.7, label: 'Clicked submit button' },
    { time: 10.1, label: 'Error displayed' },
  ],
};

// Export with annotations
exportVideo(video, {
  timeline,
  overlayText: true,
  highlightClicks: true,
});
```

### 4. Auto-Capture on Crash

```typescript
// Monitor for app crashes
crashDetector.on('crash', (app) => {
  // Automatically capture:
  // 1. Screenshot before crash
  // 2. App logs
  // 3. System state
  // 4. Last 30 seconds of video (if recording)

  autoCapture({
    type: 'crash',
    app: app.name,
    screenshot: getLastScreenshot(),
    logs: getAppLogs(app.pid),
    video: getVideoBuffer(), // Last 30 sec
  });
});
```

### 5. Background Monitoring

```typescript
// Optional: Always monitor for errors
const monitor = new BackgroundMonitor({
  watchApps: ['Chrome', 'Terminal', 'VSCode'],
  captureOnError: true,
  videoBuffer: 30, // Keep last 30 sec in memory
});

monitor.on('error-detected', (error) => {
  // Notify user via notification
  showNotification({
    title: 'Error detected',
    body: error.message,
    actions: [
      { label: 'Capture', onClick: () => capture(error) },
      { label: 'Ignore', onClick: () => {} },
    ],
  });
});
```

## Integration with Existing CLI

```typescript
// CLI calls the app via IPC
// vibe capture "description"

// CLI code:
import { ipcClient } from './ipc';

const result = await ipcClient.send('capture', {
  description: args.description,
  includeScreenshot: !args.noScreenshot,
});

console.log('Captured:', result.id);
```

## Comparison: Extension vs Standalone

### Capture Capabilities

| What to Capture | Browser Ext | Standalone |
|-----------------|-------------|------------|
| Browser console | ✅✅ | ✅ |
| Network requests | ✅✅ | ✅ |
| DOM state | ✅✅ | ⚠️ |
| Desktop apps | ❌ | ✅✅ |
| Terminal errors | ❌ | ✅✅ |
| IDE context | ❌ | ✅✅ |
| Screen recording | ❌ | ✅✅ |
| Video recording | ❌ | ✅✅ |
| System logs | ❌ | ✅✅ |
| Crash detection | ❌ | ✅✅ |

### User Experience

| Feature | Browser Ext | Standalone |
|---------|-------------|------------|
| Global hotkeys | ❌ | ✅✅ |
| Works everywhere | ❌ | ✅✅ |
| Auto-capture | ❌ | ✅✅ |
| Background monitoring | ❌ | ✅✅ |
| One-click install | ✅ | ⚠️ |
| Always available | ⚠️ | ✅✅ |

## Recommended Architecture

```
VibeDev Standalone App (Core)
├── Menu bar app (always running)
├── Global capture hotkeys
├── Screen/video recording
├── Multi-app context detection
├── MCP server for Claude integration
├── Local storage + sync
└── Optional plugins:
    ├── Browser extension (deep browser context)
    ├── VSCode extension (IDE context)
    └── CLI (backward compatibility)
```

## Migration Path

**Phase 1:** Keep existing CLI + Extension
**Phase 2:** Build standalone app prototype (macOS)
**Phase 3:** Add browser plugin to standalone
**Phase 4:** Windows + Linux versions
**Phase 5:** Deprecate pure browser extension

## Implementation Priority

1. **macOS Standalone App** (Tauri)
   - Menu bar presence
   - Global hotkey for capture
   - Screenshot capture
   - Git context integration
   - Basic video recording

2. **Browser Plugin**
   - Native messaging to app
   - Console/network capture
   - Send to standalone app

3. **CLI Integration**
   - CLI calls app via IPC
   - Backward compatibility

4. **Advanced Features**
   - Terminal monitoring
   - Crash detection
   - Background monitoring
   - Team sync

## Conclusion

**Standalone app is the right architecture** because:
- ✅ Captures EVERYTHING (browser, desktop, terminal)
- ✅ Works everywhere with global hotkeys
- ✅ Enables video recording (your request!)
- ✅ Better user experience
- ✅ More powerful features
- ✅ Aligns with "capture what you see" vision

Browser extension should be a **plugin** to the standalone app, not the primary solution.
