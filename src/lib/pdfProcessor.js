/**
 * Client-side PDF Processing
 * Extracts text from PDFs using pdf.js in the browser
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Extract text from a PDF file
 * @param {File} file - The PDF file to process
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';
    }

    // Validate we got some text
    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No text could be extracted from this PDF. It may be a scanned image or empty document.');
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Chunk text into smaller pieces with overlap
 * @param {string} text - The text to chunk
 * @param {number} chunkSize - Size of each chunk in characters
 * @param {number} overlap - Overlap between chunks
 * @returns {Array<string>} - Array of text chunks
 */
export function chunkText(text, chunkSize = 1000, overlap = 100) {
  // Validate input
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Clean the text
  text = text.replace(/\s+/g, ' ').trim();

  // If text is very short, return it as a single chunk
  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    // Try to break at sentence boundary
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('. ', end);
      if (sentenceEnd > start + chunkSize * 0.5) {
        end = sentenceEnd + 1;
      }
    }

    const chunk = text.substring(start, end).trim();
    if (chunk.length > 50) { // Only add substantial chunks
      chunks.push(chunk);
    }

    // Move to next chunk with overlap
    start = end - overlap;

    // Safety check: prevent infinite loop and limit chunks
    if (chunks.length >= 500) {
      console.warn('Reached maximum chunk limit of 500');
      break;
    }
  }

  console.log(`Created ${chunks.length} chunks from ${text.length} characters`);
  return chunks;
}

/**
 * Process a PDF file: extract text and chunk it
 * @param {File} file - The PDF file to process
 * @returns {Promise<{chunks: Array<string>, filename: string}>}
 */
export async function processPDF(file) {
  try {
    const text = await extractTextFromPDF(file);
    const chunks = chunkText(text);

    // Validate we got some chunks
    if (!chunks || chunks.length === 0) {
      throw new Error('Failed to create chunks from PDF text');
    }

    console.log(`PDF processed: ${chunks.length} chunks created from ${file.name}`);

    return {
      chunks,
      filename: file.name,
      totalChunks: chunks.length
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}
