"""
BERI Backend API
FastAPI server for policy document processing and retrieval
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import numpy as np
from sentence_transformers import SentenceTransformer
import PyPDF2
import io
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="BERI API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
embedding_model = None
policy_chunks = []
chunk_embeddings = []

# Request/Response Models
class QueryRequest(BaseModel):
    query: str
    top_k: int = 4

class ChunkResponse(BaseModel):
    text: str
    source: str
    score: float

class QueryResponse(BaseModel):
    chunks: List[ChunkResponse]
    query_embedding: Optional[List[float]] = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    num_chunks: int

# Initialize embedding model
@app.on_event("startup")
async def startup_event():
    """Load the sentence-transformers model on startup"""
    global embedding_model
    try:
        logger.info("Loading sentence-transformers model...")
        # Using the same model as the frontend for consistency
        embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and status"""
    return HealthResponse(
        status="healthy",
        model_loaded=embedding_model is not None,
        num_chunks=len(policy_chunks)
    )

# PDF upload and chunking
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF policy document, extract text, chunk it, and create embeddings
    """
    global policy_chunks, chunk_embeddings

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    try:
        # Read PDF content
        logger.info(f"Processing PDF: {file.filename}")
        contents = await file.read()
        pdf_file = io.BytesIO(contents)

        # Extract text from PDF
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        full_text = ""
        for page_num, page in enumerate(pdf_reader.pages):
            text = page.extract_text()
            full_text += f"\n{text}"

        if not full_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from PDF")

        # Chunk the text
        chunks = chunk_text(full_text, chunk_size=500, overlap=50)
        logger.info(f"Created {len(chunks)} chunks from {file.filename}")

        # Create embeddings
        logger.info("Generating embeddings...")
        embeddings = embedding_model.encode(chunks, show_progress_bar=False)

        # Store chunks and embeddings
        new_chunks = [
            {
                "text": chunk,
                "source": file.filename,
                "metadata": {"page": i // 3}  # Approximate page number
            }
            for i, chunk in enumerate(chunks)
        ]

        policy_chunks.extend(new_chunks)
        if len(chunk_embeddings) == 0:
            chunk_embeddings = embeddings
        else:
            chunk_embeddings = np.vstack([chunk_embeddings, embeddings])

        return {
            "message": f"Successfully processed {file.filename}",
            "chunks_created": len(chunks),
            "total_chunks": len(policy_chunks)
        }

    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

# Query endpoint
@app.post("/query", response_model=QueryResponse)
async def query_policies(request: QueryRequest):
    """
    Query the policy documents using semantic search
    """
    if len(policy_chunks) == 0:
        raise HTTPException(status_code=400, detail="No policy documents uploaded yet")

    try:
        # Generate query embedding
        query_embedding = embedding_model.encode([request.query])[0]

        # Calculate cosine similarity
        similarities = cosine_similarity(query_embedding, chunk_embeddings)

        # Get top-k results
        top_indices = np.argsort(similarities)[-request.top_k:][::-1]

        results = [
            ChunkResponse(
                text=policy_chunks[idx]["text"],
                source=policy_chunks[idx]["source"],
                score=float(similarities[idx])
            )
            for idx in top_indices
        ]

        return QueryResponse(
            chunks=results,
            query_embedding=query_embedding.tolist()
        )

    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

# Clear all data
@app.post("/clear")
async def clear_data():
    """Clear all uploaded policies and embeddings"""
    global policy_chunks, chunk_embeddings
    policy_chunks = []
    chunk_embeddings = []
    return {"message": "All data cleared successfully"}

# Utility functions
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks

    Args:
        text: The text to chunk
        chunk_size: Target size of each chunk in characters
        overlap: Number of characters to overlap between chunks

    Returns:
        List of text chunks
    """
    # Clean the text
    text = text.replace('\n', ' ').replace('\r', ' ')
    text = ' '.join(text.split())  # Normalize whitespace

    chunks = []
    start = 0

    while start < len(text):
        # Find the end of this chunk
        end = start + chunk_size

        # If not at the end, try to break at a sentence boundary
        if end < len(text):
            # Look for sentence endings
            for punct in ['. ', '! ', '? ', '\n']:
                last_punct = text.rfind(punct, start, end)
                if last_punct != -1:
                    end = last_punct + 1
                    break

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # Move start position with overlap
        start = end - overlap if end < len(text) else end

    return chunks

def cosine_similarity(query_vec: np.ndarray, doc_vecs: np.ndarray) -> np.ndarray:
    """
    Calculate cosine similarity between query and document vectors

    Args:
        query_vec: Query embedding vector
        doc_vecs: Matrix of document embedding vectors

    Returns:
        Array of similarity scores
    """
    # Normalize vectors
    query_norm = query_vec / np.linalg.norm(query_vec)
    doc_norms = doc_vecs / np.linalg.norm(doc_vecs, axis=1, keepdims=True)

    # Calculate dot product
    similarities = np.dot(doc_norms, query_norm)

    return similarities

# Run server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
