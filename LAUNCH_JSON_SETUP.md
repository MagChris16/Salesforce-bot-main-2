# VS Code Debugging Configuration - Complete Setup Guide

## What is Launch.json?

**launch.json** is a configuration file that tells VS Code:
- **How to run your TypeScript project** (which program to execute)
- **What environment variables** to use
- **Where to stop execution** (breakpoints)
- **How to display output** (console, integrated terminal, etc.)

**Location:** `.vscode/launch.json` (inside your workspace)

---

## Understanding Your Current Configuration

### File Structure Overview

```
.vscode/
└── launch.json                  ← Debugging configuration file
```

Your `launch.json` has:
```json
{
  "version": "0.2.0",            ← VS Code version (don't change)
  "configurations": [             ← Array of debug configurations
    {
      "name": "Debug Policy Bot",  ← Config 1 (for main app)
      ...settings...
    },
    {
      "name": "Debug Test File",   ← Config 2 (for testing)
      ...settings...
    }
  ]
}
```

---

## Configuration 1: "Debug Policy Bot"

### Full Configuration Explained

```jsonc
{
  "name": "Debug Policy Bot",
  // ↑ Display name in VS Code dropdown menu
  
  "type": "node",
  // ↑ Debugger type: "node" for Node.js projects
  
  "request": "launch",
  // ↑ "launch" = start fresh / "attach" = connect to running process
  
  "program": "${workspaceFolder}/node_modules/ts-node/dist/bin.js",
  // ↑ Which program to run
  //   ${workspaceFolder} = Your project root (f:\RAGPractice\policy-bot)
  //   ts-node = TypeScript runner (runs .ts files directly)
  //   This path is: f:\RAGPractice\policy-bot\node_modules\ts-node\dist\bin.js
  
  "args": ["src/index.ts"],
  // ↑ Arguments to pass to the program
  //   ts-node src/index.ts = Run this TypeScript file
  
  "restart": true,
  // ↑ Auto-restart when file changes (useful during development)
  
  "console": "integratedTerminal",
  // ↑ Where to display output
  //   "integratedTerminal" = Bottom terminal in VS Code
  //   "console" = Debug Console panel
  //   "externalTerminal" = Separate command window
  
  "internalConsoleOptions": "neverOpen",
  // ↑ Don't automatically open the internal console
  
  "env": {
    // ↑ Environment variables for this debug session
    
    "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json",
    // ↑ Tell ts-node where TypeScript config is
    //   Path: f:\RAGPractice\policy-bot\tsconfig.json
    
    "NODE_OPTIONS": "--max_old_space_size=4096"
    // ↑ Node.js memory limit: 4GB (prevents out-of-memory errors)
  },
  
  "protocol": "inspector",
  // ↑ Debugging protocol: "inspector" for Node v6.3+
  
  "skipFiles": ["<node_internals>/**"],
  // ↑ Skip stepping into Node.js internals
  //   Focus on your code, not library internals
  
  "outputCapture": "std"
  // ↑ Capture console.log and stderr output
}
```

---

## Configuration 2: "Debug Test File"

```jsonc
{
  "name": "Debug Test File",
  // ↑ For debugging src/test.ts (document loading test)
  
  "type": "node",
  "request": "launch",
  
  "program": "${workspaceFolder}/node_modules/ts-node/dist/bin.js",
  "args": ["src/test.ts"],
  // ↑ Run test.ts instead of index.ts
  
  "restart": true,
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  
  "env": {
    "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json"
    // ↑ Note: No NODE_OPTIONS (test file is smaller, doesn't need 4GB)
  },
  
  "protocol": "inspector",
  "skipFiles": ["<node_internals>/**"],
  "outputCapture": "std"
}
```

---

## How It All Works Together

### Step-by-Step Execution Flow

```
┌─ You Press F5 ─────────────────────────────────────┐
│                                                    │
│  VS Code reads: .vscode/launch.json               │
│  ↓                                                 │
│  Shows: "Select configuration" dropdown           │
│  ├─ Debug Policy Bot                              │
│  ├─ Debug Test File                               │
│  └─ (other options)                               │
│  ↓                                                 │
│  You click: "Debug Policy Bot"                    │
│  ↓                                                 │
│  VS Code executes:                                │
│  ┌─────────────────────────────────────────────┐ │
│  │ ts-node src/index.ts                        │ │
│  │ (with environment variables from "env":)    │ │
│  │ • TS_NODE_PROJECT=path/to/tsconfig.json    │ │
│  │ • NODE_OPTIONS=--max_old_space_size=4096   │ │
│  └─────────────────────────────────────────────┘ │
│  ↓                                                 │
│  App starts with debugger attached                │
│  ↓                                                 │
│  Output appears in: Integrated Terminal           │
│  ↓                                                 │
│  Execution pauses at: Breakpoints (red dots)      │
│  ↓                                                 │
│  You can: Step, watch variables, inspect          │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Key Configuration Properties Explained

### 1. **"type": "node"**
Tells VS Code to use Node.js debugger.

**Other types:**
- `"chrome"` - Debug in Chrome browser
- `"firefox"` - Debug in Firefox
- `"python"` - Debug Python files

### 2. **"request": "launch"**
Start a new process.

**vs "attach":**
```
"launch"  = Start fresh (recommended for beginners)
"attach"  = Connect to already-running process (advanced)
```

### 3. **"program"**
The executable to run.

**For your project:**
```
"program": "${workspaceFolder}/node_modules/ts-node/dist/bin.js"
          ↓ ↓ ↓
          Runs ts-node, which runs your TypeScript files
```

**What is ts-node?**
- Normally: `node` runs JavaScript (.js)
- With ts-node: `ts-node` runs TypeScript (.ts) directly
- No compilation step needed in debug mode

### 4. **"args"**
Arguments passed to the program.

**Your value:**
```
"args": ["src/index.ts"]
```

**Equivalent command line:**
```powershell
ts-node src/index.ts
```

### 5. **"console"**
Where output appears.

**Options:**
| Value | Where Output Goes | Use Case |
|-------|-------------------|----------|
| `"integratedTerminal"` | VS Code bottom panel | Most common, user can input |
| `"console"` | Debug Console (read-only) | View-only, no user input |
| `"externalTerminal"` | New command window | Full terminal control |

**Your setting:** `"integratedTerminal"` ← Can type questions here!

### 6. **"env"**
Environment variables for the debug session.

**Your values:**
```json
"env": {
  "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json",
  "NODE_OPTIONS": "--max_old_space_size=4096"
}
```

**Why?**
- `TS_NODE_PROJECT` - Tells ts-node where TypeScript config is
- `NODE_OPTIONS` - Gives Node.js 4GB RAM (prevents crashes with large files)

**Equivalent:**
```powershell
# Before running:
$env:TS_NODE_PROJECT = "F:\RAGPractice\policy-bot\tsconfig.json"
$env:NODE_OPTIONS = "--max_old_space_size=4096"

# Then run:
ts-node src/index.ts
```

### 7. **"protocol": "inspector"**
Debugging protocol version.

**Options:**
- `"inspector"` (Node v6.3+) - Modern, recommended
- `"legacy"` (Node <6.3) - Old version, rarely used

### 8. **"skipFiles": ["<node_internals>/**"]**
Don't step into Node.js internals.

**Effect:**
- When you press F11 (Step Into), it skips library code
- Focus on YOUR code, not third-party libraries

---

## Variable Substitution

VS Code replaces special variables with actual values:

| Variable | Actual Value |
|----------|--------------|
| `${workspaceFolder}` | Your project root (f:\RAGPractice\policy-bot) |
| `${workspaceFolderBasename}` | Folder name (policy-bot) |
| `${file}` | Currently open file path |
| `${fileBasename}` | File name only |
| `${fileDirname}` | Directory of current file |
| `${relativeFile}` | File path relative to workspace |

**Your example:**
```json
"program": "${workspaceFolder}/node_modules/ts-node/dist/bin.js"
```

**Expands to:**
```
F:\RAGPractice\policy-bot\node_modules\ts-node\dist\bin.js
```

---

## How to Create/Edit launch.json

### Method 1: Visual Editor (Easiest)
1. Click **Run** menu → **Open Configurations**
2. OR press `Ctrl+Shift+D`
3. Click **"Create a launch.json file"**
4. Select **"Node.js"** environment
5. Edit in the editor (no need to type JSON)

### Method 2: Manual Edit
1. Open `.vscode/launch.json` in editor
2. Add/edit configurations manually
3. Save file
4. Reload VS Code (Ctrl+Shift+P → Developer: Reload Window)

### Method 3: Command Palette
1. Press `Ctrl+Shift+P`
2. Type: "Debug: Add Configuration"
3. Select template
4. Customize for your project

---

## Debugging Workflow

### Starting Debug Session

**Step 1: Set Breakpoint**
```
Click on line number in editor
→ Red dot appears
```

**Step 2: Open Run & Debug**
```
Press Ctrl+Shift+D
OR Click Run icon in left sidebar
```

**Step 3: Select Configuration**
```
Click dropdown at top
Select "Debug Policy Bot"
```

**Step 4: Start Debugging**
```
Click green play button
OR Press F5
```

**Step 5: See Output**
```
Integrated Terminal opens at bottom
App starts with debugger attached
```

**Step 6: Hit Breakpoint**
```
Execution pauses at red dot
Yellow highlight shows current line
Variables panel updates
```

---

## Verification Checklist

### ✅ Verify Configuration is Correct

**1. Check Node.js is installed:**
```powershell
node --version
# Should show: v18.x.x or higher
```

**2. Check ts-node is installed:**
```powershell
npx ts-node --version
# Should show: v10.x.x
```

**3. Check TypeScript config exists:**
```powershell
Test-Path .\tsconfig.json
# Should show: True
```

**4. Check launch.json syntax:**
- Should have no red squiggly lines
- JSON is valid (use online JSON validator if unsure)

**5. Verify path format:**
```json
"program": "${workspaceFolder}/node_modules/ts-node/dist/bin.js"
```
- Uses `/` (forward slash), not `\` (backslash)
- VS Code handles path conversion automatically

---

## Common Configuration Mistakes

### ❌ Mistake 1: Wrong program path
```json
// WRONG:
"program": "ts-node"

// CORRECT:
"program": "${workspaceFolder}/node_modules/ts-node/dist/bin.js"
```

### ❌ Mistake 2: Backslashes in paths
```json
// WRONG:
"program": "C:\Users\...\ts-node\dist\bin.js"

// CORRECT:
"program": "${workspaceFolder}/node_modules/ts-node/dist/bin.js"
```

### ❌ Mistake 3: Wrong "type"
```json
// WRONG (for TypeScript):
"type": "python"

// CORRECT:
"type": "node"
```

### ❌ Mistake 4: Missing args
```json
// WRONG (ts-node doesn't know what to run):
"args": []

// CORRECT:
"args": ["src/index.ts"]
```

### ❌ Mistake 5: Wrong console type (for input)
```json
// WRONG (can't type input):
"console": "console"

// CORRECT (can type input):
"console": "integratedTerminal"
```

---

## Advanced Configuration Options

### Option 1: Source Maps (Map compiled code to TypeScript)
```json
{
  "name": "Debug Policy Bot",
  "type": "node",
  "request": "launch",
  ...
  "sourceMaps": true,
  "outFiles": ["${workspaceFolder}/dist/**/*.js"]
  // Maps .js output back to .ts source
}
```

### Option 2: Pre-launch Task (Run command before debugging)
```json
{
  "name": "Debug Policy Bot",
  "type": "node",
  ...
  "preLaunchTask": "tsc: build",
  // Compile TypeScript before starting debugger
}
```

### Option 3: Timeout
```json
{
  "name": "Debug Policy Bot",
  "type": "node",
  ...
  "timeout": 10000
  // Debugger timeout after 10 seconds
}
```

### Option 4: Multiple Environment Files
```json
{
  "name": "Debug Policy Bot",
  "type": "node",
  ...
  "envFile": "${workspaceFolder}/.env",
  // Load variables from .env file
}
```

---

## Debugging Different Scenarios

### Scenario 1: Debug Main App
**Configuration:** Use "Debug Policy Bot"
```
Runs: src/index.ts
Purpose: Full app with RAG chain
```

### Scenario 2: Debug Document Loading Only
**Configuration:** Use "Debug Test File"
```
Runs: src/test.ts
Purpose: Test file loading before full app
```

### Scenario 3: Debug Specific Function
1. Set breakpoint in that function
2. Start "Debug Policy Bot"
3. Trigger the function through user interaction

### Scenario 4: Debug API Calls
1. Set breakpoint before API call
2. Watch variables panel
3. See request/response in Debug Console

---

## VS Code Debug Controls

### Toolbar Controls

```
┌─────────────────────────────────────────────────┐
│ ⏹ Stop  ⏸ Pause  ▶ Continue  ↻ Restart        │
│ ↪ Step Over  ↓ Step Into  ↑ Step Out            │
└─────────────────────────────────────────────────┘

Keyboard Shortcuts:
⏹ Stop       → Ctrl+Shift+F5
▶ Continue   → F5
↪ Step Over  → F10
↓ Step Into  → F11
↑ Step Out   → Shift+F11
↻ Restart    → Ctrl+Shift+F5 (then F5 again)
```

### Debug Panels

**Variables:** Show all local and global variables
**Watch:** Track specific expressions
**Call Stack:** Show function call chain
**Breakpoints:** List all set breakpoints
**Debug Console:** Evaluate JavaScript expressions

---

## Troubleshooting Common Issues

### Issue: "Debug configuration not found"
**Solution:**
1. Verify `.vscode/launch.json` exists
2. Check JSON syntax (no trailing commas)
3. Reload VS Code: `Ctrl+Shift+P` → Reload

### Issue: "Cannot find ts-node"
**Solution:**
```powershell
npm install --save-dev ts-node typescript
```

### Issue: "Out of memory" error
**Solution:**
Increase memory in `"env"`:
```json
"NODE_OPTIONS": "--max_old_space_size=8192"  // 8GB instead of 4GB
```

### Issue: Breakpoints don't work
**Solution:**
1. Check breakpoint is red (not gray)
2. Ensure `"protocol": "inspector"`
3. Try restarting debugger (Ctrl+Shift+F5)

### Issue: Can't type input in terminal
**Solution:**
Change console:
```json
"console": "integratedTerminal"  // Not "console"
```

---

## Your Project Summary

### Your Configuration
```
File: .vscode/launch.json
Configs: 2
├─ Debug Policy Bot    → Runs src/index.ts (main app)
└─ Debug Test File     → Runs src/test.ts (testing)
```

### Your TypeScript Setup
```
File: tsconfig.json
Compiler Target: ES2020
Module: CommonJS
Strict Mode: Yes
```

### Your npm Packages
```
package.json
DevDeps: TypeScript, ts-node, nodemon
Deps: LangChain, Groq, Mistral, HNSWLib
```

---

## Quick Reference

### To Start Debugging:
```
1. Set breakpoint (click line number)
2. Press F5
3. Select "Debug Policy Bot"
4. Execution pauses at breakpoint
5. Use F10/F11 to step
6. Watch Variables panel
```

### Configuration Template:
```json
{
  "name": "My Debug Config",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/node_modules/ts-node/dist/bin.js",
  "args": ["src/yourfile.ts"],
  "console": "integratedTerminal",
  "env": {
    "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json",
    "NODE_OPTIONS": "--max_old_space_size=4096"
  }
}
```

---

## Next Steps

1. **Verify Setup:**
   - Check .vscode/launch.json exists
   - Verify TypeScript/ts-node installed

2. **Set Your First Breakpoint:**
   - Open src/index.ts
   - Click line 7
   - Red dot should appear

3. **Start Debugging:**
   - Press F5
   - Select "Debug Policy Bot"
   - Should pause at line 7

4. **Explore Debugger:**
   - Check Variables panel
   - Try F10 (step over)
   - Try F11 (step into)

5. **Ask Questions in Terminal:**
   - Continue debugging (F5)
   - Type questions when prompted
   - Watch breakpoints trigger

Happy debugging! 🎯

