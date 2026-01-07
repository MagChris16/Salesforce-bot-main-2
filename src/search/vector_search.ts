import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error("MONGODB_URI not set in environment");

const dbName = process.env.MONGODB_DB_NAME || "OnboardIQ_bot";
const collName = process.env.MONGODB_COLLECTION || "ClusterMM";
const indexName = process.env.VECTOR_INDEX_NAME || `${collName}_vector_search`;

export type Filter = { path: string; value: string };

export async function vectorSearch(queryVector: number[], k = 5, filter?: Filter) {
  const vectorEnabled = (process.env.VECTOR_SEARCH_ENABLED || "true").toLowerCase() === "true";
  if (!vectorEnabled) {
    const msg = "Vector search disabled via VECTOR_SEARCH_ENABLED=false";
    console.log("[INFO] ", msg);
    throw new Error(msg);
  }

  const client = new MongoClient(mongoUri as string);
  await client.connect();
  try {
    const db = client.db(dbName);
    const coll = db.collection(collName);

    // Build $search stage using provided index name
    const knnStage: any = { path: "embedding", vector: queryVector, k };

    let searchBody: any;
    if (filter) {
      // Use compound to combine knn with filter
      searchBody = {
        compound: {
          must: [{ knn: knnStage }],
          filter: [{ equals: { path: filter.path, value: filter.value } }],
        },
      };
    } else {
      searchBody = { knn: knnStage };
    }

    const pipeline = [
      { $search: { index: indexName, ...searchBody } },
      { $project: { content: 1, "metadata.source": 1, score: { $meta: "searchScore" } } },
    ];

    const docs = await coll.aggregate(pipeline).toArray();
    return docs;
  } finally {
    await client.close();
  }
}

// Example usage (commented):
// const res = await vectorSearch(myVectorArray, 5, { path: 'metadata.source', value: 'Salesforceadmin.csv' });
// console.log(res);
