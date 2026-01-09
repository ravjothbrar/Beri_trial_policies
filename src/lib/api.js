/**
 * API Service for BERI Backend
 * Handles all communication with the Python FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Check if the backend server is healthy
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Backend server is not responding');
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Cannot connect to backend server: ${error.message}`);
  }
}

/**
 * Upload a PDF file to the backend
 */
export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload PDF');
  }

  return await response.json();
}

/**
 * Query the policy documents
 */
export async function queryPolicies(query, topK = 4) {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      top_k: topK,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to query policies');
  }

  return await response.json();
}

/**
 * Clear all uploaded data
 */
export async function clearData() {
  const response = await fetch(`${API_BASE_URL}/clear`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to clear data');
  }

  return await response.json();
}

/**
 * Generate a response using the local LLM with retrieval context
 * This function still uses the browser-based LLM for generation
 */
export async function generateResponse(query, retrievedChunks, onToken) {
  // Import LLM module
  const { generateCompletion } = await import('./llm.js');
  const { getSystemPrompt } = await import('./systemPrompt.js');

  // Format context from retrieved chunks
  const context = retrievedChunks
    .map((chunk, idx) => `[${idx + 1}] ${chunk.text} (Source: ${chunk.source})`)
    .join('\n\n');

  // Prepare messages
  const messages = [
    {
      role: 'system',
      content: getSystemPrompt(context),
    },
    {
      role: 'user',
      content: query,
    },
  ];

  // Generate response with streaming
  await generateCompletion(messages, onToken);

  return {
    sources: retrievedChunks.map(chunk => ({
      text: chunk.text,
      source: chunk.source,
      score: chunk.score,
    })),
  };
}
