/**
 * Text extraction from various book formats (EPUB, PDF, MOBI)
 */
import fs from 'fs';
import path from 'path';
import { initEpubFile } from '@lingo-reader/epub-parser';
import pdfParse from 'pdf-parse';

/**
 * Extract text from EPUB file
 * @param {string} filePath - Path to EPUB file
 * @returns {Promise<string>} Extracted text
 */
async function extractEpub(filePath) {
  try {
    // Initialize EPUB parser
    const epub = await initEpubFile(filePath);

    // Extract text from all spine items (chapters)
    const textParts = [];
    const spine = epub.getSpine();

    for (const spineItem of spine) {
      const chapter = await epub.loadChapter(spineItem.id);
      if (chapter && chapter.html) {
        // Strip HTML tags
        const cleaned = chapter.html
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleaned) {
          textParts.push(cleaned);
        }
      }
    }

    // Cleanup temp files
    epub.destroy();

    return textParts.join('\n\n');
  } catch (error) {
    throw new Error(`Failed to parse EPUB: ${error.message}`);
  }
}

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

/**
 * Extract text from MOBI file (requires Calibre's ebook-convert)
 * @param {string} filePath - Path to MOBI file
 * @returns {Promise<string>} Extracted text
 */
async function extractMobi(filePath) {
  // MOBI extraction requires external tool (Calibre)
  // For now, throw error with helpful message
  throw new Error(
    'MOBI extraction requires Calibre. Install with: brew install calibre\n' +
    'Or convert to EPUB first: ebook-convert input.mobi output.epub'
  );
}

/**
 * Extract text from a book file (auto-detects format)
 * @param {string} filePath - Path to book file
 * @returns {Promise<string>} Extracted text
 */
export async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.epub':
      return extractEpub(filePath);
    case '.pdf':
      return extractPdf(filePath);
    case '.mobi':
    case '.azw':
    case '.azw3':
      return extractMobi(filePath);
    default:
      throw new Error(`Unsupported file format: ${ext}. Supported formats: .epub, .pdf, .mobi`);
  }
}
