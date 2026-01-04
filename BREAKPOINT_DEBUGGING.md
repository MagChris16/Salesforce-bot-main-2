# Debugging Policy Bot with Breakpoints - Complete Guide

## Quick Start (3 Steps)

### Step 1: Set a Breakpoint
1. Open any `.ts` file (e.g., [src/index.ts](src/index.ts))
2. Click on the **line number** in the left margin where you want to pause execution
3. A **red dot** appears = breakpoint set ✓

### Step 2: Start Debugging
1. Press **F5** or go to **Run > Start Debugging**
2. Select **"Debug Policy Bot"** from the dropdown
3. App starts and pauses at your breakpoint

### Step 3: Inspect & Control
- **Step Over (F10)**: Execute next line, skip functions
- **Step Into (F11)**: Enter inside functions
- **Step Out (Shift+F11)**: Jump out of current function
- **Continue (F5)**: Resume execution
- Watch variables in **Variables panel** on the left

---

## Part 1: Setting Breakpoints

### Types of Breakpoints

#### **1. Line Breakpoint** (Most Common)
```
Click on line number → Red dot appears

Example: Set breakpoint at line 16 in index.ts (API key check)
```

**What happens:**
- Execution pauses right before that line executes
- You can inspect all variables at that point
- Decide what to do next (step, continue, etc.)

#### **2. Conditional Breakpoint**
Right-click on line number → "Add Conditional Breakpoint"

Example: Only break if `question.length > 10`
```
Set at: Line 58 in index.ts (const question = await...)
Condition: question.length > 10
```

**Use case:** Skip breakpoint hits when certain conditions aren't met

#### **3. Logpoint** (Breakpoint that logs without stopping)
Right-click on line number → "Add Logpoint"

Example: Log the question without pausing
```
Message: "Question asked: {question}"
```

**Use case:** Track values without interrupting flow

---

## Part 2: Recommended Breakpoints for Learning

### **Initialization Phase Breakpoints**

#### Breakpoint 1: Before API Key Check
**File:** [src/index.ts](src/index.ts), Line 7 (inside `async function main()`)
```typescript
async function main() {
  console.log("🚀 Policy Bot Initializing..."); // ← Set breakpoint here
  console.log(`[DEBUG] Policy file path: ${POLICY_FILE_PATH}`);
```

**Why:** Understand what variables exist at startup

**What to check in Variables panel:**
- `process.env.GROQ_API_KEY` - Should have a value
- `process.env.MISTRAL_API_KEY` - Should have a value
- `POLICY_FILE_PATH` - Should be `./src/company_policy.txt`

---

#### Breakpoint 2: After Document Loading
**File:** [src/index.ts](src/index.ts), Line 31 (after `const docs = await...`)
```typescript
    // 3. Load and Split Documents
    console.log("[DEBUG-STEP-3] Loading and splitting documents...");
    const docs = await loadAndSplitFile(POLICY_FILE_PATH);
    console.log(`[DEBUG] ✓ Documents loaded: ${docs.length} chunks`);
    // ← Set breakpoint on next line
    console.log(`[DEBUG] First chunk preview: ${docs[0]?.pageContent.substring(0, 100)}...`);
```

**Why:** See what documents look like after loading

**What to check in Variables panel:**
- `docs.length` - Should show number of chunks (e.g., 42)
- `docs[0]` - First chunk object
- `docs[0].pageContent` - Content of first chunk
- `docs[0].metadata` - Metadata (page info, etc.)

**Try in Debug Console:**
```javascript
// Type these in the "Debug Console" at bottom of VS Code
docs.length
docs[0].pageContent
docs.map(d => d.pageContent.length)  // See all chunk sizes
```

---

#### Breakpoint 3: After Vector Store Creation
**File:** [src/rag.ts](src/rag.ts), Line 72 (after `this.vectorStore = await HNSWLib...`)
```typescript
    try {
      // 2. Create the Vector Store index from documents and embeddings
      console.log("[DEBUG] Creating HNSWLib vector store from documents...");
      this.vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
      // ← Set breakpoint here
      console.log(`[DEBUG] ✓ Vector store created with ${docs.length} documents`);
```

**Why:** Verify vector store was initialized

**What to check:**
- `this.vectorStore` - Should be an HNSWLib object
- `this.retriever` - Should be initialized in next line

---

### **Query Phase Breakpoints**

#### Breakpoint 4: When User Asks Question
**File:** [src/index.ts](src/index.ts), Line 49 (after question is entered)
```typescript
  while (true) {
    const question = await rl.question("You: ");
    console.log(`[DEBUG] User input received: "${question}"`);
    // ← Set breakpoint here
    
    if (question.toLowerCase() === "exit") {
```

**Why:** Inspect the question before processing

**What to check:**
- `question` - The exact string user typed
- `question.length` - Length of question
- `question.toLowerCase()` - Lowercase version for comparison

---

#### Breakpoint 5: Before Retrieval
**File:** [src/rag.ts](src/rag.ts), Line 105 (inside query method)
```typescript
  public async query(question: string): Promise<string> {
    console.log(`[DEBUG-QUERY] Starting query: "${question}"`);
    // ← Set breakpoint here
    
    if (!this.retriever) {
```

**Why:** See the exact question being processed by RAG

**What to check:**
- `question` parameter - The question being asked
- `this.retriever` - Should exist (initialized earlier)
- `this.vectorStore` - Should exist

---

#### Breakpoint 6: Before LLM Call
**File:** [src/rag.ts](src/rag.ts), Line 131 (right before LLM invocation)
```typescript
    try {
      // Execute the full RAG chain
      console.log("[DEBUG] Executing RAG chain...");
      // ← Set breakpoint here
      const result = await this.chain.invoke({ question });
```

**Why:** See the chain state before calling LLM

**What to check:**
- `this.chain` - Should be defined
- `this.retriever` - Should be ready
- `question` - The question variable

---

#### Breakpoint 7: After LLM Response
**File:** [src/rag.ts](src/rag.ts), Line 133 (after `const result = await...`)
```typescript
      const result = await this.chain.invoke({ question });
      // ← Set breakpoint here
      console.log("[DEBUG] ✓ Chain execution complete");
```

**Why:** Inspect the raw response from the LLM before returning

**What to check:**
- `result` - The answer text
- `result.length` - How many characters in answer
- `result.substring(0, 100)` - First 100 chars preview

**Try in Debug Console:**
```javascript
result
result.length
result.substring(0, 200)
```

---

## Part 3: How to Use the Debugger

### **Starting the Debugger**

**Method 1: Using F5 (Fastest)**
1. Press `F5`
2. Select "Debug Policy Bot" from dropdown
3. Execution starts and stops at first breakpoint

**Method 2: Using Run Menu**
1. Click **Run** → **Start Debugging**
2. Select configuration
3. App starts

**Method 3: Command Palette**
1. Press `Ctrl+Shift+D`
2. Click "Run and Debug"
3. Select configuration

---

### **Debugger Interface**

```
┌─────────────────────────────────────────────────────────────────┐
│  VS Code Debugger Layout                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐│
│  │ SIDEBAR (Left)       │  │ EDITOR (Center)                  ││
│  │                      │  │ Code with breakpoints            ││
│  │ Run & Debug          │  │ Red dots on left margin          ││
│  │ ├─ Variables         │  │                                  ││
│  │ ├─ Watch            │  │ Highlighted line = Current       ││
│  │ ├─ Call Stack       │  │ Execution point                  ││
│  │ ├─ Breakpoints      │  │                                  ││
│  │ └─ Debug Console    │  │                                  ││
│  │                      │  │                                  ││
│  └──────────────────────┘  └──────────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ BOTTOM PANEL (Debug Console / Terminal)                      ││
│  │ Shows console.log() output and error messages                ││
│  │ Type JS expressions to evaluate them                         ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─ Control Bar (Top) ─────────────────────────────────────────┐│
│  │  ⏸ Pause  ⏹ Stop  ↻ Restart  ↪ Step Over  ↓ Step Into  ↑  ││
│  │  Step Out  ▶ Continue   (Keyboard: F5,F10,F11,Shift+F11)   ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Debugger Control Buttons**

| Button | Shortcut | Action | Use Case |
|--------|----------|--------|----------|
| **Continue** | F5 | Resume until next breakpoint or end | Keep running program |
| **Step Over** | F10 | Execute current line, skip function calls | Step through line-by-line |
| **Step Into** | F11 | Enter into function being called | Debug inside functions |
| **Step Out** | Shift+F11 | Jump out of current function | Exit deep function calls |
| **Restart** | Ctrl+Shift+F5 | Restart debugging session | Start over from beginning |
| **Stop** | Shift+F5 | End debugging session | Exit debugger |
| **Pause** | F6 | Pause execution (async only) | Pause long-running code |

---

### **Variables Panel (Left Side)**

Shows all variables available at current breakpoint:

```
Variables
├─ Local
│  ├─ question: "What are vacation policies?"
│  ├─ docs: Array(42)
│  │  ├─ [0]: Document {pageContent: "Vacation Policy...", metadata: {...}}
│  │  ├─ [1]: Document {...}
│  │  └─ [40]: Document {...}
│  ├─ ragService: RAGService {vectorStore: HNSWLib, retriever: ...}
│  └─ rl: Interface {input: TTYReadStream, output: TTYWriteStream, ...}
│
├─ Global
│  ├─ process: Object {...}
│  ├─ console: Object {log: ƒ, error: ƒ, ...}
│  └─ ...
```

**How to expand:**
- Click `▶` next to any variable to see properties
- Double-click array items to inspect elements

---

### **Watch Expressions**

Add custom expressions to monitor:

1. Right-click in **Watch** panel → "Add Expression"
2. Type any JavaScript expression:
   ```javascript
   question.length
   docs.length
   docs[0].pageContent.substring(0, 50)
   this.vectorStore
   ```

3. See live values as you step through code

---

### **Debug Console**

Evaluate JavaScript during debugging:

1. Click **Debug Console** tab at bottom
2. Type any expression:
   ```javascript
   docs
   docs[0]
   docs[0].pageContent
   question
   JSON.stringify(docs[0])
   ```

3. Press Enter to execute
4. See results immediately

---

## Part 4: Step-by-Step Debugging Walkthrough

### **Complete Debugging Session**

#### **Step 1: Set Breakpoint at Line 7 (index.ts)**
```typescript
async function main() {
  console.log("🚀 Policy Bot Initializing..."); // ← Click red dot here
```

#### **Step 2: Press F5 → Select "Debug Policy Bot"**
- App launches
- Pauses at line 7
- Variables panel shows: empty (nothing initialized yet)

#### **Step 3: Step Over (F10) - Move to Line 8**
```typescript
console.log(`[DEBUG] Policy file path: ${POLICY_FILE_PATH}`);
```
- Console prints "🚀 Policy Bot Initializing..."
- Now at line 8

#### **Step 4: Step Over Again**
- Line 8 executes
- Move to line 9

#### **Step 5: Continue (F5) Until Line 31**
- All initialization happens
- Reaches breakpoint at line 31 (after docs loaded)
- **Check Variables:**
  - `docs` = Array(42)
  - `docs[0].pageContent` = First chunk text
  - `POLICY_FILE_PATH` = "./src/company_policy.txt"

#### **Step 6: Inspect in Debug Console**
```javascript
// Type in Debug Console:
docs.length
docs[0].pageContent

// See results:
42
"Company Policies\nWelcome to our company..."
```

#### **Step 7: Continue (F5) to Vector Store**
- Set breakpoint at [src/rag.ts](src/rag.ts) line 72
- Press F5, execution resumes to that breakpoint
- **Check Variables:**
  - `this.vectorStore` = HNSWLib object
  - `this.retriever` = Retriever instance

#### **Step 8: Continue (F5) Until Ready for Questions**
- Next breakpoint at [src/index.ts](src/index.ts) line 49 (user input)
- Bot prints: "🤖 Policy Bot is ready..."
- Waits for your question

#### **Step 9: Type Question in Terminal**
```
You: What is the vacation policy?
```

#### **Step 10: Hits Breakpoint (Line 49)**
- `question` = "What is the vacation policy?"
- Continue (F5)

#### **Step 11: Hits Breakpoint in query() (Line 105)**
- `question` received by RAG service
- Verify `this.retriever` exists
- Step Over (F10) to see retrieval process

#### **Step 12: Continue (F5) to Before LLM (Line 131)**
- RAG chain built
- About to call LLM
- **Check Variables:**
  - `this.chain` = RunnableSequence
  - `question` = Your question

#### **Step 13: Continue (F5) - LLM Processes (Takes 5-10s)**
- LLM generates answer
- Hits next breakpoint (Line 133, after result)

#### **Step 14: Inspect Result**
- **Check Variables:**
  - `result` = AI's answer text
  - `result.length` = Answer character count

#### **Step 15: Continue (F5)**
- Answer prints to console
- Asks for next question
- Can set more breakpoints or stop (Shift+F5)

---

## Part 5: Advanced Debugging Techniques

### **Technique 1: Conditional Breakpoint**

Example: Only break if question contains "vacation"

1. Right-click on line number
2. Select "Add Conditional Breakpoint"
3. Enter condition: `question.includes("vacation")`
4. Breakpoint only triggers when true

**Use case:** Skip irrelevant questions, focus on specific ones

---

### **Technique 2: Logpoint (Non-Breaking)**

Example: Log each chunk retrieved without stopping

1. Right-click on line in retrieval code
2. Select "Add Logpoint"
3. Enter: `"Retrieved chunk: {doc.pageContent.substring(0, 50)}"`
4. Logs appear in console, execution continues

**Use case:** Monitor values without pausing flow

---

### **Technique 3: Watch Expressions**

Track specific values:

1. Click **+** in Watch panel
2. Add expression: `docs.length`
3. Watch shows value at each step

**Expressions to track:**
- `question.length` - Question character count
- `docs.length` - Number of chunks
- `result.length` - Answer character count

---

### **Technique 4: Call Stack Inspection**

Shows function call chain:

```
Call Stack (when paused inside query())
├─ query() ← Currently here
├─ main()
└─ <anonymous> (top level)
```

**Use to:**
- Understand which function called which
- Click on any frame to jump to that function
- See full execution path

---

### **Technique 5: Step Through Chain Building**

Debug the RAG chain construction:

1. Set breakpoint at line 109 in rag.ts
2. Step Into (F11) the chain building
3. Watch each step: retrieval → prompting → LLM

---

## Part 6: Common Debugging Scenarios

### **Scenario 1: "Documents aren't loading"**

**Debugging steps:**
1. Set breakpoint at line 31 (index.ts) after loading
2. F5 to start
3. Inspect `docs`:
   - If `docs.length === 0` → file not found or empty
   - Check `docs[0].pageContent` → Should have text
4. If empty, check file path in terminal before running

---

### **Scenario 2: "Wrong documents retrieved"**

**Debugging steps:**
1. Set breakpoint at retrieval point (rag.ts, Step 1a)
2. Run a specific question
3. In Variables panel, expand `retrievedDocs`
4. Check if documents make sense:
   - Are they about the question topic?
   - Do they contain relevant content?
5. If wrong docs returned:
   - Try more specific question
   - Consider reducing `chunkSize` for finer granularity

---

### **Scenario 3: "LLM response is slow/wrong"**

**Debugging steps:**
1. Set breakpoint before LLM call (rag.ts, line 131)
2. Check `this.chain` exists
3. Continue and observe how long LLM takes
4. After response (line 133), inspect `result`:
   - Too short? → LLM might have timed out
   - Incomplete? → API might have quota issues
5. Check Groq dashboard for errors

---

### **Scenario 4: "API key errors"**

**Debugging steps:**
1. Set breakpoint at API key check (index.ts, line 16)
2. F5 to start
3. In Debug Console type:
   ```javascript
   process.env.GROQ_API_KEY
   process.env.MISTRAL_API_KEY
   ```
4. Should show your keys
5. If undefined:
   - Check .env file exists
   - Verify environment variables are loaded
   - Ensure .env is in workspace root

---

## Part 7: Tips & Tricks

**Tip 1: Quick Variable Inspection**
- Hover over any variable in code → See its value

**Tip 2: Inline Evaluation**
- Select text in editor → Right-click → "Evaluate in Debug Console"

**Tip 3: Breakpoint Shortcuts**
- Ctrl+Shift+B → Toggle breakpoint on current line
- Ctrl+K Ctrl+I → Show hover information

**Tip 4: Debug Configuration Profiles**
- Keep Debug Policy Bot for main app
- Keep Debug Test File for testing
- Switch between them with dropdown

**Tip 5: Don't Debug the Debugger**
- Skip LangChain internals: use Skip Files (`<node_internals>/**`)
- Step Over (F10) through library code
- Step Into (F11) only your code

---

## Quick Reference Card

```
BREAKPOINTS:
  Click line number = Set breakpoint
  Right-click = Conditional/Logpoint
  Ctrl+Shift+B = Toggle

EXECUTION CONTROL:
  F5     = Continue
  F10    = Step Over
  F11    = Step Into
  Shift+F11 = Step Out
  Ctrl+Shift+F5 = Restart

INSPECTION:
  Hover over var = Show value
  Debug Console = Evaluate expressions
  Watch panel = Track variables

RECOMMENDED BREAKPOINTS:
  index.ts:7    - Initialization start
  index.ts:31   - After docs loaded
  rag.ts:72     - After vector store
  index.ts:49   - User question input
  rag.ts:105    - RAG query start
  rag.ts:131    - Before LLM call
  rag.ts:133    - After LLM response
```

---

## Next Steps

1. **Set breakpoint** at [src/index.ts](src/index.ts) line 7
2. **Press F5** to start debugging
3. **Use F10** to step through main()
4. **Watch Variables panel** to see data change
5. **Continue (F5)** until you reach vector store creation
6. **Inspect Variables** at each breakpoint
7. **Try different breakpoints** from "Recommended Breakpoints" section

Happy debugging! 🐛

