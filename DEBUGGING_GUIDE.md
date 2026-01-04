# Policy Bot - Line-by-Line Debugging Guide

## Overview
This guide helps you understand how the Policy Bot works by following the execution flow step-by-step with detailed logging output.

---

## Step-by-Step Debugging Flow

### **PHASE 1: INITIALIZATION (Before Questions)**

#### **Step 1.1: Environment Validation**
```
[Output from index.ts main()]
🚀 Policy Bot Initializing...
[DEBUG] Policy file path: ./src/company_policy.txt
[DEBUG] Current working directory: f:\RAGPractice\policy-bot

[DEBUG-STEP-1] Checking GROQ_API_KEY...
[DEBUG] ✓ GROQ_API_KEY found

[DEBUG-STEP-1] Checking MISTRAL_API_KEY...
[DEBUG] ✓ MISTRAL_API_KEY found
```

**What's happening:**
- App checks if both API keys exist in your `.env` file
- If either is missing, the app stops here
- These keys are read by LangChain libraries automatically

**Debug tip:** If it fails here:
```powershell
# Verify .env file exists
cat .env

# Check both keys are present
Get-Content .env | Select-String "GROQ_API_KEY|MISTRAL_API_KEY"
```

---

#### **Step 1.2: RAGService Instantiation**
```
[DEBUG-STEP-2] Creating RAGService instance...
[DEBUG] ✓ RAGService instance created
```

**What's happening:**
- Creates an empty RAGService object with:
  - `vectorStore: undefined` (will be populated later)
  - `retriever: undefined` (will be populated later)
  - `chain: undefined` (will be populated on first query)
  - `model: ChatGroq` (initialized immediately)
  - `prompt: PromptTemplate` (initialized immediately)

**Debug tip:** If you see an error here, check your imports in `rag.ts`

---

#### **Step 1.3: Document Loading**
```
[DEBUG-STEP-3] Loading and splitting documents...

📂 Loading file: ./src/company_policy.txt...
[DEBUG] Absolute path attempt: f:\RAGPractice\policy-bot\src\company_policy.txt
[DEBUG] Creating TextLoader instance...
[DEBUG] ✓ TextLoader created
[DEBUG] Loading raw text from file...
[DEBUG] ✓ Raw documents loaded: 1 document(s)
[DEBUG]   Doc 1 - Content length: 15234 chars
[DEBUG]   First 100 chars: Company Policies
Welcome to our company...
```

**What's happening:**
1. **TextLoader** reads the entire policy file as one document
2. Shows the total character count and preview of content

**Debug tip:** If this fails:
- Check file exists: `Test-Path .\src\company_policy.txt`
- Check it has content: `Get-Content .\src\company_policy.txt | Measure-Object -Character`

---

#### **Step 1.4: Document Splitting**
```
[DEBUG] Creating RecursiveCharacterTextSplitter...
[DEBUG] ✓ Splitter configured (chunkSize: 1000, overlap: 100)
[DEBUG] Splitting documents into chunks...
✅ File loaded and split into 42 chunks.

[DEBUG]   Chunk 1: Company Policies
Welcome to our company human resources policies...
[DEBUG]   Chunk 2: ...includes information on work schedules...
[DEBUG]   Chunk 3: All employees are required to...
[DEBUG]   ... (38 more chunks) ...
[DEBUG]   Chunk 41: Policy violations may result in...
[DEBUG]   Chunk 42: For questions, contact HR...

[DEBUG] ✓ Documents loaded: 42 chunks
[DEBUG] First chunk preview: Company Policies...
```

**What's happening:**
1. **RecursiveCharacterTextSplitter** breaks the large document into smaller 1000-character chunks
2. Each chunk overlaps by 100 characters (prevents cutting sentences)
3. Shows preview of first and last chunks

**Key insight:** The larger document is broken into bite-sized pieces so:
- The AI can process them efficiently
- Relevant chunks can be retrieved when answering questions

**Tuning parameters:**
- **chunkSize: 1000** - Make smaller for detailed topics, larger for broad topics
- **chunkOverlap: 100** - Ensures context isn't lost at chunk boundaries

---

#### **Step 1.5: Vector Store Creation (Embeddings)**
```
[DEBUG-STEP-4] Initializing vector store with embeddings...
🧠 Initializing Vector Store with Mistral Embeddings...
[DEBUG] Number of documents to index: 42

[DEBUG] Creating MistralAIEmbeddings instance...
[DEBUG] ✓ MistralAIEmbeddings instance created

[DEBUG] Creating HNSWLib vector store from documents...
[Takes 30-60 seconds - API calls happen here]
[DEBUG] ✓ Vector store created with 42 documents

[DEBUG] Creating retriever from vector store...
[DEBUG] ✓ Retriever created
✅ Vector Store created.
```

**What's happening:**
1. **MistralAIEmbeddings** converts each chunk into a 1024-dimensional vector (mathematical representation)
2. **HNSWLib** (Hierarchical Navigable Small World) creates an index of these vectors
3. This index allows fast semantic similarity search

**Time note:** This is the slowest part (30-60 seconds) because:
- Each chunk must be sent to Mistral API
- Mistral converts 42 chunks to vectors
- HNSWLib builds the search index

**Debug tip:** If this fails:
- Check internet connection
- Verify MISTRAL_API_KEY is valid
- Check Mistral API quota

---

#### **Step 1.6: Ready for Queries**
```
🤖 Policy Bot is ready. Ask a question or type 'exit' to quit.

[DEBUG-STEP-5] Starting interactive CLI...
You: 
```

**What's happening:**
- App is now waiting for user input
- Internal state:
  - ✓ All 42 chunks indexed in vector store
  - ✓ Retriever ready to find similar chunks
  - ✓ Groq LLM ready to answer questions

---

### **PHASE 2: QUERY PROCESSING (When You Ask a Question)**

#### **Step 2.1: User Input**
```
You: What are the vacation policies?

[DEBUG] User input received: "What are the vacation policies?"
[DEBUG-STEP-6] Processing query through RAG chain...
[DEBUG-QUERY] Starting query: "What are the vacation policies?"
```

**What's happening:**
- Your question is captured
- System logs it for debugging
- RAG chain begins processing

---

#### **Step 2.2: RAG Chain Construction (First Query Only)**
```
[DEBUG] Building RAG chain (first query)...
```

**What's happening:**
- On the first query only, the system assembles the RAG pipeline
- This pipeline has 4 steps (created only once, reused for subsequent queries)
- On later queries, this step is skipped

---

#### **Step 2.3: Document Retrieval (Step 1)**
```
[DEBUG] Step 1a: Retrieving relevant documents...
🔍 Searching for answer to: "What are the vacation policies?"

[DEBUG] Retrieved 4 documents:
[DEBUG]   Doc 1: Vacation Policy
Employees are entitled to 20 days of paid vacation per year...
[DEBUG]   Doc 2: Additional time off policies
Employees may request unpaid leave for specific circumstances...
[DEBUG]   Doc 3: Holiday schedule for 2024
Company offices will be closed on the following dates...
[DEBUG]   Doc 4: Returning from vacation
Upon return from vacation, employees must submit...

[DEBUG] Combined context length: 3847 characters
[DEBUG] Step 1b: Passing through question
```

**What's happening:**
1. Your question "What are the vacation policies?" is converted to an embedding
2. System searches the vector store for similar chunks (semantic similarity)
3. Retriever finds the 4 most relevant chunks
4. These chunks are combined into one context string

**Key insight:** The retriever doesn't search for keywords—it understands meaning:
- "vacation policies" matches chunks about "time off" and "leave"
- It captures relevant context even with different wording

**Debug tip:** If wrong chunks are retrieved:
- Try more specific questions
- Check if policy file has clear information on the topic
- Consider reducing chunkSize to get more precise matches

---

#### **Step 2.4: Prompt Formatting (Step 2)**
```
[DEBUG] Step 2: Formatting prompt...
[DEBUG] Prompt formatted, length: 4156
```

**What's happening:**
The system creates a formatted prompt using the template:

```
You are an expert HR Policy Bot. Your task is to answer the user's question 
based ONLY on the provided context.
If the context does not contain the answer, you must politely state: 
"I cannot find the answer in the current policy documents."

--- CONTEXT ---
[4 vacation-related chunks inserted here]
---

Question: What are the vacation policies?
Answer:
```

**Debug tip:** To see the actual prompt, add this to `rag.ts`:
```typescript
console.log("[DEBUG] Full prompt:", formatted.text);
```

---

#### **Step 2.5: LLM Processing (Step 3)**
```
[DEBUG] Step 3: Calling Groq LLM...
[Takes 3-10 seconds]
[DEBUG] ✓ LLM response received
```

**What's happening:**
1. Formatted prompt sent to Groq's API
2. Groq's "openai/gpt-oss-120b" model processes it
3. Model generates answer based on context
4. Response returned (usually 200-500 tokens)

**Time note:** Takes 3-10 seconds depending on answer length and API load

---

#### **Step 2.6: Output Parsing (Step 4)**
```
[DEBUG] Step 4: Executing RAG chain...
[DEBUG] ✓ Chain execution complete
[DEBUG] Result length: 456 characters

[DEBUG] Executing RAG chain...
[DEBUG] ✓ Chain execution complete
[DEBUG] Result length: 456 characters

Bot: Our company offers a comprehensive vacation policy. Employees are 
entitled to 20 days of paid vacation per year, which can be used for 
relaxation and personal time. For additional time off, employees may 
request unpaid leave for specific circumstances. The company offices 
will be closed on major holidays as outlined in our 2024 holiday schedule.

You: 
```

**What's happening:**
1. LLM response (ChatMessage object) converted to plain text string
2. Answer displayed to user
3. System returns to waiting for next question

---

## Complete Flow Diagram

```
START
  ↓
[API Keys Check] → If missing, STOP
  ↓
[Create RAGService] → Initialize empty service with Groq model
  ↓
[Load File] → Read ./src/company_policy.txt
  ↓
[Split into Chunks] → 42 chunks of ~1000 chars each
  ↓
[Generate Embeddings] → Call Mistral API for all 42 chunks
  ↓
[Build Vector Store] → Create searchable index with HNSWLib
  ↓
[Ready for Questions] → Wait for user input
  ↓
┌─→ USER ASKS QUESTION
│    ↓
│   [Embed Question] → Convert question to same vector space
│    ↓
│   [Semantic Search] → Find 4 most similar chunks
│    ↓
│   [Format Prompt] → Combine context + question
│    ↓
│   [Call Groq LLM] → Generate answer using context
│    ↓
│   [Output Answer] → Display to user
│    ↓
│   [Ask Next Question] ───┐
└───────────────────────────┘
  ↓
[User types 'exit']
  ↓
STOP
```

---

## Common Issues & Debug Solutions

### Issue: "Failed during RAG initialization"

**Possible causes:**
```
1. Missing API keys
   → Check: cat .env
   → Fix: Add both GROQ_API_KEY and MISTRAL_API_KEY

2. Policy file not found
   → Check: Test-Path .\src\company_policy.txt
   → Fix: Ensure file exists and path is correct

3. API quota exceeded
   → Check: Groq/Mistral dashboard
   → Fix: Wait or upgrade API plan

4. Network connection issue
   → Check: ping api.mistral.ai
   → Fix: Check internet connection
```

### Issue: "Retrieved wrong documents"

**Debug solution:**
```typescript
// Add to rag.ts in Step 1a
console.log("[DEBUG] Retrieved chunks:");
retrievedDocs.forEach((doc, i) => {
  console.log(`${i+1}. ${doc.pageContent.substring(0, 150)}`);
});
```

### Issue: "Answer is incomplete or irrelevant"

**Debug solution:**
```typescript
// Check what context was used
// Add to rag.ts in Step 2
console.log("[DEBUG] Context sent to LLM:");
console.log(input.context);
```

---

## Running Tests

### Test 1: Document Loading Only
```powershell
npx ts-node src/test.ts
```
Output shows all loaded chunks.

### Test 2: Full Application with Debug Logs
```powershell
npx ts-node src/index.ts
```
Follow the [DEBUG] markers to understand flow.

### Test 3: Check Specific Phase
Clear console and ask:
- **Initialization:** Run app once, watch logs before "Ready" message
- **Retrieval:** Ask a specific question, watch Step 1a logs
- **LLM:** Watch Step 3 logs for answer generation time

---

## Performance Tuning

### If initialization is slow:
- **Larger chunks** → `chunkSize: 2000` (faster, less detailed)
- **Fewer chunks** → `chunkSize: 1000, chunkOverlap: 50`

### If retrieval is wrong:
- **Smaller chunks** → `chunkSize: 500` (more granular)
- **More context** → Modify retriever to return 6-8 docs instead of 4

### If answers are slow:
- Check Groq API status
- Use a faster Groq model (see available models in Groq docs)

---

## Next Steps

1. **Run the app:** `npx ts-node src/index.ts`
2. **Watch Phase 1 logs** (initialization) - Should see ✓ at each checkpoint
3. **Ask a test question** and watch Phase 2 logs
4. **Modify chunkSize** and observe retrieval changes
5. **Add your own debug logs** where needed using `[DEBUG]` prefix

