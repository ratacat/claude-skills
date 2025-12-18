/**
 * Stage 2: Extract structured information from each chapter in parallel
 */
import fs from 'fs';
import { generateJson } from '../llm/client.js';
import { extractChapterText } from './identify-chapters.js';

/**
 * Load prompt template
 * @returns {string}
 */
function loadPromptTemplate() {
  return fs.readFileSync('src/prompts/extract-chapter.md', 'utf-8');
}

/**
 * Extract information from a single chapter
 * @param {string} chapterTitle - Title of the chapter
 * @param {string} chapterText - Text content of the chapter
 * @param {string} bookTitle - Title of the book (for context)
 * @param {string} model - LLM model to use
 * @returns {Promise<Object>} Chapter extract (see extraction.js types)
 */
export async function extractChapter(chapterTitle, chapterText, bookTitle, model = 'gemini-3-pro-preview') {
  const template = loadPromptTemplate();
  const prompt = template
    .replace('{CHAPTER_TITLE}', chapterTitle)
    .replace('{CHAPTER_TEXT}', chapterText);

  const extract = await generateJson(model, prompt, {
    temperature: 0.3,
    maxOutputTokens: 8192,
  });

  // Ensure chapter_title is set
  if (!extract.chapter_title) {
    extract.chapter_title = chapterTitle;
  }

  return extract;
}

/**
 * Process multiple chapters in parallel
 * @param {string} bookText - Full book text
 * @param {string} bookTitle - Title of the book
 * @param {Array<{title: string, start_pos: number, end_pos: number}>} chapters - Chapter info
 * @param {Object} options - Processing options
 * @param {number} [options.concurrency=5] - Max concurrent LLM calls
 * @param {string} [options.model='gemini-2.5-flash'] - LLM model
 * @param {Function} [options.onProgress] - Progress callback: (completed, total, chapterTitle) => void
 * @returns {Promise<Array<Object>>} Array of chapter extracts
 */
export async function extractChapters(bookText, bookTitle, chapters, options = {}) {
  const {
    concurrency = 5,
    model = 'gemini-3-pro-preview',
    onProgress = null,
  } = options;

  const results = new Array(chapters.length);
  const errors = [];
  let completed = 0;

  // Process chapters with controlled concurrency
  const processChapter = async (index) => {
    const chapter = chapters[index];
    try {
      const chapterText = extractChapterText(bookText, chapter.start_pos, chapter.end_pos);
      const extract = await extractChapter(chapter.title, chapterText, bookTitle, model);
      results[index] = extract;
      completed++;

      if (onProgress) {
        onProgress(completed, chapters.length, chapter.title);
      }

      return { index, success: true };
    } catch (error) {
      completed++;
      errors.push({ index, title: chapter.title, error: error.message });

      if (onProgress) {
        onProgress(completed, chapters.length, chapter.title, error);
      }

      return { index, success: false, error };
    }
  };

  // Create worker pool
  const indices = Array.from({ length: chapters.length }, (_, i) => i);
  const promises = [];

  for (let i = 0; i < Math.min(concurrency, chapters.length); i++) {
    promises.push(
      (async () => {
        while (indices.length > 0) {
          const index = indices.shift();
          if (index !== undefined) {
            await processChapter(index);
          }
        }
      })()
    );
  }

  await Promise.all(promises);

  // Filter out failed extractions (null values)
  const successfulExtracts = results.filter((r) => r !== null && r !== undefined);

  if (errors.length > 0) {
    console.warn(`  ⚠ ${errors.length} chapter(s) failed to process:`);
    errors.forEach(({ title, error }) => {
      console.warn(`    - ${title}: ${error}`);
    });
  }

  if (successfulExtracts.length === 0) {
    throw new Error('All chapter extractions failed');
  }

  return successfulExtracts;
}
