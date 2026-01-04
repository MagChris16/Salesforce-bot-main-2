import { MongoClient, Collection } from "mongodb";
import { MistralAIEmbeddings } from "@langchain/mistralai"; 
import { ChatGroq } from "@langchain/groq"; 
import { Document } from "@langchain/core/documents";
import { BaseRetriever } from "@langchain/core/retrievers";
// --- UPDATED IMPORT ---
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { combineDocuments } from "./utils";
import { ChatOpenAI } from "@langchain/openai";


// Lightweight Mongo-backed vector retriever
class SimpleMongoRetriever {
  constructor(
    private collection: Collection,
    private embeddings: any,
    private topK = 5
  ) {}

  // Compute cosine similarity
  private cosine(a: number[], b: number[]) {
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  public async _getRelevantDocuments(query: string) {
    // Get query embedding
    let qVec: number[];
    if (typeof this.embeddings.embedQuery === "function") {
      qVec = await this.embeddings.embedQuery(query);
    } else if (typeof this.embeddings.embedDocuments === "function") {
      const arr = await this.embeddings.embedDocuments([query]);
      qVec = arr[0];
    } else {
      throw new Error("Embeddings provider has no embed method");
    }

    // Fetch all documents (simple approach). For large collections, replace with vector-aware DB queries.
    const rows = await this.collection.find({}).toArray();
    const scored = rows
      .map((r) => ({
        score: this.cosine(qVec, r.embedding as number[]),
        doc: r,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.topK);

    // Convert to Document[] shape
    return scored.map((s) => ({ pageContent: s.doc.content, metadata: s.doc.metadata } as unknown as any));
  }

  // LangChain may expect getRelevantDocuments; provide compatibility wrapper
  public async getRelevantDocuments(query: string) {
    return this._getRelevantDocuments(query);
  }
}

export class RAGService {
  private mongoClient?: MongoClient;
  private collection?: Collection;
  private retriever?: SimpleMongoRetriever;
  private chain: RunnableSequence | undefined;
  // Simple in-memory conversational memory (keeps recent turns)
  private memory: { role: "user" | "assistant"; content: string }[] = [];
  private maxMemoryTurns = 10;

  private readonly model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0, // Lower temperature for more accurate policy answers
    //topP: 0.6,   
  });

  // --- UPDATED: Using ChatPromptTemplate with System/Human messages ---
  // The prompt now receives `conversation_history` and `context`.
  private readonly prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert in Salesforce domain. Answer the user's question based ONLY on the provided context and the recent conversation history.\n\n--- CONVERSATION HISTORY ---\n{conversation_history}\n--- CONTEXT ---\n{context}\n---"
    ],
    ["human", "{question}"]
  ]);

  public async initializeVectorStore(docs: Document[]): Promise<void> {
    const mistralKey = process.env.MISTRAL_API_KEY;
    if (!mistralKey) {
      throw new Error("MISTRAL_API_KEY not set in environment. Please set it in your .env file.");
    }
    const embeddings = new MistralAIEmbeddings({ model: "mistral-embed", apiKey: mistralKey });

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI!;
    const dbName = process.env.MONGODB_DB_NAME || "policy_bot";
    const collectionName = process.env.MONGODB_COLLECTION || "vectors";
    this.mongoClient = new MongoClient(mongoUri);
    await this.mongoClient.connect();
    const db = this.mongoClient.db(dbName);
    this.collection = db.collection(collectionName);

    // Recreate/clean collection for fresh ingestion
    try {
      await this.collection.deleteMany({});
    } catch (err) {
      console.warn("[WARN] Could not clear existing collection:", err);
    }

    // Compute embeddings for documents
    const texts = docs.map((d) => d.pageContent);
    let vectors: number[][];
    if (typeof (embeddings as any).embedDocuments === "function") {
      vectors = await (embeddings as any).embedDocuments(texts);
    } else {
      // Fallback: embed individually
      vectors = [];
      for (const t of texts) {
        if (typeof (embeddings as any).embedQuery === "function") {
          vectors.push(await (embeddings as any).embedQuery(t));
        } else {
          throw new Error("Embeddings provider does not expose embedDocuments or embedQuery");
        }
      }
    }

    // Insert into collection
    const inserts = docs.map((d, i) => ({ content: d.pageContent, metadata: (d as any).metadata || {}, embedding: vectors[i] }));
    if (inserts.length > 0) {
      await this.collection.insertMany(inserts);
    }

    // Create retriever
    this.retriever = new SimpleMongoRetriever(this.collection, embeddings, 6);
  }

  public async query(question: string): Promise<string> {
    if (!this.retriever) return "Vector store not initialized.";

    if (!this.chain) {
      this.chain = RunnableSequence.from([
        {
          // Retrieve context and pass the question through
          context: async (input: { question: string }) => {
            const docs = await this.retriever!._getRelevantDocuments(input.question);
            const context = combineDocuments(docs);
            console.log(`[DEBUG] Found ${docs.length} relevant chunks.`);
            return { context };
          },
          // Provide conversation history and question to the prompt
          conversation_history: (input: { question: string }) => {
            return this.buildConversationHistory();
          },
          question: (input: { question: string }) => input.question,
        },
        this.prompt, // This now returns a ChatPromptValue (FIXES THE ERROR)
        this.model,
        new StringOutputParser(),
      ]);
    }

    try {
      // Add user's turn to memory before calling the chain
      this.memory.push({ role: "user", content: question });
      // Trim memory if needed
      if (this.memory.length > this.maxMemoryTurns * 2) {
        // Each turn is user+assistant, so trim to recent maxMemoryTurns*2 items
        this.memory = this.memory.slice(-this.maxMemoryTurns * 2);
      }

      const result = await this.chain.invoke({ question });

      // chain.invoke returns parsed string (via StringOutputParser)
      const answer = typeof result === "string" ? result : String(result);

      // Save assistant reply to memory
      this.memory.push({ role: "assistant", content: answer });
      if (this.memory.length > this.maxMemoryTurns * 2) {
        this.memory = this.memory.slice(-this.maxMemoryTurns * 2);
      }

      return answer;
    } catch (error) {
      console.error("❌ Chain Error:", error);
      return "An error occurred while processing your request.";
    }
  }

  // Build a plain-text conversation history from stored memory
  private buildConversationHistory(): string {
    // Keep the most recent N turns (a turn is user+assistant)
    const items = this.memory.slice(-this.maxMemoryTurns * 2);
    return items
      .map((m) => (m.role === "user" ? `User: ${m.content}` : `Assistant: ${m.content}`))
      .join("\n");
  }

  // Optional helpers
  public clearMemory() {
    this.memory = [];
  }

  public getMemory() {
    return [...this.memory];
  }

  public setMaxMemoryTurns(n: number) {
    this.maxMemoryTurns = n;
    // Trim if necessary
    if (this.memory.length > this.maxMemoryTurns * 2) {
      this.memory = this.memory.slice(-this.maxMemoryTurns * 2);
    }
  }
}