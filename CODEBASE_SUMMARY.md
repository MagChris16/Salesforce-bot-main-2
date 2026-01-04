# Policy Bot - Codebase Summary

## 1. Program Summary

**Policy Bot** is a Retrieval-Augmented Generation (RAG) application built with TypeScript and LangChain. It serves as an interactive chatbot that answers questions about company policies by:

1. Loading and processing policy documents from text files
2. Creating vector embeddings of the document chunks using Mistral AI
3. Storing these embeddings in a local HNSWLib vector database
4. Retrieving relevant context when users ask questions
5. Generating accurate answers using Groq's LLM (GPT-OSS-120B model)

The application runs as a command-line interface (CLI) that allows users to interactively query the policy documents in real-time.

---

## 2. Program Flow

### Initialization Flow:
```
1. Application starts (index.ts)
   ↓
2. Load environment variables (.env file)
   ↓
3. Validate API keys (GROQ_API_KEY, MISTRAL_API_KEY)
   ↓
4. Initialize RAGService instance
   ↓
5. Load policy file (company_policy.txt)
   ↓
6. Split document into chunks (loader.ts)
   ↓
7. Generate embeddings using Mistral AI (rag.ts)
   ↓
8. Create vector store index (HNSWLib)
   ↓
9. Ready for queries
```

### Query Flow:
```
1. User enters a question
   ↓
2. Question is passed to RAGService.query()
   ↓
3. RAG Chain executes:
   a. Retrieve relevant document chunks (semantic search)
   b. Combine chunks into context string
   c. Format prompt with context + question
   d. Send to Groq LLM
   e. Parse and return answer
   ↓
4. Display answer to user
   ↓
5. Wait for next question (loop)
```

---

## 3. Components

### 3.1 Core Components

1. **Document Loader** (`loader.ts`)
   - Handles file loading and text chunking
   - Uses LangChain's TextLoader and RecursiveCharacterTextSplitter

2. **RAG Service** (`rag.ts`)
   - Manages vector store initialization
   - Handles retrieval and generation pipeline
   - Orchestrates the RAG chain

3. **Utilities** (`utils.ts`)
   - Helper functions for document processing
   - Combines multiple document chunks into a single context string

4. **Main Application** (`index.ts`)
   - Entry point of the application
   - Manages CLI interaction
   - Coordinates initialization and query loop

5. **Test File** (`test.ts`)
   - Simple test script for document loading functionality

### 3.2 External Dependencies

- **LangChain Ecosystem**: Modular LangChain packages for RAG functionality
- **Mistral AI**: Embeddings generation API
- **Groq**: Fast LLM inference API
- **HNSWLib**: Local vector database for similarity search
- **Node.js Readline**: Interactive terminal interface

---

## 4. TypeScript & LangChain Concepts for Beginners

### 4.1 TypeScript Basics

**What is TypeScript?**
- TypeScript = JavaScript with type annotations
- Types help catch errors before running code
- Compiles to regular JavaScript

**Key Concepts Used in This Project:**

1. **Type Annotations**:
   ```typescript
   // Function parameter type
   function greet(name: string): string {
     return `Hello, ${name}`;
   }
   // name must be string, function returns string
   ```

2. **Async/Await**:
   ```typescript
   // async = function returns a Promise
   async function fetchData() {
     // await = wait for Promise to resolve
     const data = await someAsyncOperation();
     return data;
   }
   ```

3. **Arrow Functions**:
   ```typescript
   // Traditional function
   function add(a: number, b: number) { return a + b; }
   
   // Arrow function (shorthand)
   const add = (a: number, b: number) => a + b;
   ```

4. **Optional Properties**:
   ```typescript
   // ? = optional (can be undefined)
   private vectorStore?: HNSWLib;
   // Can be HNSWLib or undefined
   ```

5. **Union Types**:
   ```typescript
   // | = OR (can be one type OR another)
   let value: string | undefined;
   // Can be string OR undefined
   ```

6. **Object Destructuring**:
   ```typescript
   // Extract properties from object
   const { stdin, stdout } = process;
   // Same as: const stdin = process.stdin; const stdout = process.stdout;
   ```

7. **Template Literals**:
   ```typescript
   // Backticks allow string interpolation
   const name = "John";
   const greeting = `Hello, ${name}`; // "Hello, John"
   ```

### 4.2 LangChain Basics

**What is LangChain?**
- Framework for building LLM applications
- Provides abstractions for common patterns (RAG, chains, etc.)
- Handles API calls, prompt formatting, document processing

**Key Concepts Used in This Project:**

1. **Document**:
   ```typescript
   // Document = wrapper around text with metadata
   {
     pageContent: "The actual text content...",
     metadata: { source: "file.txt", page: 1 }
   }
   ```

2. **Document Loaders**:
   ```typescript
   // Loads files into Document objects
   const loader = new TextLoader("./file.txt");
   const docs = await loader.load(); // Returns Document[]
   ```

3. **Text Splitters**:
   ```typescript
   // Splits large documents into smaller chunks
   const splitter = new RecursiveCharacterTextSplitter({
     chunkSize: 1000,  // Max characters per chunk
     chunkOverlap: 100 // Overlap between chunks
   });
   const chunks = await splitter.splitDocuments(docs);
   ```

4. **Embeddings**:
   ```typescript
   // Converts text to numerical vectors
   const embeddings = new MistralAIEmbeddings();
   const vector = await embeddings.embedQuery("text");
   // Returns: [0.123, -0.456, 0.789, ...] (array of numbers)
   ```

5. **Vector Stores**:
   ```typescript
   // Stores embeddings for fast similarity search
   const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
   // Creates index that can find similar documents
   ```

6. **Retrievers**:
   ```typescript
   // Finds relevant documents for a query
   const retriever = vectorStore.asRetriever();
   const relevantDocs = await retriever._getRelevantDocuments("question");
   // Returns most similar Document objects
   ```

7. **Prompt Templates**:
   ```typescript
   // Templates with placeholders
   const template = "Answer: {question}";
   const prompt = PromptTemplate.fromTemplate(template);
   const formatted = await prompt.format({ question: "What is RAG?" });
   // Returns: "Answer: What is RAG?"
   ```

8. **LLM Models**:
   ```typescript
   // Language model for generating text
   const model = new ChatGroq({ model: "gpt-oss-120b" });
   const response = await model.invoke("What is AI?");
   // Returns text answer
   ```

9. **Chains (LCEL - LangChain Expression Language)**:
   ```typescript
   // Composes multiple operations
   const chain = RunnableSequence.from([
     step1,  // Retrieve documents
     step2,   // Format prompt
     step3,   // Generate answer
     step4    // Parse response
   ]);
   const result = await chain.invoke({ question: "..." });
   ```

10. **Output Parsers**:
    ```typescript
    // Converts LLM response to desired format
    const parser = new StringOutputParser();
    const text = parser.parse(llmResponse);
    // Extracts text from response object
    ```

### 4.3 RAG (Retrieval-Augmented Generation) Flow

**Step-by-Step Process:**

1. **Loading**: Read documents from files
   ```typescript
   const docs = await loadAndSplitFile("./policy.txt");
   ```

2. **Chunking**: Split into smaller pieces
   ```typescript
   // Already done in loadAndSplitFile
   // Large document → Multiple smaller chunks
   ```

3. **Embedding**: Convert chunks to vectors
   ```typescript
   const embeddings = new MistralAIEmbeddings();
   // Each chunk → Vector (array of numbers)
   ```

4. **Indexing**: Store vectors in database
   ```typescript
   const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
   // Vectors stored for fast search
   ```

5. **Retrieval**: Find relevant chunks for question
   ```typescript
   const retriever = vectorStore.asRetriever();
   const relevant = await retriever._getRelevantDocuments(question);
   // Returns chunks similar to question
   ```

6. **Generation**: Create answer from chunks
   ```typescript
   const answer = await model.invoke(promptWithContext);
   // LLM generates answer using retrieved chunks
   ```

---

## 5. File-by-File Breakdown with Line-by-Line Explanations

### 5.1 `src/index.ts` - Main Application Entry Point

**Purpose**: Orchestrates the entire application lifecycle and provides the CLI interface.

#### Line-by-Line Explanation:

```typescript
// Line 1: Import readline module for interactive terminal input/output
import * as readline from "readline/promises";
```
**Explanation**: 
- `import * as` imports all exports from a module as a namespace object
- `readline/promises` provides Promise-based async functions (instead of callbacks)
- **Example**: `readline.createInterface()` creates an interface for reading user input

```typescript
// Line 2: Import stdin and stdout from Node.js process module
import { stdin as input, stdout as output } from "process";
```
**Explanation**:
- `{ stdin as input }` uses destructuring with renaming - imports `stdin` but names it `input`
- `stdin` = standard input (keyboard), `stdout` = standard output (console)
- **Example**: `input` will be used to read what the user types

```typescript
// Line 3: Import dotenv to load environment variables from .env file
import * as dotenv from "dotenv";
```
**Explanation**:
- `dotenv` reads `.env` file and adds variables to `process.env`
- **Example**: If `.env` has `GROQ_API_KEY=abc123`, then `process.env.GROQ_API_KEY` = `"abc123"`

```typescript
// Line 5: Import the loadAndSplitFile function from our loader module
import { loadAndSplitFile } from "./loader";
```
**Explanation**:
- `{ loadAndSplitFile }` uses named import (imports specific function)
- `"./loader"` is a relative path (same directory)
- **Example**: We can now call `loadAndSplitFile("./file.txt")`

```typescript
// Line 6: Import the RAGService class from our rag module
import { RAGService } from "./rag";
```
**Explanation**:
- Imports the `RAGService` class (TypeScript classes are like blueprints for objects)
- **Example**: We'll create an instance with `new RAGService()`

```typescript
// Line 9: Call dotenv.config() to load .env file into process.env
dotenv.config();
```
**Explanation**:
- Executes immediately when file loads (not inside a function)
- Reads `.env` and populates `process.env` object
- **Example**: After this, `process.env.GROQ_API_KEY` is available

```typescript
// Line 11: Define a constant for the policy file path
const POLICY_FILE_PATH = "./src/company_policy.txt";
```
**Explanation**:
- `const` = constant (cannot be reassigned)
- `./src/company_policy.txt` = relative path from project root
- **Example**: This path points to our policy document

```typescript
// Line 13: Define async function main() - entry point
async function main() {
```
**Explanation**:
- `async` = function can use `await` for promises
- `async` functions always return a Promise
- **Example**: `await loadAndSplitFile()` waits for file to load before continuing

```typescript
// Line 18: Check if GROQ_API_KEY exists in environment variables
if (!process.env.GROQ_API_KEY) {
```
**Explanation**:
- `process.env` = object containing environment variables
- `!` = NOT operator (checks if value is falsy: undefined, null, empty string)
- **Example**: If key doesn't exist, `process.env.GROQ_API_KEY` is `undefined`, so condition is true

```typescript
// Line 30: Create new instance of RAGService class
const ragService = new RAGService();
```
**Explanation**:
- `new` = creates an instance of a class
- `RAGService()` calls the constructor
- **Example**: `ragService` is now an object with methods like `ragService.query()`

```typescript
// Line 34: Call async function and wait for result
const docs = await loadAndSplitFile(POLICY_FILE_PATH);
```
**Explanation**:
- `await` = waits for Promise to resolve
- `loadAndSplitFile()` returns `Promise<Document[]>`
- `await` extracts the `Document[]` from the Promise
- **Example**: `docs` will be an array like `[{pageContent: "text1"}, {pageContent: "text2"}]`

```typescript
// Line 37: Call async method on ragService instance
await ragService.initializeVectorStore(docs);
```
**Explanation**:
- `ragService.initializeVectorStore()` is an async method
- `await` waits for it to complete
- **Example**: This creates embeddings and stores them in the vector database

```typescript
// Line 46: Create readline interface for user input
const rl = readline.createInterface({ input, output });
```
**Explanation**:
- `createInterface()` creates an interface object
- `{ input, output }` is an object literal (shorthand for `{ input: input, output: output }`)
- **Example**: `rl.question("You: ")` prompts user and waits for input

```typescript
// Line 48: Infinite loop - runs until break
while (true) {
```
**Explanation**:
- `while (true)` = loop forever
- `break` statement exits the loop
- **Example**: Keeps asking questions until user types "exit"

```typescript
// Line 49: Wait for user input (async operation)
const question = await rl.question("You: ");
```
**Explanation**:
- `rl.question()` returns a Promise that resolves when user presses Enter
- `await` waits for the Promise
- **Example**: User types "What are work hours?", `question` = `"What are work hours?"`

```typescript
// Line 51: Check if user wants to exit (case-insensitive)
if (question.toLowerCase() === "exit") {
```
**Explanation**:
- `.toLowerCase()` converts string to lowercase
- `===` = strict equality (checks type and value)
- **Example**: "EXIT", "Exit", "exit" all become "exit"

```typescript
// Line 59: Call async query method and wait for answer
const answer = await ragService.query(question);
```
**Explanation**:
- `ragService.query()` is async, returns `Promise<string>`
- `await` extracts the string answer
- **Example**: If question is "What are work hours?", answer might be "9 AM to 5 PM"

```typescript
// Line 69: Call main() function to start the application
main();
```
**Explanation**:
- Executes the `main()` function
- Since `main()` is async, it returns a Promise (but we don't await it)
- **Example**: This starts the entire application

**Functions**:
- `main()`: Main async function that:
  - Loads environment variables using dotenv
  - Validates required API keys (GROQ_API_KEY, MISTRAL_API_KEY)
  - Initializes the RAGService
  - Loads and processes the policy document
  - Sets up the interactive readline interface
  - Handles user queries in a continuous loop
  - Manages graceful shutdown on "exit" command

**Key Features**:
- Environment variable validation
- Error handling for initialization failures
- Interactive terminal loop using Node.js readline
- User-friendly console output with emojis

**Dependencies**:
- `readline/promises`: For async terminal input
- `dotenv`: For environment variable management
- `./loader`: For document loading
- `./rag`: For RAG service

---

### 5.2 `src/loader.ts` - Document Loading and Chunking

**Purpose**: Loads text files and splits them into manageable chunks for processing.

#### Line-by-Line Explanation:

```typescript
// Line 1: Import TextLoader class from LangChain
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
```
**Explanation**:
- `TextLoader` = LangChain class for loading text files
- `@langchain/classic` = LangChain package for document loaders
- **Example**: `new TextLoader("./file.txt")` creates a loader for that file

```typescript
// Line 2: Import RecursiveCharacterTextSplitter class
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
```
**Explanation**:
- `RecursiveCharacterTextSplitter` = splits text intelligently
- "Recursive" = tries to split by paragraphs, then sentences, then characters
- **Example**: Prevents cutting words/sentences in half

```typescript
// Line 3: Import Document type (TypeScript type definition)
import { Document } from "@langchain/core/documents";
```
**Explanation**:
- `Document` = TypeScript type/interface
- TypeScript types don't exist at runtime, they're for type checking
- **Example**: `Document` has properties like `pageContent: string` and `metadata: object`

```typescript
// Line 9: Export async function with TypeScript type annotations
export const loadAndSplitFile = async (path: string): Promise<Document[]> => {
```
**Explanation**:
- `export` = makes function available to other files
- `const` = constant (arrow function assigned to constant)
- `(path: string)` = parameter `path` must be a string
- `: Promise<Document[]>` = return type is Promise that resolves to Document array
- `=>` = arrow function syntax (shorthand for `function`)
- **Example**: `loadAndSplitFile("./file.txt")` returns `Promise<Document[]>`

```typescript
// Line 13: Create TextLoader instance with file path
const loader = new TextLoader(path);
```
**Explanation**:
- `new TextLoader(path)` = creates instance, passing file path to constructor
- `loader` is now an object with methods like `loader.load()`
- **Example**: If `path = "./policy.txt"`, loader knows which file to load

```typescript
// Line 16: Call async load() method and wait for result
const rawDocs = await loader.load();
```
**Explanation**:
- `loader.load()` = async method that reads file and returns Promise
- Returns array of Document objects (usually 1 Document for text files)
- **Example**: `rawDocs = [{pageContent: "Full file text...", metadata: {}}]`

```typescript
// Line 21-24: Create splitter with configuration object
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 100, 
});
```
**Explanation**:
- `{ chunkSize: 1000 }` = object literal with configuration
- `chunkSize` = max characters per chunk (1000 chars)
- `chunkOverlap` = characters to overlap between chunks (100 chars)
- Overlap prevents losing context at chunk boundaries
- **Example**: Text "1234567890" with chunkSize=5, overlap=2:
  - Chunk 1: "12345"
  - Chunk 2: "45678" (starts at position 4, overlaps 2 chars)
  - Chunk 3: "7890"

```typescript
// Line 27: Split documents into smaller chunks
const splitDocs = await splitter.splitDocuments(rawDocs);
```
**Explanation**:
- `splitDocuments()` = async method that splits array of Documents
- Takes `Document[]`, returns `Document[]` (more documents, each smaller)
- **Example**: 1 document with 5000 chars → 5 documents with ~1000 chars each

```typescript
// Line 30: Return the array of split documents
return splitDocs;
```
**Explanation**:
- `return` = exits function and returns value
- Return type matches `Promise<Document[]>` from function signature
- **Example**: Returns array like `[{pageContent: "chunk1"}, {pageContent: "chunk2"}]`

**Functions**:
- `loadAndSplitFile(path: string)`: Promise<Document[]>
  - Takes a file path as input
  - Uses TextLoader to load the raw text file
  - Initializes RecursiveCharacterTextSplitter with:
    - `chunkSize: 1000` characters per chunk
    - `chunkOverlap: 100` characters overlap between chunks
  - Splits the document into multiple Document objects
  - Returns an array of Document objects ready for embedding

**Configuration**:
- Chunk size: 1000 characters (optimal for most use cases)
- Overlap: 100 characters (prevents cutting sentences in half)

**Dependencies**:
- `@langchain/classic/document_loaders/fs/text`: TextLoader
- `@langchain/textsplitters`: RecursiveCharacterTextSplitter
- `@langchain/core/documents`: Document type

---

### 5.3 `src/rag.ts` - RAG Service Implementation

**Purpose**: Core RAG functionality including vector store management and query processing.

#### Line-by-Line Explanation:

```typescript
// Line 1: Import path module for file path operations
import * as path from "path";
```
**Explanation**:
- `path` = Node.js built-in module for file path operations
- `path.join()` = safely joins path segments
- **Example**: `path.join("data", "hnswlib")` → `"data/hnswlib"` (or `"data\\hnswlib"` on Windows)

```typescript
// Line 3: Import HNSWLib vector store class
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
```
**Explanation**:
- `HNSWLib` = class for local vector database (stores embeddings)
- HNSW = Hierarchical Navigable Small World (fast search algorithm)
- **Example**: Stores document embeddings for fast similarity search

```typescript
// Line 5: Import Mistral AI embeddings class
import { MistralAIEmbeddings } from "@langchain/mistralai";
```
**Explanation**:
- `MistralAIEmbeddings` = class that converts text to vectors
- Uses Mistral AI API to generate embeddings
- **Example**: `"work hours"` → `[0.123, -0.456, 0.789, ...]` (vector of numbers)

```typescript
// Line 7: Import ChatGroq LLM class
import { ChatGroq } from "@langchain/groq";
```
**Explanation**:
- `ChatGroq` = class for Groq's LLM API
- Used to generate answers from prompts
- **Example**: Sends prompt, receives text answer

```typescript
// Line 8-12: Import LangChain core utilities
import { Document } from "@langchain/core/documents";
import { BaseRetriever } from "@langchain/core/retrievers";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
```
**Explanation**:
- `Document` = type for document objects
- `BaseRetriever` = base class for retrieving documents
- `PromptTemplate` = formats prompts with variables (like `{context}`, `{question}`)
- `StringOutputParser` = converts LLM response object to string
- `RunnableSequence` = chains multiple operations together
- **Example**: Sequence = retrieve → format → generate → parse

```typescript
// Line 16: Define path where vector store will be saved
const VECTOR_STORE_PATH = path.join(process.cwd(), "data", "hnswlib");
```
**Explanation**:
- `process.cwd()` = current working directory (project root)
- `path.join()` = joins paths: `"./data/hnswlib"`
- **Example**: If project is at `F:\RAGPractice\policy-bot`, path = `F:\RAGPractice\policy-bot\data\hnswlib`

```typescript
// Line 19-29: Define prompt template string
const QA_PROMPT_TEMPLATE = `
You are an expert HR Policy Bot...
{context}
{question}
`;
```
**Explanation**:
- Template string (backticks `` ` ``) = multi-line string
- `{context}` and `{question}` = placeholders that will be replaced
- **Example**: When used, `{context}` becomes actual policy text, `{question}` becomes user's question

```typescript
// Line 33: Export RAGService class
export class RAGService {
```
**Explanation**:
- `class` = blueprint for creating objects
- `export` = makes class available to other files
- **Example**: `new RAGService()` creates an instance

```typescript
// Line 34-36: Class properties (optional, initialized later)
private vectorStore?: HNSWLib;
private retriever?: BaseRetriever;
private chain: RunnableSequence | undefined;
```
**Explanation**:
- `private` = only accessible inside this class
- `?` = optional (can be undefined)
- `| undefined` = TypeScript union type (can be RunnableSequence OR undefined)
- **Example**: `vectorStore` starts as `undefined`, gets set in `initializeVectorStore()`

```typescript
// Line 39-41: Initialize LLM model (readonly = cannot be reassigned)
private readonly model = new ChatGroq({
  model: "openai/gpt-oss-120b",
});
```
**Explanation**:
- `readonly` = property cannot be reassigned after initialization
- `new ChatGroq()` = creates instance, reads `GROQ_API_KEY` from `process.env`
- `model` = which LLM model to use
- **Example**: This model is fast and optimized for Groq's hardware

```typescript
// Line 42: Create prompt template from string
private readonly prompt = PromptTemplate.fromTemplate(QA_PROMPT_TEMPLATE);
```
**Explanation**:
- `PromptTemplate.fromTemplate()` = creates template object from string
- Template knows about `{context}` and `{question}` placeholders
- **Example**: Later, `prompt.format({context: "...", question: "..."})` fills in values

```typescript
// Line 49: Public async method to initialize vector store
public async initializeVectorStore(docs: Document[]): Promise<void> {
```
**Explanation**:
- `public` = can be called from outside the class
- `async` = can use `await`
- `Promise<void>` = returns Promise that resolves to nothing (void)
- **Example**: `await ragService.initializeVectorStore(docs)` initializes the store

```typescript
// Line 54-56: Create embeddings model instance
const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
});
```
**Explanation**:
- Creates instance that will convert text to vectors
- Reads `MISTRAL_API_KEY` from `process.env` automatically
- `model: "mistral-embed"` = Mistral's embedding model name
- **Example**: `embeddings.embedQuery("text")` returns vector array

```typescript
// Line 59: Create vector store from documents and embeddings
this.vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
```
**Explanation**:
- `HNSWLib.fromDocuments()` = static method (called on class, not instance)
- Takes documents and embeddings model
- Converts each document to embedding, stores in HNSW index
- `this.vectorStore` = sets class property
- **Example**: If `docs` has 5 chunks, creates 5 embeddings and stores them

```typescript
// Line 64: Create retriever from vector store
this.retriever = this.vectorStore.asRetriever();
```
**Explanation**:
- `asRetriever()` = converts vector store to retriever interface
- Retriever has `_getRelevantDocuments()` method for searching
- **Example**: `retriever._getRelevantDocuments("work hours")` finds similar chunks

```typescript
// Line 72: Public async method to query the RAG system
public async query(question: string): Promise<string> {
```
**Explanation**:
- Takes user's question as string
- Returns Promise that resolves to answer string
- **Example**: `await ragService.query("What are work hours?")` → `"9 AM to 5 PM"`

```typescript
// Line 73-75: Check if retriever is initialized
if (!this.retriever) {
  return "Vector store not initialized...";
}
```
**Explanation**:
- Guard clause = early return if not ready
- `!this.retriever` = true if retriever is undefined/null
- **Example**: Prevents errors if `query()` called before `initializeVectorStore()`

```typescript
// Line 77-95: Build RAG chain if not already built
if (!this.chain) {
  this.chain = RunnableSequence.from([...]);
}
```
**Explanation**:
- Lazy initialization = only builds chain on first query
- `RunnableSequence.from()` = creates chain from array of steps
- Chain = series of operations that run in sequence
- **Example**: Chain: retrieve → combine → format → generate → parse

```typescript
// Line 81-87: Step 1 - Parallel map (runs two functions simultaneously)
{
  context: (input: { question: string }) => 
    this.retriever!._getRelevantDocuments(input.question).then(combineDocuments),
  question: (input: { question: string }) => input.question,
}
```
**Explanation**:
- Object with two functions that run in parallel
- `context:` = retrieves documents and combines them
- `question:` = passes question through unchanged
- `!` after `this.retriever` = non-null assertion (TypeScript knows it's not null)
- `.then(combineDocuments)` = Promise chaining
- **Example**: Input `{question: "hours"}` → Output `{context: "9 AM to 5 PM...", question: "hours"}`

```typescript
// Line 89: Step 2 - Format prompt with context and question
this.prompt,
```
**Explanation**:
- PromptTemplate formats the template string
- Replaces `{context}` and `{question}` with actual values
- **Example**: `"You are... {context} Question: {question}"` → formatted string

```typescript
// Line 91: Step 3 - Send prompt to LLM
this.model,
```
**Explanation**:
- ChatGroq model sends prompt to Groq API
- Returns response object
- **Example**: Sends formatted prompt, receives `{content: "9 AM to 5 PM", ...}`

```typescript
// Line 93: Step 4 - Parse LLM response to string
new StringOutputParser(),
```
**Explanation**:
- Extracts text from LLM response object
- Converts to plain string
- **Example**: `{content: "9 AM to 5 PM"}` → `"9 AM to 5 PM"`

```typescript
// Line 100: Execute the chain with user's question
const result = await this.chain.invoke({ question });
```
**Explanation**:
- `invoke()` = runs the entire chain
- Passes `{ question }` as input (shorthand for `{ question: question }`)
- Chain processes through all steps
- **Example**: `invoke({question: "hours"})` → runs all 4 steps → returns answer string

**Class**: `RAGService`

**Properties**:
- `vectorStore`: HNSWLib instance storing document embeddings
- `retriever`: BaseRetriever for semantic search
- `chain`: RunnableSequence representing the RAG pipeline
- `model`: ChatGroq instance (LLM for answer generation)
- `prompt`: PromptTemplate for formatting questions with context

**Methods**:

1. **`initializeVectorStore(docs: Document[])`: Promise<void>**
   - Creates Mistral AI embeddings for all document chunks
   - Initializes HNSWLib vector store with embeddings
   - Creates a retriever from the vector store
   - Stores the vector store and retriever for later use

2. **`query(question: string)`: Promise<string>**
   - Validates that vector store is initialized
   - Builds the RAG chain (if not already built) using LangChain Expression Language (LCEL):
     - **Step 1**: Parallel map that:
       - Retrieves relevant documents using semantic search
       - Combines retrieved documents into context string
       - Passes the original question through
     - **Step 2**: Formats context and question into QA prompt template
     - **Step 3**: Sends formatted prompt to Groq LLM
     - **Step 4**: Parses LLM response to string
   - Executes the chain with the user's question
   - Returns the generated answer

**Prompt Template** (`QA_PROMPT_TEMPLATE`):
- Defines the bot as an "expert HR Policy Bot"
- Instructs to answer only from provided context
- Requires polite response if answer not found in context
- Formats context and question for the LLM

**Configuration**:
- **LLM Model**: `openai/gpt-oss-120b` (Groq's fast inference model)
- **Embeddings Model**: `mistral-embed` (Mistral's embedding model)
- **Vector Store Path**: `./data/hnswlib` (local storage directory)

**Dependencies**:
- `@langchain/community/vectorstores/hnswlib`: HNSWLib vector store
- `@langchain/mistralai`: MistralAIEmbeddings
- `@langchain/groq`: ChatGroq LLM
- `@langchain/core/*`: Core LangChain types and utilities
- `./utils`: combineDocuments helper function

---

### 5.4 `src/utils.ts` - Utility Functions

**Purpose**: Provides helper functions for document processing.

#### Line-by-Line Explanation:

```typescript
// Line 1: Import Document type for TypeScript type checking
import { Document } from "@langchain/core/documents";
```
**Explanation**:
- Imports the `Document` type (not a class, just a type definition)
- Used for type annotations (TypeScript knows what properties Document has)
- **Example**: TypeScript knows `Document` has `pageContent: string` property

```typescript
// Line 4: Export function that combines documents into one string
export const combineDocuments = (docs: Document[]): string => {
```
**Explanation**:
- `export` = makes function available to other files
- `const combineDocuments =` = arrow function assigned to constant
- `(docs: Document[])` = parameter is array of Document objects
- `: string` = return type is string
- `=>` = arrow function syntax
- **Example**: `combineDocuments([doc1, doc2])` → `"text1\n\n---\n\ntext2"`

```typescript
// Line 5: Map documents to their pageContent, then join with separator
return docs.map((doc) => doc.pageContent).join("\n\n---\n\n");
```
**Explanation**:
- `.map()` = transforms array (creates new array)
- `(doc) => doc.pageContent` = arrow function that extracts `pageContent` property
- `.join()` = concatenates array elements with separator string
- `"\n\n---\n\n"` = separator (newlines + dashes + newlines)
- **Example**: 
  - Input: `[{pageContent: "text1"}, {pageContent: "text2"}]`
  - After map: `["text1", "text2"]`
  - After join: `"text1\n\n---\n\ntext2"`

**Functions**:
- `combineDocuments(docs: Document[]): string`
  - Takes an array of Document objects
  - Extracts `pageContent` from each document
  - Joins them with separator `"\n\n---\n\n"`
  - Returns a single concatenated string
  - Used to create context string from retrieved document chunks

**Dependencies**:
- `@langchain/core/documents`: Document type

---

### 5.5 `src/test.ts` - Test Script

**Purpose**: Simple test script for verifying document loading functionality.

#### Line-by-Line Explanation:

```typescript
// Line 1: Import the loadAndSplitFile function
import { loadAndSplitFile } from "./loader";
```
**Explanation**:
- Named import of `loadAndSplitFile` function
- `"./loader"` = relative path to loader.ts file
- **Example**: Can now call `loadAndSplitFile()` in this file

```typescript
// Line 3: Define async test function
async function test() {
```
**Explanation**:
- `async` = function can use `await`
- `test` = function name (not exported, only used in this file)
- **Example**: `test()` can be called to run the test

```typescript
// Line 4: Call loadAndSplitFile and wait for result
const docs = await loadAndSplitFile("./src/company_policy.txt");
```
**Explanation**:
- `await` = waits for Promise to resolve
- `loadAndSplitFile()` returns `Promise<Document[]>`
- `docs` = array of Document objects after splitting
- **Example**: If file has 5000 chars, `docs` might have 5 Document objects

```typescript
// Line 5: Log documents to console for inspection
console.log(docs);
```
**Explanation**:
- `console.log()` = prints to terminal/console
- Prints the entire `docs` array
- **Example**: Shows all Document objects with their `pageContent` and `metadata`

```typescript
// Line 8: Call test() function immediately when file runs
test();
```
**Explanation**:
- Executes `test()` function
- Since `test()` is async, it returns a Promise (not awaited)
- **Example**: Run this file with `npx ts-node src/test.ts` to see output

**Functions**:
- `test()`: Async function that:
  - Loads and splits the company policy file
  - Logs the resulting documents to console
  - Used for debugging and verification

**Dependencies**:
- `./loader`: loadAndSplitFile function

---

### 5.6 `src/company_policy.txt` - Policy Document

**Purpose**: Sample company policy document used as the knowledge base.

**Content**: Contains 5 policy sections:
1. Work Hours (9 AM - 5 PM, Mon-Fri)
2. Remote Work (2 days per week)
3. Paid Time Off (20 days/year, 2 weeks advance notice)
4. Equipment (MacBook Pro issued, must be returned)
5. Dress Code (Casual, collared shirt for client calls)

---

### 5.7 Configuration Files

#### `package.json`
- **Project Name**: policy-bot
- **Type**: CommonJS module
- **Dependencies**:
  - `@langchain/community`: ^1.1.0 (vector stores, community integrations)
  - `@langchain/core`: ^1.1.5 (core LangChain functionality)
  - `@langchain/groq`: ^1.0.2 (Groq LLM integration)
  - `@langchain/mistralai`: ^1.0.2 (Mistral AI embeddings)
  - `@langchain/openai`: ^1.2.0 (OpenAI integration - available but not used)
  - `dotenv`: ^16.6.1 (environment variable management)
  - `hnswlib-node`: ^3.0.0 (HNSW vector index library)
- **Dev Dependencies**:
  - TypeScript, ts-node, nodemon, @types/node

#### `tsconfig.json`
- **Target**: ES2020
- **Module**: CommonJS
- **Strict Mode**: Enabled
- **Output Directory**: `./dist`
- **Source Directory**: `./src`

---

## 6. APIs Used and Their Working

### 6.1 Mistral AI Embeddings API

**Purpose**: Converts text chunks into vector embeddings for semantic search.

**How It Works**:
1. **Initialization**: Creates `MistralAIEmbeddings` instance with model `"mistral-embed"`
2. **API Key**: Reads `MISTRAL_API_KEY` from environment variables
3. **Embedding Generation**: 
   - Each document chunk is sent to Mistral's embedding API
   - API returns a high-dimensional vector (embedding) representing semantic meaning
   - These vectors are stored in the HNSWLib index
4. **Usage**: Used during `initializeVectorStore()` to create embeddings for all document chunks

**API Endpoint**: Mistral AI Embeddings API (via `@langchain/mistralai`)

**Model**: `mistral-embed`

**Key Features**:
- Converts text to numerical vectors
- Preserves semantic relationships (similar texts have similar vectors)
- Enables semantic search functionality

---

### 6.2 Groq LLM API

**Purpose**: Generates human-like answers based on retrieved context and user questions.

**How It Works**:
1. **Initialization**: Creates `ChatGroq` instance with model `"openai/gpt-oss-120b"`
2. **API Key**: Reads `GROQ_API_KEY` from environment variables
3. **Query Processing**:
   - Receives formatted prompt containing:
     - System instructions (role as HR Policy Bot)
     - Retrieved context (relevant policy chunks)
     - User's question
   - Generates answer using the LLM
   - Returns text response
4. **Usage**: Used in the RAG chain's final step to generate answers

**API Endpoint**: Groq Inference API (via `@langchain/groq`)

**Model**: `openai/gpt-oss-120b` (Open-source model optimized for Groq's hardware)

**Key Features**:
- Fast inference (optimized for speed)
- High-quality text generation
- Context-aware responses
- Handles natural language questions

---

### 6.3 HNSWLib (Local Vector Database)

**Purpose**: Stores and searches document embeddings locally.

**How It Works**:
1. **Initialization**: Creates HNSWLib instance from documents and embeddings
2. **Storage**: Stores vectors in memory (or optionally on disk at `./data/hnswlib`)
3. **Search Algorithm**: Uses Hierarchical Navigable Small World (HNSW) algorithm
   - Efficient approximate nearest neighbor search
   - Finds semantically similar document chunks
4. **Retrieval**: 
   - Converts user question to embedding (using Mistral)
   - Searches for most similar document chunks
   - Returns top-k relevant chunks

**Library**: `hnswlib-node` (via `@langchain/community/vectorstores/hnswlib`)

**Key Features**:
- Fast similarity search
- Local storage (no external database needed)
- Efficient memory usage
- Scalable to large document collections

---

## 7. RAG Pipeline Architecture

### 7.1 Retrieval Phase
```
User Question
    ↓
Mistral Embeddings (convert to vector)
    ↓
HNSWLib Vector Store (semantic search)
    ↓
Retrieve Top-K Similar Chunks
    ↓
Combine into Context String
```

### 7.2 Generation Phase
```
Context + Question
    ↓
Prompt Template (format)
    ↓
Groq LLM (generate answer)
    ↓
String Output Parser
    ↓
Final Answer
```

### 7.3 Complete RAG Chain (LCEL)
```typescript
RunnableSequence([
  {
    context: (input) => retrieve + combineDocuments,
    question: (input) => input.question
  },
  PromptTemplate,
  ChatGroq,
  StringOutputParser
])
```

---

## 8. Environment Variables Required

The application requires the following environment variables (stored in `.env` file):

- **`GROQ_API_KEY`**: API key for Groq LLM service
- **`MISTRAL_API_KEY`**: API key for Mistral AI embeddings service

---

## 9. Usage

1. **Setup**:
   ```bash
   npm install
   ```

2. **Configure**:
   Create `.env` file with:
   ```
   GROQ_API_KEY=your_groq_api_key
   MISTRAL_API_KEY=your_mistral_api_key
   ```

3. **Run**:
   ```bash
   npx ts-node src/index.ts
   ```

4. **Interact**:
   - Type questions about company policies
   - Type "exit" to quit

---

## 10. Key Technologies

- **TypeScript**: Type-safe JavaScript
- **LangChain**: RAG framework and abstractions
- **RAG (Retrieval-Augmented Generation)**: AI pattern combining retrieval and generation
- **Vector Embeddings**: Numerical representations of text meaning
- **Semantic Search**: Finding documents by meaning, not keywords
- **HNSW Algorithm**: Efficient approximate nearest neighbor search
- **LCEL (LangChain Expression Language)**: Declarative chain composition

---

## 11. Architecture Patterns

1. **Service Pattern**: RAGService encapsulates all RAG functionality
2. **Chain Pattern**: RAG pipeline built as a composable chain
3. **Repository Pattern**: Vector store acts as document repository
4. **Template Pattern**: Prompt template standardizes LLM input format
5. **Dependency Injection**: Services initialized with dependencies from environment

---

## 12. Error Handling

- API key validation on startup
- Try-catch blocks around initialization
- Error messages for failed queries
- Graceful shutdown on "exit" command

---

## 13. Future Enhancements (Potential)

- Persistent vector store (save/load from disk)
- Multiple document support
- Query history
- Confidence scores for answers
- Web interface instead of CLI
- Support for PDF, DOCX, and other file formats
- Multi-turn conversations with context memory

