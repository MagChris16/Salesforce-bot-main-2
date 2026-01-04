import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { MongoClient } from "mongodb";
import { MistralAIEmbeddings } from "@langchain/mistralai";

const DATASET_DIR = path.join(process.cwd(), "src", "Dataset");

function sanitizeName(name: string) {
  return name.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
}

async function createAtlasSearchIndexIfRequested(opts: {
  projectId: string;
  publicKey: string;
  privateKey: string;
  dbName: string;
  collectionName: string;
  dimensions: number;
}) {
  const { projectId, publicKey, privateKey, dbName, collectionName, dimensions } = opts;
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${projectId}/fts/indexes`;

  const body = {
    collectionName,
    database: dbName,
    name: `${collectionName}_vector_search`,
    // Minimal mapping for vector search
    mappings: {
      dynamic: false,
      fields: {
        content: { type: "string" },
        embedding: {
          type: "knn",
          dimensions,
          similarity: "cosine",
        },
      },
    },
  };

  const auth = Buffer.from(`${publicKey}:${privateKey}`).toString("base64");

  try {
    // Use global fetch (Node 18+). If not available, user should install node-fetch.
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.warn(`[WARN] Atlas index creation failed: ${res.status} ${res.statusText} - ${txt}`);
      return false;
    }

    console.log(`[INFO] Atlas search index created for ${collectionName}`);
    return true;
  } catch (err) {
    console.warn("[WARN] Failed to call Atlas API to create search index:", err);
    return false;
  }
}

export async function createVectorIndexesFromDataset() {
  console.log("[INFO] Scanning dataset directory:", DATASET_DIR);
  const files = fs.readdirSync(DATASET_DIR).filter((f) => /\.csv$/i.test(f)).slice(0, 5);
  if (files.length === 0) {
    console.warn("[WARN] No CSV files found in Dataset directory.");
    return;
  }

  // Setup embeddings
  const mistralKey = process.env.MISTRAL_API_KEY;
  if (!mistralKey) {
    throw new Error("MISTRAL_API_KEY not set in environment. Please set it in your .env file.");
  }
  const embeddings = new MistralAIEmbeddings({ model: "mistral-embed", apiKey: mistralKey });

  // MongoDB connection
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI not set in environment");
  const dbName = process.env.MONGODB_DB_NAME || "policy_bot";
  const baseCollection = process.env.MONGODB_COLLECTION || "vectors";

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);

  // Atlas credentials (optional)
  const atlasPublic = process.env.MONGODB_ATLAS_API_PUBLIC;
  const atlasPrivate = process.env.MONGODB_ATLAS_API_PRIVATE;
  const atlasProjectId = process.env.MONGODB_ATLAS_PROJECT_ID;

  for (const file of files) {
    const filePath = path.join(DATASET_DIR, file);
    console.log(`[INFO] Processing file: ${filePath}`);
    const raw = fs.readFileSync(filePath, "utf8");
    // Parse CSV rows into arrays of cells
    let records: string[][] = [];
    try {
      records = parse(raw, { relax_column_count: true });
    } catch (err) {
      // Fallback: treat entire file as single document
      records = [[raw]];
    }

    // Convert rows to text documents (join cells)
    const texts = records.map((r) => r.join(" ").trim()).filter(Boolean);
    if (texts.length === 0) {
      console.warn(`[WARN] No rows extracted from ${file}`);
      continue;
    }

    // Compute embeddings (batch)
    let vectors: number[][] = [];
    if (typeof (embeddings as any).embedDocuments === "function") {
      vectors = await (embeddings as any).embedDocuments(texts);
    } else if (typeof (embeddings as any).embedQuery === "function") {
      for (const t of texts) vectors.push(await (embeddings as any).embedQuery(t));
    } else {
      throw new Error("Embeddings provider missing embedDocuments/embedQuery");
    }

    // Create collection per file
    const collName = `${baseCollection}_${sanitizeName(path.basename(file, path.extname(file)))}`;
    const coll = db.collection(collName);

    // Optionally clear existing
    try {
      await coll.deleteMany({});
    } catch (err) {
      console.warn(`[WARN] Could not clear collection ${collName}:`, err);
    }

    const docs = texts.map((t, i) => ({ content: t, metadata: { source: file, row: i }, embedding: vectors[i] }));
    if (docs.length > 0) {
      await coll.insertMany(docs);
      console.log(`[INFO] Inserted ${docs.length} docs into collection ${collName}`);
    }

    // If Atlas credentials are present attempt to create server-side vector index
    if (atlasPublic && atlasPrivate && atlasProjectId) {
      const dims = vectors[0]?.length || 1536;
      await createAtlasSearchIndexIfRequested({
        projectId: atlasProjectId,
        publicKey: atlasPublic,
        privateKey: atlasPrivate,
        dbName,
        collectionName: collName,
        dimensions: dims,
      });
    } else {
      console.log(`[INFO] Atlas credentials not provided; stored embeddings in collection ${collName} (client-side scoring).`);
    }
  }

  await client.close();
  console.log("[INFO] Completed creating vector indexes for selected dataset files.");
}

export default createVectorIndexesFromDataset;
