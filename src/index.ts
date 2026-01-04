import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import * as dotenv from "dotenv";

import { loadAndSplitFile } from "./loader";
import { RAGService } from "./rag";

// Load environment variables from .env file
dotenv.config();

// Use a glob pattern to read all files in the Dataset folder
const POLICY_FILE_PATH = "./src/Dataset/*";

async function main() {
  console.log("🚀 Policy Bot Initializing...");
  console.log(`[DEBUG] Policy file path: ${POLICY_FILE_PATH}`);
  console.log(`[DEBUG] Current working directory: ${process.cwd()}`);

  // 1. Check for API Keys
  // Check for the LLM key (Groq)
  console.log("[DEBUG-STEP-1] Checking GROQ_API_KEY...");
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ Error: GROQ_API_KEY is not set in your .env file.");
    return;
  }
  console.log("[DEBUG] ✓ GROQ_API_KEY found");
  
  // Check for the Embeddings key (Mistral)
  console.log("[DEBUG-STEP-1] Checking MISTRAL_API_KEY...");
  if (!process.env.MISTRAL_API_KEY) {
    console.error("❌ Error: MISTRAL_API_KEY is not set. Mistral Embeddings will fail.");
    return;
  }
  console.log("[DEBUG] ✓ MISTRAL_API_KEY found");
  
  // Check for MongoDB connection string
  console.log("[DEBUG-STEP-1] Checking MONGODB_URI...");
  if (!process.env.MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI is not set in your .env file.");
    return;
  }
  console.log("[DEBUG] ✓ MONGODB_URI found");
  
  // 2. Initialize the RAG Service
  console.log("[DEBUG-STEP-2] Creating RAGService instance...");
  const ragService = new RAGService();
  console.log("[DEBUG] ✓ RAGService instance created");

  try {
    // 3. Load and Split Documents
    console.log("[DEBUG-STEP-3] Loading and splitting documents...");
    const docs = await loadAndSplitFile(POLICY_FILE_PATH);
    console.log(`[DEBUG] ✓ Documents loaded: ${docs.length} chunks`);
    console.log(`[DEBUG] First chunk preview: ${docs[0]?.pageContent.substring(0, 100)}...`);

    // 4. Index the Documents (Initialize the Vector Store)
    console.log("[DEBUG-STEP-4] Initializing vector store with embeddings...");
    await ragService.initializeVectorStore(docs);
    console.log("[DEBUG] ✓ Vector store initialized");
  } catch (error) {
    console.error("❌ Failed during RAG initialization:", error);
    console.error("[DEBUG] Error details:", JSON.stringify(error, null, 2));
    return;
  }

  console.log("\n🤖 Policy Bot is ready. Ask a question or type 'exit' to quit.\n");

  // 5. Start the Interactive Terminal Loop (Readline)
  console.log("[DEBUG-STEP-5] Starting interactive CLI...");
  const rl = readline.createInterface({ input, output });

  while (true) {
    const question = await rl.question("You: ");
    console.log(`[DEBUG] User input received: "${question}"`);

    if (question.toLowerCase() === "exit") {
      console.log("👋 Goodbye!");
      rl.close();
      break;
    }

    try {
      // 6. Query the RAG Service
      console.log("[DEBUG-STEP-6] Processing query through RAG chain...");
      const answer = await ragService.query(question);
      console.log("[DEBUG] ✓ Query completed");

      // 7. Print the Answer
      console.log(`\nBot: ${answer}\n`);
    } catch (error) {
      console.error("\nAn error occurred while querying the bot:", error);
      console.error("[DEBUG] Error details:", JSON.stringify(error, null, 2));
    }
  }
}

main();