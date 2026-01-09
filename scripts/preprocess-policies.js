import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHUNK_CONFIG = {
  maxWords: 125,        // ~125 words per chunk
  overlap: 25,          // 25 word overlap between chunks
  minChunkSize: 50      // Minimum viable chunk size
};

const policies = [
  { file: 'e-safety-policy.txt', name: 'E-Safety Policy' },
  { file: 'data-protection-policy.txt', name: 'Data Protection Policy' },
  { file: 'acceptable-use-policy.txt', name: 'Acceptable Use Policy - Students' },
  { file: 'academic-integrity-policy.txt', name: 'Academic Integrity Policy' }
];

/**
 * Split text into words
 */
function getWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0);
}

/**
 * Split text into sections based on headers
 */
function splitBySections(text) {
  const lines = text.split('\n');
  const sections = [];
  let currentSection = { title: 'Introduction', content: '' };

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect section headers (all caps, or starting with a capital and being short)
    if (trimmed.length > 0 && trimmed === trimmed.toUpperCase() && trimmed.length < 100) {
      // Save previous section
      if (currentSection.content.trim().length > 0) {
        sections.push(currentSection);
      }
      // Start new section
      currentSection = { title: trimmed, content: '' };
    } else {
      currentSection.content += line + '\n';
    }
  }

  // Add the last section
  if (currentSection.content.trim().length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Chunk text by word count with overlap
 */
function chunkByWords(text, config) {
  const words = getWords(text);
  const chunks = [];
  const { maxWords, overlap, minChunkSize } = config;

  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxWords);

    if (chunkWords.length >= minChunkSize || i === 0) {
      chunks.push(chunkWords.join(' '));
    }

    // Move forward by (maxWords - overlap) to create overlapping chunks
    i += (maxWords - overlap);
  }

  return chunks;
}

/**
 * Chunk a full document into smaller pieces
 */
function chunkDocument(text, source) {
  const chunks = [];
  const sections = splitBySections(text);

  let globalChunkIndex = 0;

  for (const section of sections) {
    const sectionChunks = chunkByWords(section.content, CHUNK_CONFIG);

    sectionChunks.forEach((content, localIndex) => {
      chunks.push({
        id: `${source.replace(/\s+/g, '_').toLowerCase()}_${globalChunkIndex}`,
        content: content.trim(),
        metadata: {
          source: source,
          section: section.title,
          chunkIndex: globalChunkIndex
        }
      });
      globalChunkIndex++;
    });
  }

  return chunks;
}

/**
 * Generate embedding for text
 */
async function generateEmbedding(embedder, text) {
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Main preprocessing function
 */
async function preprocessPolicies() {
  console.log('Starting policy preprocessing...\n');

  // Initialize embedding model
  console.log('Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('Embedding model loaded successfully.\n');

  const allChunks = [];

  for (const policy of policies) {
    console.log(`Processing: ${policy.name}`);

    const filePath = path.join(__dirname, '..', 'raw', policy.file);

    if (!fs.existsSync(filePath)) {
      console.error(`  ❌ File not found: ${filePath}`);
      continue;
    }

    const text = fs.readFileSync(filePath, 'utf-8');
    const chunks = chunkDocument(text, policy.name);

    console.log(`  Chunked into ${chunks.length} pieces`);
    console.log(`  Generating embeddings...`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(embedder, chunk.content);
      chunk.embedding = embedding;

      // Progress indicator
      if ((i + 1) % 5 === 0 || i === chunks.length - 1) {
        process.stdout.write(`\r  Progress: ${i + 1}/${chunks.length} chunks`);
      }
    }

    console.log('\n  ✓ Complete\n');
    allChunks.push(...chunks);
  }

  // Save to JSON
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'policies.json');
  fs.writeFileSync(outputPath, JSON.stringify(allChunks, null, 2));

  console.log(`\n✅ Preprocessing complete!`);
  console.log(`   Total chunks: ${allChunks.length}`);
  console.log(`   Output file: ${outputPath}`);
  console.log(`   File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
}

// Run preprocessing
preprocessPolicies().catch(error => {
  console.error('Error during preprocessing:', error);
  process.exit(1);
});
