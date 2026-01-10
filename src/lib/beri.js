import { initEmbeddings, embed } from './embeddings';
import { initLLM, generateResponse } from './llm';
import { initStorage, loadPolicies, storeChunk } from './storage';
import { retrieveContext, formatContext } from './retrieval';
import { BERI_SYSTEM_PROMPT } from './systemPrompt';
import { processPDF } from './pdfProcessor';

/**
 * Initialize BERI system with all required components
 */
export async function initBERI(onProgress) {
  try {
    // Step 1: Initialize IndexedDB
    onProgress({ stage: 'Initialising storage...', progress: 10 });
    await initStorage();

    // Step 2: Initialize embedding model
    onProgress({ stage: 'Loading embedding model...', progress: 30 });
    await initEmbeddings();

    // Step 3: Initialize LLM
    onProgress({ stage: 'Loading AI model...', progress: 50 });
    await initLLM((p) => {
      onProgress({
        stage: p.stage || 'Loading AI model...',
        progress: 50 + (p.progress || 0) * 0.4
      });
    });

    onProgress({ stage: 'Ready!', progress: 100 });

    return { success: true };
  } catch (error) {
    console.error('Error initializing BERI:', error);
    throw error;
  }
}

/**
 * Ask BERI a question and get a streamed response
 */
export async function askBERI(query, onToken) {
  try {
    // Retrieve relevant context chunks
    const contextChunks = await retrieveContext(query, 4);

    // Format context for the prompt
    const context = formatContext(contextChunks);

    // Generate response with streaming
    const response = await generateResponse(
      BERI_SYSTEM_PROMPT,
      context,
      query,
      onToken
    );

    // Check if response is empty and provide fallback
    let finalResponse = response;
    if (!response || response.trim().length === 0) {
      const fallbackMessage = "I apologize, but I was unable to generate a response. Based on the context I found, the relevant information is in the sources below. Please review the source excerpts for details related to your question.";
      finalResponse = fallbackMessage;
      // Stream the fallback message
      const words = fallbackMessage.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = i === 0 ? words[i] : ' ' + words[i];
        onToken(word);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }

    // Return response with source information
    return {
      response: finalResponse,
      sources: contextChunks.map(c => ({
        source: c.metadata.source,
        section: c.metadata.section,
        score: c.score,
        text: c.content
      }))
    };
  } catch (error) {
    console.error('Error asking BERI:', error);
    throw error;
  }
}

/**
 * Check if the browser supports required features (CPU-based, no GPU required!)
 */
export async function checkBrowserSupport() {
  const support = {
    indexeddb: false,
    wasm: false,
    reason: ''
  };

  // Check IndexedDB
  if (!window.indexedDB) {
    support.reason = 'IndexedDB not supported';
    return support;
  }
  support.indexeddb = true;

  // Check WebAssembly (required for CPU inference)
  if (typeof WebAssembly === 'undefined') {
    support.reason = 'WebAssembly not supported. Please use a modern browser.';
    return support;
  }
  support.wasm = true;

  return support;
}

/**
 * Upload and process a PDF file (client-side)
 * @param {File} file - The PDF file to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{chunks: number, filename: string}>}
 */
export async function uploadPDF(file, onProgress) {
  try {
    // Step 1: Extract and chunk the PDF
    onProgress?.({ stage: 'Extracting text from PDF...', progress: 10 });
    const { chunks, filename } = await processPDF(file);

    onProgress?.({ stage: 'Generating embeddings...', progress: 40 });

    // Step 2: Generate embeddings for each chunk
    const totalChunks = chunks.length;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Generate embedding
      const embedding = await embed(chunk);

      // Store in IndexedDB
      await storeChunk({
        text: chunk,
        embedding: embedding,
        metadata: {
          source: filename,
          section: `Chunk ${i + 1}`,
          page: Math.floor(i / 3) // Approximate page number
        }
      });

      // Update progress
      const progress = 40 + (i / totalChunks) * 50;
      onProgress?.({
        stage: `Processing chunk ${i + 1}/${totalChunks}...`,
        progress
      });
    }

    onProgress?.({ stage: 'Complete!', progress: 100 });

    return {
      chunks: totalChunks,
      filename
    };
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
}
