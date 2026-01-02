# Error Explanation Example

## Input

```bash
vibe explain "TypeError: Cannot read property 'map' of undefined"
```

## Output

```
💡 Error Explainer

⚠️  Error:

TypeError: Cannot read property 'map' of undefined

📖 What this means:

You're trying to access a property on an object that doesn't exist (undefined).

🔍 Common causes:

1. The variable was never initialized
2. An async operation hasn't completed yet
3. A function returned undefined instead of an object
4. Optional chaining was needed but not used

⚡ Quick fix:

Add a null check: `if (obj) { obj.property }` or use optional chaining: `obj?.property`

📋 Claude-ready prompt:
──────────────────────────────────────────────────────────────────────
I'm getting this error:

```
TypeError: Cannot read property 'map' of undefined
```

Can you help me:
1. Explain what's causing this error
2. Show me how to fix it
3. Suggest how to prevent it in the future

Context:
- [Describe what you were doing when the error occurred]
- [Relevant code snippet if available]
- [Framework/library versions if relevant]
──────────────────────────────────────────────────────────────────────

Copy the above prompt to get help from Claude Code
```

---

## Another Example

### Input

```bash
vibe explain "EADDRINUSE: address already in use :::3000"
```

### Output

```
💡 Error Explainer

⚠️  Error:

EADDRINUSE: address already in use :::3000

📖 What this means:

The port is already in use by another process.

🔍 Common causes:

1. Development server already running
2. Another application using the same port
3. Zombie process from previous crash

⚡ Quick fix:

Kill the process using: `lsof -ti:PORT | xargs kill -9` or change the port.

📋 Claude-ready prompt:
──────────────────────────────────────────────────────────────────────
I'm getting this error:

```
EADDRINUSE: address already in use :::3000
```

Can you help me:
1. Explain what's causing this error
2. Show me how to fix it
3. Suggest how to prevent it in the future

Context:
- [Describe what you were doing when the error occurred]
- [Relevant code snippet if available]
- [Framework/library versions if relevant]
──────────────────────────────────────────────────────────────────────

Copy the above prompt to get help from Claude Code
```
