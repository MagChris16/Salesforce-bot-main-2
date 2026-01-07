This directory contains Atlas Search index JSON bodies (one per collection)

Usage:
1. Upload the corresponding JSON to Atlas UI ("Create Search Index" -> "Import JSON") or POST it to the Atlas API:

curl -u "<PUBLIC_KEY>:<PRIVATE_KEY>" -H "Content-Type: application/json"   -X POST "https://cloud.mongodb.com/api/atlas/v1.0/groups/<PROJECT_ID>/fts/indexes"   -d @<FILE>.json

Each JSON already uses "embedding" as the vector field and "dimensions": 1024.
