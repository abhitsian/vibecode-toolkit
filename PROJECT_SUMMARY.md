# VibeDev Toolkit - Project Summary

## Overview

VibeDev Toolkit is a comprehensive solution for vibecoders to capture, debug, and communicate issues more effectively when working with AI assistants like Claude Code.

## What We Built

### 1. CLI Tool (5 Commands)

#### `vibe capture [description]`
- **Purpose**: One-command bug context snapshot
- **Features**:
  - Interactive screenshot capture (platform-specific)
  - Git diff, status, branch, commit info
  - System information (platform, arch, runtime versions)
  - Claude-ready markdown output
- **Output**: `.vibe/report-<timestamp>.md`

#### `vibe logs [options]`
- **Purpose**: Filter development server noise
- **Features**:
  - Removes webpack/HMR/Vite spam
  - Highlights errors and warnings
  - Custom include/exclude patterns
  - Supports piping from dev servers
- **Use Case**: Clean logs for sharing with Claude

#### `vibe explain [error]`
- **Purpose**: Translate cryptic errors into plain English
- **Features**:
  - Pattern matching for common errors
  - Explanations, common causes, quick fixes
  - Auto-generated Claude prompts
  - Supports stdin for pasting errors
- **Patterns**: 10+ common error patterns

#### `vibe snapshot <name>`
- **Purpose**: Before/after screenshot comparison
- **Features**:
  - Named snapshot management
  - Hash-based diff detection
  - List, compare, and delete snapshots
  - Visual regression testing workflow
- **Storage**: `.vibe/snapshots.json`

#### `vibe diff [options]`
- **Purpose**: Smart git diffs with context
- **Features**:
  - Extended context (10+ lines)
  - Shows staged and unstaged changes
  - Recent commits and branch info
  - Claude-ready summary
  - Syntax highlighting

### 2. Browser Extension

#### Chrome Extension Structure
- **manifest.json**: Chrome extension v3 manifest
- **popup/**: One-click capture UI
  - Beautiful dark theme UI
  - Real-time capture status
  - Clipboard copy functionality
- **content/**: Page context injection
  - Console error interception
  - Network request monitoring
  - Unhandled error/rejection capture
  - localStorage/sessionStorage capture
- **background/**: Service worker

#### Features
- Real-time error tracking
- Network failure detection
- DOM state capture
- One-click report generation
- Claude-ready markdown output

### 3. Documentation

#### Main Docs
- **README.md**: Comprehensive project documentation
- **QUICKSTART.md**: 2-minute getting started guide
- **Browser Extension README**: Installation and usage

#### Examples
- **bug-report-example.md**: Sample capture output
- **explain-output-example.md**: Sample error explanations
- **ICONS.md**: Instructions for creating extension icons

## Technology Stack

### CLI
- **Runtime**: Bun (with Node.js compatibility)
- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **Styling**: Chalk (colors) + Ora (spinners)
- **Screenshot**: Platform-specific (screencapture on macOS)
- **Git**: Native git CLI via Bun.$

### Browser Extension
- **Manifest Version**: 3 (Chrome)
- **Language**: Vanilla JavaScript
- **Permissions**: activeTab, storage
- **Architecture**: Content script + Popup + Background worker

## Project Structure

```
vibecode-toolkit/
├── src/
│   ├── cli.ts                  # Main CLI entry point
│   ├── commands/
│   │   ├── capture.ts          # Bug context capture
│   │   ├── logs.ts             # Smart log filtering
│   │   ├── explain.ts          # Error translator
│   │   ├── snapshot.ts         # Screenshot comparison
│   │   └── diff.ts             # Smart git diff
│   ├── utils/
│   │   ├── screenshot.ts       # Platform screenshot capture
│   │   ├── git.ts              # Git utilities
│   │   ├── formatter.ts        # Markdown formatters
│   │   └── browser.ts          # Browser log parsing
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── browser-extension/
│   ├── manifest.json
│   ├── popup/
│   │   ├── popup.html          # Extension popup UI
│   │   └── popup.js            # Capture logic
│   ├── content/
│   │   └── content.js          # Error interception
│   ├── background/
│   │   └── background.js       # Service worker
│   └── icons/
│       └── ICONS.md            # Icon creation guide
├── docs/
│   └── QUICKSTART.md           # Quick start guide
├── examples/
│   ├── bug-report-example.md   # Example capture output
│   └── explain-output-example.md
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Key Features

### Developer Experience
- **Zero Config**: Works out of the box
- **Fast**: Built with Bun for speed
- **Cross-Platform**: macOS, Linux (Windows partial)
- **Claude-Optimized**: All output formatted for AI consumption
- **Non-Intrusive**: All files in `.vibe/` directory

### Output Quality
- **Rich Context**: Git + screenshot + system info
- **Clean Formatting**: Syntax-highlighted markdown
- **Relevant Info**: Filters noise, keeps signal
- **Shareable**: Easy to copy/paste or save

## Installation & Usage

### Install
```bash
git clone <repo>
cd vibecode-toolkit
bun install
bun link
```

### Use
```bash
vibe capture "bug description"
vibe logs < dev-server-output.txt
vibe explain "error message"
vibe snapshot before
vibe diff --all
```

## Future Roadmap

### Near Term (v0.2)
- [ ] Session replay recording
- [ ] Video capture
- [ ] Windows screenshot support
- [ ] More error patterns

### Medium Term (v0.3)
- [ ] VSCode extension
- [ ] GitHub/Linear integration
- [ ] Custom templates
- [ ] Config file support

### Long Term (v1.0)
- [ ] AI-powered auto-fix
- [ ] Visual diff viewer
- [ ] Real-time collaboration
- [ ] Cloud sync

## Impact

VibeDev Toolkit solves the **communication gap** in AI-assisted development:

**Before**: "The login button doesn't work"
- 5 min explaining the issue
- Back-and-forth clarification
- Missing context
- Scattered screenshots

**After**: `vibe capture "login issue"`
- 5 sec to capture everything
- All context in one file
- Share and get help immediately

## Design Decisions

### Why Bun?
- Faster than Node.js
- Built-in TypeScript support
- Modern JavaScript runtime
- Easy `$` shell syntax

### Why Markdown Output?
- Human-readable
- AI-friendly
- Version control compatible
- Shareable via any medium

### Why .vibe Directory?
- Non-intrusive
- Easy to .gitignore
- Organized outputs
- Conventional location

### Why Vanilla JS for Extension?
- No build step required
- Fast development
- Easy to modify
- Small bundle size

## Success Metrics

A successful vibecode session with this toolkit:
1. Bug encountered → `vibe capture` → 5 seconds
2. Context shared with Claude → Immediate
3. Issue understood → First try
4. Fix applied → Verified with `vibe snapshot`

**Goal**: Reduce debugging communication overhead from minutes to seconds.

## Credits

Built with Claude Code for vibecoders everywhere.

Inspired by the simple idea: **Show, don't tell.**
