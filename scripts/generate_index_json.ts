import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const DATASET_DIR = path.join(process.cwd(), "src", "Dataset");
const OUT_DIR = path.join(process.cwd(), "atlas_index_jsons");

function sanitizeName(name: string) {
  return name.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
}

function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

function makeIndexBody(dbName: string, collectionName: string, dims = 1024) {
  return {
    collectionName,
    database: dbName,
    name: process.env.VECTOR_INDEX_NAME || `${collectionName}_vector_search`,
    mappings: {
      dynamic: false,
      fields: {
        content: { type: "string" },
        embedding: {
          type: "knn",
          dimensions: dims,
          similarity: "cosine",
        },
      },
    },
  };
}

function makeBM25Body(dbName: string, collectionName: string) {
  return {
    collectionName,
    database: dbName,
    name: process.env.BM25_INDEX_NAME || `${collectionName}_bm25_keyword`,
    mappings: {
      dynamic: false,
      fields: {
        content: { type: "string", analyzer: "lucene.standard" },
        metadata: {
          type: "document",
          fields: {
            source: { type: "string", analyzer: "lucene.keyword" }
          }
        }
      }
    }
  };
}

async function main() {
  ensureOutDir();

  const dbName = process.env.MONGODB_DB_NAME || "OnboardIQ_bot";
  const baseCollection = process.env.MONGODB_COLLECTION || "ClusterMM";

  if (!fs.existsSync(DATASET_DIR)) {
    console.error("Dataset directory not found:", DATASET_DIR);
    process.exit(1);
  }

  // Single collection index files for the whole collection (ClusterMM)
  const collName = baseCollection;

  // Vector index JSON (full API body)
  const vectorBody = makeIndexBody(dbName, collName, 1024);
  const vectorOutPath = path.join(OUT_DIR, `${collName}_vector_index.json`);
  fs.writeFileSync(vectorOutPath, JSON.stringify(vectorBody, null, 2), "utf8");
  console.log(`Wrote vector index JSON for collection: ${collName} -> ${vectorOutPath}`);

  // BM25 keyword index JSON (full API body)
  const bm25Body = makeBM25Body(dbName, collName);
  const bm25OutPath = path.join(OUT_DIR, `${collName}_bm25keyword_index.json`);
  fs.writeFileSync(bm25OutPath, JSON.stringify(bm25Body, null, 2), "utf8");
  console.log(`Wrote BM25 keyword index JSON for collection: ${collName} -> ${bm25OutPath}`);

  // Also write a small README
  const readme = `This directory contains Atlas Search index JSON bodies (one per collection)

Usage:
1. Upload the corresponding JSON to Atlas UI ("Create Search Index" -> "Import JSON") or POST it to the Atlas API:

curl -u "<PUBLIC_KEY>:<PRIVATE_KEY>" -H "Content-Type: application/json" \
  -X POST "https://cloud.mongodb.com/api/atlas/v1.0/groups/<PROJECT_ID>/fts/indexes" \
  -d @<FILE>.json

Each JSON already uses "embedding" as the vector field and "dimensions": 1024.
`;
  fs.writeFileSync(path.join(OUT_DIR, "README.md"), readme, "utf8");

  console.log("Done. JSON files are in:", OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
