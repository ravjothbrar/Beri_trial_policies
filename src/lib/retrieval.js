import { embed } from './embeddings';
import { getAllChunks } from './storage';

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Retrieve top-K most relevant chunks for a given query
 */
export async function retrieveContext(query, k = 4) {
  console.log(`Retrieving context for query: "${query}"`);

  // Generate embedding for the query
  const queryEmbedding = await embed(query);

  // Get all chunks from storage
  const chunks = await getAllChunks();

  if (chunks.length === 0) {
    throw new Error('No policy chunks found in database. Please ensure policies are loaded.');
  }

  // Calculate similarity scores
  const scored = chunks.map(chunk => {
    const score = cosineSimilarity(queryEmbedding, chunk.embedding);
    return {
      ...chunk,
      score
    };
  });

  // Sort by score (descending) and take top-K
  const topK = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  console.log(`Retrieved ${topK.length} chunks with scores:`,
    topK.map(c => ({ source: c.metadata.source, score: c.score.toFixed(3) }))
  );

  return topK;
}

/**
 * Format retrieved chunks into a context string
 */
export function formatContext(chunks) {
  return chunks
    .map((chunk, index) => {
      const source = chunk.metadata.source;
      const section = chunk.metadata.section ? ` - ${chunk.metadata.section}` : '';
      return `Source ${index + 1}: ${source}${section}
Content: ${chunk.content}`;
    })
    .join('\n\n---\n\n');
}
