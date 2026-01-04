import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const atlasPublic = process.env.MONGODB_ATLAS_API_PUBLIC;
const atlasPrivate = process.env.MONGODB_ATLAS_API_PRIVATE;
const atlasProjectId = process.env.MONGODB_ATLAS_PROJECT_ID;
const dbName = process.env.MONGODB_DB_NAME || "policy_bot";
const baseCollection = process.env.MONGODB_COLLECTION || "vectors";

if (!atlasPublic || !atlasPrivate || !atlasProjectId) {
  console.error("Missing Atlas API credentials. Set MONGODB_ATLAS_API_PUBLIC, MONGODB_ATLAS_API_PRIVATE, and MONGODB_ATLAS_PROJECT_ID in .env");
  process.exit(1);
}

function sanitizeName(name: string) {
  return name.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
}

async function createAtlasIndex(collectionName: string, dimensions = 1536) {
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${atlasProjectId}/fts/indexes`;
  const body = {
    collectionName,
    database: dbName,
    name: `${collectionName}_vector_search`,
    mappings: {
      dynamic: false,
      fields: {
        content: { type: "string" },
        embedding: { type: "knn", dimensions, similarity: "cosine" },
      },
    },
  };

  const auth = Buffer.from(`${atlasPublic}:${atlasPrivate}`).toString("base64");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(`Atlas index creation failed for ${collectionName}: ${res.status} ${res.statusText} - ${txt}`);
      return false;
    }
    console.log(`Atlas index created for ${collectionName}`);
    return true;
  } catch (err) {
    console.error(`Failed creating atlas index for ${collectionName}:`, err);
    return false;
  }
}

async function main() {
  const DATASET_DIR = path.join(process.cwd(), "src", "Dataset");
  if (!fs.existsSync(DATASET_DIR)) {
    console.error("Dataset directory not found", DATASET_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(DATASET_DIR).filter((f) => /\.csv$/i.test(f)).slice(0, 5);
  const collNames = files.map((file) => `${baseCollection}_${sanitizeName(path.basename(file, path.extname(file)))}`);

  // Also include the env-specified collection if different
  if (!collNames.includes(baseCollection)) collNames.push(baseCollection);

  for (const cn of collNames) {
    await createAtlasIndex(cn);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
