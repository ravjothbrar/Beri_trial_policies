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
      fullText += pageText + '\n';
    }

    return fullText;
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
export function chunkText(text, chunkSize = 500, overlap = 50) {
  // Clean the text
  text = text.replace(/\s+/g, ' ').trim();

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at sentence boundary
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('. ', end);
      if (sentenceEnd > start) {
        end = sentenceEnd + 1;
      }
    }

    const chunk = text.substring(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start = end - overlap;
  }

  return chunks;
}

/**
 * Process a PDF file: extract text and chunk it
 * @param {File} file - The PDF file to process
 * @returns {Promise<{chunks: Array<string>, filename: string}>}
 */
export async function processPDF(file) {
  const text = await extractTextFromPDF(file);
  const chunks = chunkText(text);

  return {
    chunks,
    filename: file.name,
    totalChunks: chunks.length
  };
}
