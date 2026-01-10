import { pipeline } from '@huggingface/transformers';

let embedder = null;

export async function initEmbeddings() {
  if (embedder) {
    return embedder;
  }

  console.log('Initialising embedding model...');

  try {
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );

    console.log('Embedding model loaded successfully');
    return embedder;
  } catch (error) {
    console.error('Error loading embedding model:', error);
    throw error;
  }
}

export async function embed(text) {
  if (!embedder) {
    await initEmbeddings();
  }

  try {
    const output = await embedder(text, {
      pooling: 'mean',
      normalize: true
    });

    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export function getEmbeddingDimensions() {
  return 384; // all-MiniLM-L6-v2 produces 384-dimensional vectors
}
