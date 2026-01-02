# VibeDev Toolkit - Quick Start Guide

Get up and running with VibeDev in 2 minutes.

## Installation

```bash
# Install Bun (if you haven't already)
curl -fsSL https://bun.sh/install | bash

# Clone and install VibeDev
git clone <repo-url>
cd vibecode-toolkit
bun install

# Link globally
bun link

# Verify installation
vibe --help
```

## Your First Capture

Let's capture your first bug context:

```bash
vibe capture "Testing the toolkit"
```

This will:
1. Prompt you to take a screenshot (press Space, then click & drag to select)
2. Gather git information from your current directory
3. Generate a markdown report in `.vibe/report-<timestamp>.md`

## Common Workflows

### 1. Quick Bug Report

When you encounter a bug:

```bash
# One command to capture everything
vibe capture "Login button returns 401"
```

Then share the generated `.vibe/report-*.md` file with Claude Code.

### 2. Filter Development Logs

Stop drowning in webpack spam:

```bash
# Real-time filtering
npm run dev 2>&1 | vibe logs

# Or paste logs
vibe logs
<paste your logs>
<press Ctrl+D>
```

### 3. Understand Cryptic Errors

```bash
vibe explain "TypeError: Cannot read property 'map' of undefined"
```

You'll get:
- Plain English explanation
- Common causes
- Quick fixes
- A Claude-ready prompt

### 4. Visual Regression Testing

```bash
# Before your changes
vibe snapshot before

# Make changes to your CSS/UI...

# After your changes
vibe snapshot after --compare before
```

This tells you if there are visual differences!

### 5. Review Git Changes

```bash
# Smart diff with full context
vibe diff --all

# Shows:
# - Branch and commit info
# - Staged + unstaged changes
# - Claude-ready summary
```

## Browser Extension Quick Start

### Install

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `browser-extension` folder

### Use

1. Browse to a page with an error
2. Click the VibeDev extension icon
3. Click "Capture Bug Context"
4. Copy the output
5. Share with Claude Code!

## Tips

### Add .vibe to .gitignore

```bash
echo ".vibe/" >> .gitignore
```

### Create an Alias

Add to your `.bashrc` or `.zshrc`:

```bash
alias bug="vibe capture"
alias debug="vibe diff && vibe capture"
```

Now you can just type `bug "description"` when you find issues!

### Pipe Logs Automatically

For Next.js:

```bash
# In package.json
{
  "scripts": {
    "dev:clean": "next dev 2>&1 | vibe logs"
  }
}
```

### Keyboard Shortcuts (future)

We're working on global hotkeys:
- `Cmd+Shift+V` - Instant capture
- `Cmd+Shift+S` - Snapshot
- `Cmd+Shift+L` - View logs

## Next Steps

- Read the [full README](../README.md)
- Check out [example outputs](../examples/)
- Install the [browser extension](../browser-extension/README.md)
- Join our Discord (coming soon!)

## Troubleshooting

### "Screenshot cancelled or failed"

On macOS, you need to grant Terminal permission to record the screen:
1. System Preferences → Security & Privacy → Screen Recording
2. Add Terminal (or your terminal app)

### "Not a git repository"

The `capture` command tries to get git info. If you're not in a git repo:
```bash
vibe capture --no-git "your description"
```

### Command not found: vibe

Did you run `bun link`? If yes, try:
```bash
# Use full path temporarily
bun run <path-to-vibecode-toolkit>/src/cli.ts capture
```

Or add to PATH:
```bash
export PATH="$PATH:/path/to/vibecode-toolkit"
```

## Getting Help

- Check `vibe <command> --help` for detailed options
- Read the [README](../README.md)
- Open an issue on GitHub

Happy vibecoding! 🎸
