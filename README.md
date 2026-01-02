# VibeDev Toolkit

A comprehensive toolkit for vibecoders to capture, debug, and communicate issues more effectively with AI assistants like Claude Code.

## The Problem

When vibecoding (rapidly iterating with AI assistance), the biggest friction is **communicating what's wrong**:
- Screenshots scattered across folders
- Console logs buried in terminal spam
- Git diffs without context
- Cryptic error messages
- No easy way to capture "what I'm seeing"

## The Solution

VibeDev Toolkit provides **one-command context capture** and utilities to make debugging with AI seamless.

## Features

### CLI Tools

- **`vibe capture`** - Comprehensive bug context snapshot
  - Interactive screenshot capture
  - Git diff and status
  - System information
  - Claude-ready markdown output

- **`vibe logs`** - Smart log filtering
  - Filter out webpack/HMR noise
  - Highlight errors and warnings
  - Custom include/exclude patterns

- **`vibe explain`** - Error translator
  - Plain English explanations of cryptic errors
  - Common causes and quick fixes
  - Auto-generated Claude prompts

- **`vibe snapshot`** - Before/after screenshots
  - Compare visual changes
  - Hash-based diff detection
  - Named snapshot management

- **`vibe diff`** - Smart git diffs
  - Extended context (10+ lines)
  - Claude-friendly formatting
  - Stats and summaries

### Browser Extension

- Real-time error capture
- One-click bug reports
- Storage inspection
- Network error tracking

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime (or Node.js)

### CLI Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd vibecode-toolkit

# Install dependencies
bun install

# Link the CLI globally
bun link

# Now use anywhere!
vibe --help
```

### Browser Extension

See [browser-extension/README.md](browser-extension/README.md) for installation instructions.

## Quick Start

### Capture Bug Context

```bash
vibe capture "Login button doesn't work"
```

This captures:
- Screenshot (interactive selection)
- Git branch, commit, and diff
- System information
- Generates a Claude-ready markdown report

### Filter Noisy Logs

```bash
npm run dev | vibe logs
```

Or paste logs:

```bash
vibe logs
# Paste your logs, then Ctrl+D
```

### Explain an Error

```bash
vibe explain "TypeError: Cannot read property 'map' of undefined"
```

### Before/After Comparison

```bash
# Capture "before"
vibe snapshot before

# Make your changes...

# Capture and compare
vibe snapshot after --compare before
```

### Smart Git Diff

```bash
vibe diff --all
```

## Usage Examples

### Example 1: Bug Report Workflow

```bash
# Reproduce the bug
# Then capture everything:
vibe capture "User profile image not loading"

# Opens: .vibe/report-<timestamp>.md
# Share this file with Claude Code!
```

### Example 2: Visual Regression Testing

```bash
# Before changes
vibe snapshot baseline

# Make CSS changes...

# After changes
vibe snapshot updated --compare baseline

# Instantly see if there are visual differences
```

### Example 3: Debugging with Filtered Logs

```bash
# Run dev server with filtered output
npm run dev 2>&1 | vibe logs --level error

# Or save to file
npm run dev 2>&1 | vibe logs > clean-logs.txt
```

## Output Structure

All VibeDev files are stored in `.vibe/` directory:

```
.vibe/
├── report-<timestamp>.md       # Bug reports
├── snapshot-<name>-<time>.png  # Screenshots
└── snapshots.json              # Snapshot metadata
```

Add `.vibe/` to your `.gitignore`:

```bash
echo ".vibe/" >> .gitignore
```

## Configuration

VibeDev works out of the box with sensible defaults. Future versions will support:
- Custom log filters
- Screenshot preferences
- Output templates
- Integration with issue trackers

## Tips for Using with Claude Code

1. **Capture First, Debug Second**
   - Always run `vibe capture` before asking for help
   - Share the generated markdown file

2. **Filter Logs Before Sharing**
   - Don't overwhelm Claude with webpack spam
   - Use `vibe logs` to get clean output

3. **Use Snapshots for Visual Bugs**
   - "The layout looks wrong" → Show before/after screenshots
   - `vibe snapshot` makes this instant

4. **Explain First, Then Ask**
   - Run `vibe explain` on the error first
   - If still stuck, share the full context

## Development

### Project Structure

```
vibecode-toolkit/
├── src/
│   ├── cli.ts              # Main CLI entry
│   ├── commands/           # Individual commands
│   ├── utils/              # Utilities (screenshot, git, etc.)
│   └── types/              # TypeScript types
├── browser-extension/      # Chrome extension
├── docs/                   # Documentation
└── examples/               # Example outputs
```

### Running Locally

```bash
# Run without installing
bun run src/cli.ts capture

# Run tests (when available)
bun test

# Build
bun run build
```

### Contributing

Contributions welcome! Areas to improve:
- [ ] Windows screenshot support
- [ ] Session replay recording
- [ ] Integration with GitHub Issues
- [ ] VSCode extension
- [ ] More error patterns in `explain`
- [ ] Diff visualization

## Roadmap

- **v0.2**: Session replay, video recording
- **v0.3**: VSCode extension integration
- **v0.4**: GitHub/Linear issue creation
- **v1.0**: Full automation - AI fixes bugs autonomously

## Why "VibeDev"?

Vibecoding is about rapid iteration with AI. But the "vibe" breaks when you spend 5 minutes explaining what's wrong instead of 5 seconds capturing it. VibeDev bridges that gap.

## License

MIT

## Credits

Built for vibecoders, by vibecoders.

Inspired by the frustration of explaining "you know that thing that's broken? yeah, that thing."

---

**Made with Claude Code** 🎸
