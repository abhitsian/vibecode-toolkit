# VibeDev: Developer Activity Tracker

## Expanded Vision

VibeDev is not just a bug capture tool - it's a **comprehensive developer activity tracker** that:

1. **Tracks all Claude Code instances** (what you're working on right now)
2. **Logs project history** (every app you've built)
3. **Records development sessions** (timeline of your work)
4. **Captures context automatically** (bugs, features, decisions)
5. **Connects everything** (link bugs to projects to Claude instances)

## The Big Picture

```
┌──────────────────────────────────────────────────────────┐
│              VibeDev Activity Dashboard                  │
│                                                          │
│  Active Now (Real-time)                                 │
│  ├─ 🤖 Claude Instance #1: "vibecode-toolkit"          │
│  │   └─ Working on: Standalone app architecture        │
│  ├─ 🤖 Claude Instance #2: "my-saas-app"              │
│  │   └─ Working on: Auth bug fix                       │
│  └─ 🤖 Claude Instance #3: "ml-project"                │
│      └─ Working on: Training pipeline                   │
│                                                          │
│  Projects (Historical)                                  │
│  ├─ vibecode-toolkit (Jan 2026, Active)                │
│  ├─ my-saas-app (Dec 2025, 23 days)                    │
│  ├─ portfolio-site (Nov 2025, 5 days)                  │
│  └─ + 47 more projects                                  │
│                                                          │
│  Today's Activity                                        │
│  ├─ 09:00 Started "vibecode-toolkit"                   │
│  ├─ 09:15 Captured bug "API format mismatch"           │
│  ├─ 10:30 Fixed bug (25 min to resolve)                │
│  ├─ 11:00 Started recording screen demo                │
│  └─ 11:45 Committed "Add standalone app"               │
└──────────────────────────────────────────────────────────┘
```

## Core Features

### 1. Claude Instance Tracking

**Detect Active Instances:**
```typescript
interface ClaudeInstance {
  id: string;
  pid: number;
  workingDirectory: string;
  projectName: string;
  startTime: Date;
  currentTask?: string;
  recentCaptures: Capture[];
  gitBranch?: string;
}

// Auto-detect running Claude Code instances
const instances = await detectClaudeInstances();

// Example output:
[
  {
    id: 'claude-abc123',
    pid: 12345,
    workingDirectory: '/Users/vaibhav/vibecode-toolkit',
    projectName: 'vibecode-toolkit',
    startTime: '2026-01-02T09:00:00Z',
    currentTask: 'Building standalone app',
    gitBranch: 'main',
  },
  {
    id: 'claude-def456',
    pid: 67890,
    workingDirectory: '/Users/vaibhav/my-saas-app',
    projectName: 'my-saas-app',
    startTime: '2026-01-02T10:30:00Z',
    gitBranch: 'feature/auth-fix',
  }
]
```

**How Detection Works:**

```bash
# Detect Claude Code processes
ps aux | grep "claude" | grep -v grep

# Or use system APIs
# macOS: NSRunningApplication
# Linux: /proc filesystem
# Windows: Windows Management Instrumentation (WMI)
```

**Link Captures to Instances:**
```typescript
// When user presses Cmd+Shift+V
const activeInstance = getActiveClaudeInstance();

const capture = createCapture({
  description: 'Bug in auth flow',
  claudeInstance: activeInstance.id,
  project: activeInstance.projectName,
  gitBranch: activeInstance.gitBranch,
  // ... other context
});

// Now you can see: "This bug was captured while working on my-saas-app"
```

### 2. Project History Tracking

**Automatic Project Detection:**
```typescript
interface Project {
  id: string;
  name: string;
  path: string;
  firstSeen: Date;
  lastActive: Date;
  totalTime: number; // minutes
  gitRepo?: string;
  language: string[]; // ['TypeScript', 'React', 'Rust']
  framework?: string[]; // ['Next.js', 'Tauri']

  stats: {
    captures: number;
    commits: number;
    linesAdded: number;
    linesRemoved: number;
    files: number;
  };

  milestones: Milestone[];
  sessions: Session[];
}
```

**Auto-Track Projects:**
```typescript
// When Claude Code starts in a directory
app.on('claude-started', (instance) => {
  const project = detectOrCreateProject(instance.workingDirectory);

  // Record session start
  project.sessions.push({
    startTime: new Date(),
    claudeInstance: instance.id,
    initialBranch: getGitBranch(),
  });

  // Track in background
  trackProject(project);
});
```

**Project Timeline:**
```typescript
// Get full history of a project
const history = await getProjectHistory('vibecode-toolkit');

// Returns:
{
  project: 'vibecode-toolkit',
  created: '2026-01-02T09:00:00Z',
  duration: '3 hours',

  timeline: [
    { time: '09:00', event: 'Project started', type: 'init' },
    { time: '09:15', event: 'First commit: "Initial toolkit"', type: 'commit' },
    { time: '09:30', event: 'Captured: "Test bug context"', type: 'capture' },
    { time: '10:00', event: 'Fixed bug (30 min)', type: 'resolution' },
    { time: '11:00', event: 'Pushed to GitHub', type: 'push' },
    { time: '12:00', event: 'Session ended', type: 'end' },
  ],

  artifacts: {
    captures: 5,
    commits: 23,
    files: 30,
    linesOfCode: 3345,
    screenshots: 2,
    videos: 1,
  }
}
```

### 3. Session Management

**What is a Session?**
A session is a focused work period on a specific project/task.

```typescript
interface Session {
  id: string;
  project: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;

  task?: string; // "Building standalone app"
  type: 'feature' | 'bugfix' | 'refactor' | 'research';

  claudeInstances: string[];
  captures: Capture[];
  commits: string[];

  outcomes?: {
    completed: boolean;
    summary: string;
    artifacts: string[];
  };
}
```

**Auto-Session Tracking:**
```typescript
// Automatically detect session start/end
app.on('claude-started', (instance) => {
  // Start new session or resume existing
  const session = sessions.getOrCreate(instance.projectName);
  session.addInstance(instance);
});

app.on('claude-stopped', (instance) => {
  const session = sessions.findByInstance(instance.id);
  if (session && session.allInstancesStopped()) {
    session.end();

    // Generate session summary
    const summary = generateSummary(session);
    // "Worked on vibecode-toolkit for 3 hours. Fixed 2 bugs, added standalone app, made 15 commits."
  }
});
```

**Manual Session Control:**
```bash
# Start a focused session
vibe session start "Building payment integration" --type feature

# VibeDev tracks:
# - Time spent
# - All captures
# - All commits
# - Files changed
# - Claude instances involved

# End session
vibe session end --summary "Payment integration complete"

# View session
vibe session show abc123
```

### 4. Developer Journal

**Automatic Journaling:**
```typescript
interface JournalEntry {
  date: Date;
  projects: string[];
  sessions: Session[];
  captures: Capture[];
  commits: number;
  timeSpent: number;

  highlights?: string[]; // Auto-generated or manual
  notes?: string; // Manual notes
  mood?: 'productive' | 'stuck' | 'learning' | 'flowing';
}
```

**Daily Summary:**
```bash
$ vibe journal today

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           Thursday, January 2, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱  Total Time: 6h 23m

📂 Projects Worked On:
   • vibecode-toolkit (4h 15m) - Active
   • my-saas-app (2h 8m)

🎯 Sessions:
   1. Building standalone app (3h 45m) ✓ Complete
   2. Auth bug fix (1h 30m) ✓ Complete
   3. Design review (1h 8m) ⏸️ Paused

📸 Captures: 7 bugs, 2 features, 3 questions
✅ Resolved: 5 bugs (avg 12 min to fix)
💻 Commits: 23 (vibecode-toolkit: 15, my-saas-app: 8)
📈 Lines: +1,234 / -456

🌟 Highlights:
   • Shipped VibeDev standalone app architecture
   • Fixed critical auth bug in production
   • Pushed vibecode-toolkit to GitHub

📝 Notes: (none)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Weekly/Monthly Views:**
```bash
# View week
vibe journal week

# View month
vibe journal month

# View year
vibe journal year

# Export
vibe journal export 2026.md
```

### 5. Multi-Instance Dashboard

**Real-time Overview:**
```
┌─────────────────────────────────────────────────────┐
│  VibeDev - Active Sessions                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🤖 Claude Instance #1                             │
│     Project: vibecode-toolkit                      │
│     Task: Building standalone app                  │
│     Branch: main                                    │
│     Time: 2h 15m                                    │
│     Last activity: 2m ago (editing tauri.conf.json)│
│     Captures: 3 (2 resolved)                        │
│                                                     │
│  🤖 Claude Instance #2                             │
│     Project: my-saas-app                           │
│     Task: Debugging payment webhook                │
│     Branch: feature/stripe-integration             │
│     Time: 45m                                       │
│     Last activity: Just now (reading logs)          │
│     Captures: 1 (in progress)                       │
│                                                     │
│  🤖 Claude Instance #3                             │
│     Project: ml-research                           │
│     Task: Training model                           │
│     Branch: experiment/transformer-v2              │
│     Time: 4h 32m                                    │
│     Last activity: 30m ago (running training)       │
│     Status: ⏸️ Idle (long-running process)         │
│                                                     │
├─────────────────────────────────────────────────────┤
│  📊 Today's Stats                                  │
│     • 3 active sessions                            │
│     • 7h 32m total time                            │
│     • 4 captures (3 resolved)                       │
│     • 12 commits across 3 projects                 │
└─────────────────────────────────────────────────────┘
```

**Switch Between Instances:**
```bash
# List all active instances
vibe instances

# Switch context to instance
vibe instance use 2

# See what instance #2 is working on
# Automatically loads that project's context
```

### 6. Project Analytics

**Lifetime Stats:**
```bash
$ vibe project stats vibecode-toolkit

┌─────────────────────────────────────────────────────┐
│  Project: vibecode-toolkit                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📅 Timeline                                        │
│     Created: Jan 2, 2026                           │
│     Active time: 6h 23m                            │
│     Sessions: 3                                     │
│     Last active: 2 minutes ago                      │
│                                                     │
│  💻 Code                                            │
│     Files: 30                                       │
│     Lines: 3,345 (+3,345 / -0)                     │
│     Commits: 23                                     │
│     Languages: TypeScript (78%), Rust (15%), MD (7%)│
│                                                     │
│  🐛 Debugging                                       │
│     Captures: 7                                     │
│     Bugs fixed: 5                                   │
│     Avg time to fix: 12 minutes                     │
│     Outstanding: 2                                  │
│                                                     │
│  📸 Artifacts                                       │
│     Screenshots: 4                                  │
│     Videos: 1                                       │
│     Reports: 7                                      │
│                                                     │
│  🎯 Milestones                                      │
│     ✓ Initial commit                               │
│     ✓ CLI tool complete                            │
│     ✓ Pushed to GitHub                             │
│     ⏳ Standalone app (in progress)                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Compare Projects:**
```bash
$ vibe compare vibecode-toolkit my-saas-app

                    vibecode-toolkit  |  my-saas-app
────────────────────────────────────────────────────────
Age                 3 hours           |  2 months
Total time          6h 23m            |  64h 12m
Lines of code       3,345             |  23,456
Bugs captured       7                 |  89
Bugs fixed          5 (71%)           |  81 (91%)
Avg fix time        12 min            |  18 min
Commits             23                |  234
Team size           1 (you)           |  3 developers
```

## User Experience Examples

### Example 1: Multi-Project Day

```bash
# Morning: Start work on project A
$ cd ~/vibecode-toolkit
$ # Claude Code starts automatically
[VibeDev] Detected Claude instance for 'vibecode-toolkit'
[VibeDev] Session started: "vibecode-toolkit"

# Work for 2 hours...
# Press Cmd+Shift+V to capture a bug
[VibeDev] Captured bug in session: vibecode-toolkit

# Afternoon: Switch to project B
$ cd ~/my-saas-app
$ # New Claude instance starts
[VibeDev] Detected new Claude instance for 'my-saas-app'
[VibeDev] Session started: "my-saas-app"
[VibeDev] Note: You have 1 other active session (vibecode-toolkit)

# Work on project B...

# Evening: Check what you did today
$ vibe journal today

📂 Projects: 2
   • vibecode-toolkit (4h 15m)
   • my-saas-app (2h 8m)

🎯 Accomplished:
   • Built standalone app architecture
   • Fixed auth bug
   • Made 23 commits
```

### Example 2: Long-term Project Tracking

```bash
# Week later
$ vibe project history vibecode-toolkit

Week 1 (Jan 2-8, 2026)
├─ Day 1: 6h 23m - Initial development
│  └─ Created CLI tool, browser extension
├─ Day 2: 4h 15m - Standalone app architecture
├─ Day 3: 5h 45m - Tauri implementation
├─ Day 4: 3h 30m - Testing and refinement
└─ Day 5: 2h 10m - Documentation

Total: 22h 3m
Commits: 67
Features shipped: 5
Bugs fixed: 18
```

### Example 3: Cross-instance Awareness

```typescript
// You're working on project A
// Claude instance #1 captures a bug

// Later, working on project B
// Claude instance #2 sees related bug

[Claude Instance #2]
"I notice you had a similar authentication bug in vibecode-toolkit
(Instance #1, 2 hours ago). That was fixed by adding null checks.
Should I apply the same fix here?"
```

## Implementation

### Detection System

```rust
// src-tauri/src/detector.rs

use sysinfo::{System, SystemExt, ProcessExt};

pub struct ClaudeDetector {
    system: System,
}

impl ClaudeDetector {
    pub fn detect_instances(&mut self) -> Vec<ClaudeInstance> {
        self.system.refresh_all();

        let mut instances = Vec::new();

        for (pid, process) in self.system.processes() {
            // Look for Claude Code processes
            let name = process.name();
            if name.contains("claude") || name.contains("Claude") {
                let cwd = process.cwd();
                let instance = ClaudeInstance {
                    pid: pid.as_u32(),
                    working_directory: cwd.to_string_lossy().to_string(),
                    start_time: process.start_time(),
                    // ... more fields
                };
                instances.push(instance);
            }
        }

        instances
    }
}
```

### Project Tracker

```rust
// src-tauri/src/project_tracker.rs

pub struct ProjectTracker {
    db: Database,
}

impl ProjectTracker {
    pub async fn track_activity(&self, instance: &ClaudeInstance) {
        // Get or create project
        let project = self.db.get_or_create_project(&instance.working_directory).await;

        // Update last active
        project.update_last_active(Utc::now());

        // Track session
        if let Some(session) = self.get_active_session(&project) {
            session.add_instance(instance);
        } else {
            self.start_new_session(&project, instance);
        }

        // Monitor for changes
        self.watch_directory(&instance.working_directory);
    }
}
```

### UI Dashboard

```typescript
// src/components/Dashboard.tsx

export function Dashboard() {
  const instances = useActiveInstances(); // Real-time
  const projects = useProjects();
  const todayStats = useTodayStats();

  return (
    <div className="dashboard">
      <Section title="Active Now">
        {instances.map(instance => (
          <InstanceCard key={instance.id} instance={instance} />
        ))}
      </Section>

      <Section title="Projects">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </Section>

      <Section title="Today's Activity">
        <StatsWidget stats={todayStats} />
      </Section>
    </div>
  );
}
```

## Data Model

```sql
-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT UNIQUE NOT NULL,
  first_seen TIMESTAMP NOT NULL,
  last_active TIMESTAMP NOT NULL,
  language TEXT[],
  framework TEXT[]
);

-- Sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  task TEXT,
  type TEXT
);

-- Claude instances table
CREATE TABLE claude_instances (
  id TEXT PRIMARY KEY,
  pid INTEGER NOT NULL,
  session_id TEXT REFERENCES sessions(id),
  working_directory TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP
);

-- Captures table (enhanced)
CREATE TABLE captures (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  claude_instance_id TEXT REFERENCES claude_instances(id),
  project_id TEXT REFERENCES projects(id),
  timestamp TIMESTAMP NOT NULL,
  description TEXT,
  screenshot TEXT,
  context JSONB
);

-- Journal entries
CREATE TABLE journal_entries (
  date DATE PRIMARY KEY,
  total_time INTEGER, -- minutes
  projects TEXT[],
  highlights TEXT[],
  notes TEXT
);
```

## Summary

VibeDev becomes a **complete developer activity tracker**:

✅ Tracks all Claude instances in real-time
✅ Logs every project you work on
✅ Records development sessions
✅ Captures bugs/features with full context
✅ Provides analytics and insights
✅ Generates automatic developer journal

**The result**: A complete, searchable history of your development work, automatically tracked and organized.

**Next**: Build the Tauri app with this architecture!
