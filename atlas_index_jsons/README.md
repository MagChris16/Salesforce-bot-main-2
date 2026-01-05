This directory contains Atlas Search index JSON bodies for the `ClusterMM` collection.

Usage:
1. Import via Atlas UI: Clusters → Search Indexes → Create Search Index → Import JSON
2. Or POST to the Atlas API (replace placeholders):

```bash
curl -u "<PUBLIC_KEY>:<PRIVATE_KEY>" -H "Content-Type: application/json" \
  -X POST "https://cloud.mongodb.com/api/atlas/v1.0/groups/<PROJECT_ID>/fts/indexes" \
  -d @atlas_index_jsons/ClusterMM_vector_index.json
```

Files included:
- `ClusterMM_index.json` — single vector search index (embedding field, 1024 dims).
- `ClusterMM_vector_index.json` — vector index (embedding knn, 1024 dims + filter fields).
- `ClusterMM_bm25keyword_index.json` — BM25 / keyword mappings for textual fields.
- `ClusterMM_mappings_only.json` — mappings-only JSON for Atlas UI import flows that disallow top-level properties.
- `ClusterMM_vector_format.json` — alternate vector-index `fields` array format (numDimensions + path + type).

Notes:
- Ensure your documents in `OnboardIQ_bot.ClusterMM` have an `embedding` array of length `1024`.
- The vector index uses Atlas `knn` (vector search). The BM25 file contains text field analyzers.

Import format guidance:

- `ClusterMM_vector_index.json` / `ClusterMM_bm25keyword_index.json`: full Atlas Search API body (includes `collectionName`, `database`, `name`, `mappings`). Use these when POSTing to the Atlas Search API endpoint `POST /api/atlas/v1.0/groups/{PROJECT_ID}/fts/indexes`.
- `ClusterMM_mappings_only.json`: contains only the `mappings` object. Use this for the Atlas web UI "Import JSON" in Search Indexes if the UI complains that top-level properties such as `collectionName` / `database` / `name` are not allowed.
- `ClusterMM_vector_format.json`: alternate format using a `fields` array with `type: "vector"` and `numDimensions`. Some Atlas vector tooling or import flows expect this schema — use it if the UI you're working with requires the `fields` array format.

If you want, I can attempt to POST the full API body for you (requires `MONGODB_ATLAS_API_PUBLIC`, `MONGODB_ATLAS_API_PRIVATE`, and `MONGODB_ATLAS_PROJECT_ID` set in `.env`).
This directory contains Atlas Search index JSON bodies (one per collection)

Usage:
1. Import via Atlas UI: Clusters → Search Indexes → Create Search Index → Import JSON
2. Or POST to the Atlas API (replace placeholders):

```bash
curl -u "<PUBLIC_KEY>:<PRIVATE_KEY>" -H "Content-Type: application/json" \
	-X POST "https://cloud.mongodb.com/api/atlas/v1.0/groups/<PROJECT_ID>/fts/indexes" \
	-d @atlas_index_jsons/ClusterMM_vector_index.json
```

Files included:
- `ClusterMM_index.json` — single vector search index (embedding field, 1024 dims).
- `ClusterMM_vector_index.json` — vector index (embedding knn, 1024 dims + filter fields).
- `ClusterMM_bm25keyword_index.json` — BM25 / keyword mappings for textual fields.

Notes:
- Ensure your documents in `OnboardIQ_bot.ClusterMM` have an `embedding` array of length `1024`.
- The vector index uses Atlas `knn` (vector search). The BM25 file contains text field analyzers.
