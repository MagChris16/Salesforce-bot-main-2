import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error("MONGODB_URI not set in environment");

const dbName = process.env.MONGODB_DB_NAME || "OnboardIQ_bot";
const collName = process.env.MONGODB_COLLECTION || "ClusterMM";
const bm25IndexName = process.env.BM25_INDEX_NAME || `${collName}_bm25_keyword`;

export type Filter = { path: string; value: string };

export async function textSearch(query: string, path: string | string[] = "content", limit = 10, filter?: Filter) {
  const bm25Enabled = (process.env.BM25_SEARCH_ENABLED || "true").toLowerCase() === "true";
  if (!bm25Enabled) {
    const msg = "BM25 text search disabled via BM25_SEARCH_ENABLED=false";
    console.log("[INFO] ", msg);
    throw new Error(msg);
  }

  const client = new MongoClient(mongoUri as string);
  await client.connect();
  try {
    const db = client.db(dbName);
    const coll = db.collection(collName);

    const textStage: any = { query, path };

    let searchBody: any;
    if (filter) {
      searchBody = {
        compound: {
          must: [ { text: textStage } ],
          filter: [ { equals: { path: filter.path, value: filter.value } } ]
        }
      };
    } else {
      searchBody = { text: textStage };
    }

    const pipeline = [
      { $search: { index: bm25IndexName, ...searchBody } },
      { $limit: limit },
      { $project: { content: 1, "metadata.source": 1, score: { $meta: "searchScore" } } }
    ];

    const docs = await coll.aggregate(pipeline).toArray();
    return docs;
  } finally {
    await client.close();
  }
}

// Example usage (commented):
// const hits = await textSearch("license update sandbox", "content", 5, { path: 'metadata.source', value: 'Salesforceadmin.csv' });
// console.log(hits);
