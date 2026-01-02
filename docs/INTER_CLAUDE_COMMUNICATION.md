# Inter-Claude Communication - Design Document

## Vision

Enable VibeDev to act as a **communication bridge** between Claude Code instances, allowing:
- Direct tool integration (no manual copy/paste)
- Context sharing across sessions
- Team collaboration
- Real-time bug tracking

## Architecture Options

### Option 1: MCP Server Integration ⭐ (Recommended)

```
┌─────────────────┐
│  Claude Code    │
│   Instance A    │
└────────┬────────┘
         │
         │ MCP Protocol
         │ (stdio/HTTP)
         ▼
┌─────────────────────────────────┐
│   VibeDev MCP Server            │
│                                 │
│  Tools:                         │
│  - capture_bug_context()        │
│  - get_recent_captures()        │
│  - search_bug_history()         │
│  - share_with_team()            │
│  - subscribe_to_updates()       │
└─────────────────────────────────┘
         │
         │ Shared State
         ▼
┌─────────────────────────────────┐
│   Context Database              │
│   (.vibe/db.json)              │
│                                 │
│   - Bug captures               │
│   - Screenshots                │
│   - Git contexts               │
│   - Shared sessions            │
└─────────────────────────────────┘
         │
         │ MCP Protocol
         ▼
┌─────────────────┐
│  Claude Code    │
│   Instance B    │
└─────────────────┘
```

#### How It Works

**1. Claude Code discovers VibeDev MCP server:**

```json
// ~/.config/claude/config.json
{
  "mcpServers": {
    "vibedev": {
      "command": "bun",
      "args": ["run", "/path/to/vibecode-toolkit/mcp-server.ts"]
    }
  }
}
```

**2. VibeDev exposes tools to Claude:**

```typescript
// Mcp-server.ts
const tools = {
  capture_bug_context: {
    description: "Capture comprehensive bug context with screenshots, git diff, and system info",
    parameters: {
      description: { type: "string", required: true },
      includeScreenshot: { type: "boolean", default: true },
      shareWithTeam: { type: "boolean", default: false }
    }
  },

  get_recent_captures: {
    description: "Get recently captured bug contexts",
    parameters: {
      limit: { type: "number", default: 10 },
      since: { type: "string" } // ISO timestamp
    }
  },

  search_bug_history: {
    description: "Search through captured bug contexts",
    parameters: {
      query: { type: "string", required: true },
      type: { enum: ["error", "warning", "feature"] }
    }
  }
};
```

**3. Claude calls tools directly:**

```typescript
// Claude automatically calls VibeDev tools
const context = await tools.capture_bug_context({
  description: "Login button returns 401",
  includeScreenshot: true,
  shareWithTeam: false
});

// Claude receives full context immediately
console.log(context);
// {
//   timestamp: "2026-01-02T...",
//   screenshot: "/path/to/screenshot.png",
//   gitDiff: "...",
//   consoleErrors: [...],
//   systemInfo: {...}
// }
```

**4. User workflow:**

```
User: "I'm seeing a 401 error on login"

Claude: *automatically calls capture_bug_context()*
Claude: "I've captured the full context. I can see:
         - Screenshot shows the login form
         - Git diff reveals you changed the API endpoint
         - Console has CORS error

         The issue is..."
```

**No manual steps required!**

---

### Option 2: Team Sharing Server

```
┌──────────────┐           ┌──────────────┐
│ Developer A  │           │ Developer B  │
│ (San Francisco)          │ (New York)   │
└──────┬───────┘           └──────┬───────┘
       │                          │
       │ HTTP/WebSocket          │
       ▼                          ▼
┌────────────────────────────────────────┐
│      VibeDev Cloud Server              │
│      (Self-hosted or SaaS)             │
│                                        │
│  - Bug context storage                 │
│  - Real-time sync                      │
│  - Team channels                       │
│  - Search & analytics                  │
└────────────────────────────────────────┘
       │
       │ Webhook / SSE
       ▼
┌────────────────────────────────────────┐
│      Team Dashboard                    │
│      (Web UI)                          │
└────────────────────────────────────────┘
```

#### How It Works

**1. Developer A captures a bug:**

```bash
# Capture and share with team
vibe capture "auth bug" --share team-backend

# Or configure auto-share
vibe config set auto-share true
vibe config set team backend-team
```

**2. Server receives and broadcasts:**

```typescript
// VibeDev Cloud receives
POST /api/captures
{
  team: "backend-team",
  description: "auth bug",
  context: {...full context...},
  author: "dev-a@company.com"
}

// Broadcasts to team members
WebSocket → All online team members
Email → Offline team members (digest)
Slack → #bugs channel (integration)
```

**3. Developer B's Claude Code gets notified:**

```typescript
// Developer B's terminal
[VibeDev] New team capture from dev-a:
          "auth bug" - 2 minutes ago

          Run: vibe pull latest
          Or: vibe show <capture-id>

// Developer B pulls context
$ vibe pull latest

// Developer B's Claude Code now has full context
Claude: "I see the auth bug that dev-a captured.
         Looking at their git diff and screenshot..."
```

**4. Team collaboration:**

```bash
# Comment on a capture
vibe comment <id> "I think this is related to CORS config"

# Mark as resolved
vibe resolve <id> --solution "Updated nginx config"

# Search team captures
vibe search "auth" --team backend-team
```

---

### Option 3: Local IPC (Same Machine)

```
┌─────────────────────────────────────────────────┐
│            Same Machine                         │
│                                                 │
│  ┌──────────────┐      ┌──────────────┐       │
│  │ Claude Code  │      │ Claude Code  │       │
│  │  Terminal 1  │      │  Terminal 2  │       │
│  └──────┬───────┘      └──────┬───────┘       │
│         │                     │                │
│         │  Unix Socket        │                │
│         │  /tmp/vibedev.sock  │                │
│         └──────────┬──────────┘                │
│                    │                           │
│                    ▼                           │
│         ┌────────────────────┐                 │
│         │  VibeDev Daemon    │                 │
│         │  (Background)      │                 │
│         └────────────────────┘                 │
│                    │                           │
│                    ▼                           │
│         ┌────────────────────┐                 │
│         │  Shared Memory     │                 │
│         │  Context Store     │                 │
│         └────────────────────┘                 │
└─────────────────────────────────────────────────┘
```

#### How It Works

**1. Start VibeDev daemon:**

```bash
# Terminal 1
vibe daemon start

# Daemon starts listening on Unix socket
[VibeDev Daemon] Listening on /tmp/vibedev.sock
[VibeDev Daemon] Ready for connections
```

**2. Multiple Claude instances connect:**

```bash
# Terminal 2 - Claude Code Instance 1
vibe connect

# Terminal 3 - Claude Code Instance 2
vibe connect

# Both now share context in real-time
```

**3. Broadcast captures:**

```bash
# Terminal 2
vibe capture "bug in auth" --broadcast

# Terminal 3 receives immediately
[VibeDev] Received capture from Terminal 2:
          "bug in auth"

          Auto-loaded into context.
```

**4. Use cases:**

- **Pair programming**: Both developers' Claudes see same context
- **Multi-window debugging**: Capture in one terminal, debug in another
- **Context persistence**: Switch between Claude sessions without losing context

---

## Detailed Feature Specifications

### Feature 1: Auto-Capture on Error

**Concept**: Automatically capture context when errors occur

```typescript
// Claude Code hook integration
// ~/.config/claude/hooks/on-error.sh

#!/bin/bash
# Automatically called when Claude sees an error

ERROR_MESSAGE="$1"
SOURCE_FILE="$2"
LINE_NUMBER="$3"

# Capture context automatically
vibe capture "Auto-captured: $ERROR_MESSAGE" \
  --source "$SOURCE_FILE:$LINE_NUMBER" \
  --auto \
  --silent

# Return capture ID to Claude
echo "$CAPTURE_ID"
```

**Result**: Every error gets automatically documented with full context.

---

### Feature 2: Context Timeline

**Concept**: Track debugging session as a timeline

```bash
# Start a session
vibe session start "debugging-auth-issue"

# Actions are automatically logged
vibe capture "Initial error"
# ... make changes ...
vibe snapshot before
# ... more changes ...
vibe snapshot after
vibe capture "After fix attempt"

# View timeline
vibe session timeline

# Output:
# 🕐 14:30:00 - Session started: "debugging-auth-issue"
# 📸 14:31:23 - Captured: "Initial error" (ID: abc123)
# 📷 14:35:45 - Snapshot: "before"
# 📷 14:40:12 - Snapshot: "after"
# 📸 14:42:00 - Captured: "After fix attempt" (ID: def456)
# ✓ 14:45:00 - Session ended (15 minutes)

# Share entire session
vibe session share abc-session-id --with team
```

**Result**: Complete debugging narrative, shareable with team or future you.

---

### Feature 3: AI-to-AI Context Handoff

**Concept**: Seamlessly hand off context between Claude sessions

```typescript
// Session 1 - Working on frontend
Claude A: "I've identified the issue. It's a backend API problem."
User: "Let me ask the backend Claude"

// Claude A creates handoff
$ vibe handoff create \
  --to backend-claude \
  --summary "Frontend seeing 401 errors from /api/login" \
  --context-ids abc123,def456

[VibeDev] Handoff created: handoff-xyz789

// Session 2 - Backend Claude
$ vibe handoff receive handoff-xyz789

[VibeDev] Received handoff from frontend-claude:
          "Frontend seeing 401 errors from /api/login"

          Loaded context:
          - 2 bug captures
          - 1 screenshot
          - Git diff from frontend repo

Claude B: "I see the issue. The frontend is sending..."
```

**Result**: Context never lost between sessions or developers.

---

### Feature 4: Smart Context Suggestions

**Concept**: VibeDev suggests relevant past contexts

```typescript
// Claude detects similar error
User: "Getting TypeError: Cannot read property 'map' of undefined"

// VibeDev searches history
$ vibe suggest

[VibeDev] Found 3 similar past issues:

  1. ⭐ 95% match - 3 days ago
     "getUserEmails crashes with undefined users array"
     Resolution: Added null check
     Time to fix: 5 minutes

  2. 87% match - 1 week ago
     "Product list map error"
     Resolution: Used optional chaining
     Time to fix: 2 minutes

  3. 76% match - 2 weeks ago
     "Filter undefined array"
     Resolution: Initialize array in constructor

[VibeDev] Load context #1? [Y/n]
```

**Result**: Learn from past debugging sessions automatically.

---

## Implementation Roadmap

### Phase 1: MCP Server (Week 1-2)
- [ ] Basic MCP server implementation
- [ ] Core tools: capture, list, search
- [ ] Local storage backend
- [ ] Claude Code integration docs

### Phase 2: Real-time Features (Week 3-4)
- [ ] WebSocket support for live updates
- [ ] Context subscriptions
- [ ] Team channels (local first)
- [ ] Session management

### Phase 3: Cloud Server (Month 2)
- [ ] Self-hosted server option
- [ ] Authentication & authorization
- [ ] Team collaboration features
- [ ] Web dashboard

### Phase 4: Advanced Features (Month 3+)
- [ ] AI-powered context suggestions
- [ ] Context timeline & sessions
- [ ] Integration with GitHub/Linear
- [ ] Analytics & insights

---

## Technical Considerations

### Security

**MCP Server (Local)**:
- Runs in user's context
- No network access by default
- Sandboxed via Bun permissions

**Cloud Server**:
- End-to-end encryption for sensitive data
- Team-based access control
- Self-hosted option for security-conscious teams
- Audit logs for compliance

### Performance

**Local MCP**:
- Sub-10ms tool response time
- Async screenshot capture
- Lazy-load git operations

**Cloud Sync**:
- Delta sync (only changes)
- Compression for screenshots
- CDN for static assets
- WebSocket for real-time (fallback to polling)

### Privacy

**Data Storage**:
- Local-first architecture
- Cloud sync is opt-in
- Configurable data retention
- Easy export/delete

**Screenshot Handling**:
- Automatic PII detection (optional)
- Blur sensitive regions
- Don't upload unless explicitly shared

---

## Example Use Cases

### Use Case 1: Solo Developer

**Scenario**: Building a feature, encounter multiple bugs

```bash
# Start session
vibe session start "user-profile-feature"

# Bug 1
vibe capture "Avatar upload fails"
# Claude helps fix

# Bug 2
vibe capture "Profile form validation broken"
# Claude helps fix

# Review session
vibe session summary

# Output: Timeline, time spent, issues resolved, commits made
```

### Use Case 2: Remote Team

**Scenario**: Backend dev needs frontend context

```bash
# Frontend dev (Sarah)
vibe capture "API returning wrong data format" --share backend-team

# Backend dev (James) - Instant notification
[VibeDev] Sarah shared: "API returning wrong data format"

# James loads context
vibe pull latest

# James' Claude now has:
# - Sarah's screenshot
# - Network request/response
# - Frontend code expecting different format
# - Git diff showing recent API changes

# James fixes and shares back
vibe capture "Fixed API format" --share frontend-team --resolve sarah-capture-123
```

### Use Case 3: AI Pair Programming

**Scenario**: Two developers, two Claude instances, same problem

```bash
# Developer A's machine
vibe daemon start
vibe session start "refactoring-auth" --collaborative

# Developer B joins (same machine, different terminal)
vibe session join "refactoring-auth"

# Now both Claude instances see:
# - All captures from both developers
# - Real-time git changes
# - Shared context and discussion

# Developer A
vibe capture "Testing new auth flow"

# Developer B's Claude immediately gets context
# Both AIs can collaborate on the solution
```

---

## API Examples

### MCP Server API

```typescript
// capture_bug_context
{
  "method": "tools/call",
  "params": {
    "name": "capture_bug_context",
    "arguments": {
      "description": "Login fails with 401",
      "includeScreenshot": true,
      "tags": ["auth", "api"]
    }
  }
}

// Response
{
  "content": [{
    "type": "text",
    "text": "Captured bug context (ID: cap_abc123)"
  }, {
    "type": "image",
    "data": "base64...",
    "mimeType": "image/png"
  }, {
    "type": "resource",
    "uri": "vibedev://captures/cap_abc123",
    "mimeType": "text/markdown",
    "text": "# Bug Report\n\n..."
  }]
}
```

### Cloud API

```typescript
// POST /api/v1/captures
{
  "team_id": "team_xyz",
  "description": "Auth bug",
  "context": {
    "screenshot": "...",
    "gitDiff": "...",
    "errors": [...]
  },
  "tags": ["auth"],
  "visibility": "team" // "private" | "team" | "public"
}

// GET /api/v1/captures
{
  "team_id": "team_xyz",
  "since": "2026-01-01T00:00:00Z",
  "tags": ["auth"],
  "limit": 10
}

// WebSocket - Real-time updates
ws://api.vibedev.io/v1/stream?team=team_xyz

// Receives:
{
  "type": "capture.created",
  "data": {
    "id": "cap_abc123",
    "author": "dev-a",
    "description": "Auth bug",
    ...
  }
}
```

---

## Configuration

```json
// ~/.vibe/config.json
{
  "mcp": {
    "enabled": true,
    "port": 3000,
    "tools": ["capture", "search", "list"]
  },

  "team": {
    "enabled": false,
    "server": "https://vibedev.company.com",
    "team_id": "backend-team",
    "auto_share": false,
    "api_key": "env:VIBEDEV_API_KEY"
  },

  "daemon": {
    "socket": "/tmp/vibedev.sock",
    "auto_start": true
  },

  "privacy": {
    "blur_screenshots": false,
    "detect_pii": true,
    "exclude_files": [".env", "*.key"]
  }
}
```

---

## Getting Started (Future)

### Install MCP Server

```bash
# Configure Claude Code to use VibeDev MCP server
vibe install mcp

# This adds to ~/.config/claude/config.json:
# {
#   "mcpServers": {
#     "vibedev": {
#       "command": "vibe",
#       "args": ["mcp-server"]
#     }
#   }
# }

# Restart Claude Code
# VibeDev tools now available automatically!
```

### Enable Team Sharing

```bash
# Self-hosted server
vibe server start --port 3000

# Or connect to cloud
vibe auth login
vibe team join backend-team

# Configure auto-share
vibe config set auto-share true
```

---

## Questions & Answers

**Q: Does this require internet?**
A: MCP server works 100% offline. Team sharing requires connectivity.

**Q: Can I use this with existing bug trackers?**
A: Yes! Integrations with GitHub Issues, Linear, Jira coming in Phase 3.

**Q: How much does the cloud version cost?**
A: Open source self-hosted is free. SaaS pricing TBD (likely freemium).

**Q: Is my data secure?**
A: Local-first design. Cloud sync is opt-in and encrypted. Self-hosted option available.

**Q: Does it work with other AI assistants?**
A: MCP is a standard protocol. Works with any MCP-compatible AI tool.

---

**Status**: Design Document
**Next Step**: Implement Phase 1 (MCP Server) based on feedback
**Timeline**: 2-3 months for full implementation
**Difficulty**: Medium (MCP) to Hard (Cloud infra)

---

Ready to move forward? We can start with the MCP server implementation, which would give you direct Claude Code integration!
