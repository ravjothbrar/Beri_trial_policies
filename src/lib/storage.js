import { openDB } from 'idb';

const DB_NAME = 'BERI_PolicyDB';
const DB_VERSION = 1;

let db = null;

export async function initStorage() {
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create chunks store
      if (!db.objectStoreNames.contains('chunks')) {
        const chunksStore = db.createObjectStore('chunks', { keyPath: 'id' });
        chunksStore.createIndex('source', 'metadata.source');
        chunksStore.createIndex('section', 'metadata.section');
      }

      // Create embeddings store
      if (!db.objectStoreNames.contains('embeddings')) {
        db.createObjectStore('embeddings', { keyPath: 'id' });
      }

      // Create metadata store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    }
  });

  return db;
}

export async function loadPolicies() {
  if (!db) {
    await initStorage();
  }

  // Check if policies are already loaded
  const existingMetadata = await db.get('metadata', 'policies_loaded');
  if (existingMetadata?.value) {
    console.log('Policies already loaded from IndexedDB');
    return;
  }

  // Load pre-processed policies from JSON
  try {
    const response = await fetch('/src/data/policies.json');
    const policies = await response.json();

    const tx = db.transaction(['chunks', 'embeddings'], 'readwrite');

    for (const chunk of policies) {
      // Store chunk
      await tx.objectStore('chunks').put({
        id: chunk.id,
        content: chunk.content,
        metadata: chunk.metadata
      });

      // Store embedding separately
      await tx.objectStore('embeddings').put({
        id: chunk.id,
        embedding: chunk.embedding
      });
    }

    await tx.done;

    // Mark as loaded
    await db.put('metadata', { key: 'policies_loaded', value: true, timestamp: Date.now() });

    console.log(`Loaded ${policies.length} policy chunks into IndexedDB`);
  } catch (error) {
    console.error('Error loading policies:', error);
    throw error;
  }
}

export async function getAllChunks() {
  if (!db) {
    await initStorage();
  }

  const chunks = await db.getAll('chunks');
  const embeddings = await db.getAll('embeddings');

  // Merge chunks with their embeddings
  const embeddingMap = new Map(embeddings.map(e => [e.id, e.embedding]));

  return chunks.map(chunk => ({
    ...chunk,
    embedding: embeddingMap.get(chunk.id) || []
  }));
}

export async function getChunksBySource(source) {
  if (!db) {
    await initStorage();
  }

  const tx = db.transaction('chunks', 'readonly');
  const index = tx.store.index('source');
  return await index.getAll(source);
}

export async function storeChunk(chunkData) {
  if (!db) {
    await initStorage();
  }

  const id = `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const tx = db.transaction(['chunks', 'embeddings'], 'readwrite');

  // Store chunk
  await tx.objectStore('chunks').put({
    id,
    content: chunkData.text,
    metadata: chunkData.metadata
  });

  // Store embedding
  await tx.objectStore('embeddings').put({
    id,
    embedding: chunkData.embedding
  });

  await tx.done;

  return id;
}

export async function clearDatabase() {
  if (!db) {
    await initStorage();
  }

  const tx = db.transaction(['chunks', 'embeddings', 'metadata'], 'readwrite');
  await tx.objectStore('chunks').clear();
  await tx.objectStore('embeddings').clear();
  await tx.objectStore('metadata').clear();
  await tx.done();
}
