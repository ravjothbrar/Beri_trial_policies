# Note on Policy Preprocessing

## Current Status

The BERI project includes a Node.js preprocessing script (`scripts/preprocess-policies.js`) that is designed to:
1. Read policy documents from the `raw/` directory
2. Chunk them into manageable segments
3. Generate embeddings using Transformers.js
4. Save the embedded chunks to `src/data/policies.json`

## Known Issue

Currently, the preprocessing script encounters an issue with the `sharp` image processing library, which is an optional dependency of `@xenova/transformers`. The error occurs because:

1. The project was installed with `npm install --ignore-scripts` to work around proxy/network restrictions
2. This prevents `sharp` from building its native binaries
3. When Transformers.js loads, it attempts to load `sharp` even though we're only using text embeddings

## Workarounds

### Option 1: Python Script (Recommended)

Create a Python virtual environment and use sentence-transformers:

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install sentence-transformers numpy
```

Then create `scripts/preprocess-policies.py`:

```python
from sentence_transformers import SentenceTransformer
import json
import os

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Read policy files and generate embeddings
# ... (implementation)
```

### Option 2: Use Browser-Based Preprocessing

Since Transformers.js works perfectly in the browser, you could:
1. Create a simple HTML page that runs the preprocessing in the browser
2. Use the browser's console to export the generated `policies.json`
3. Save it to the `src/data/` directory

### Option 3: Fix Sharp Installation

If you have proper network access:

```bash
rm -rf node_modules package-lock.json
npm install
npm run preprocess
```

### Option 4: Use Pre-Generated Embeddings

For development and testing, you can use the sample `policies.json` provided. For production:
1. Run preprocessing on a machine with proper internet access
2. Copy the generated `policies.json` to your development environment

## Sample Data

The current `src/data/policies.json` contains minimal sample data for testing the application interface. For full functionality, you'll need to generate the complete embedded policy database using one of the workarounds above.

## Testing Without Full Preprocessing

You can still test the BERI interface and functionality with limited data:
1. The UI will load and function normally
2. Queries will work but with limited context
3. The RAG system will retrieve from the available sample chunks
4. The LLM will generate responses based on available context

## Future Improvements

Consider:
- Migrating to a pure Python preprocessing pipeline
- Using a lightweight embedding library without image dependencies
- Creating a Docker image with all dependencies pre-installed
- Providing pre-generated embeddings as part of the repository
