/**
 * Stage 1: Identify chapter boundaries in book text
 */
import fs from 'fs';
import { generateJson } from '../llm/client.js';

/**
 * Load prompt template
 * @returns {string}
 */
function loadPromptTemplate() {
  return fs.readFileSync('src/prompts/identify-chapters.md', 'utf-8');
}

/**
 * Identify chapters in book text using LLM
 * @param {string} bookText - Full text of the book
 * @param {string} model - LLM model to use (default: gemini-2.5-flash)
 * @returns {Promise<Array<{title: string, start_pos: number, end_pos: number}>>}
 */
export async function identifyChapters(bookText, model = 'gemini-3-pro-preview') {
  const template = loadPromptTemplate();
  const prompt = template.replace('{BOOK_TEXT}', bookText);

  console.log('  Sending book text to LLM for chapter identification...');
  console.log(`  Book length: ${bookText.length.toLocaleString()} characters`);

  const chapters = await generateJson(model, prompt, {
    temperature: 0.2, // Low temperature for factual extraction
    maxOutputTokens: 8192,
  });

  // Validate response
  if (!Array.isArray(chapters)) {
    throw new Error('Chapter identification did not return an array');
  }

  if (chapters.length < 1) {
    throw new Error('No chapters identified in book');
  }

  // Validate chapter structure
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    if (!ch.title || typeof ch.start_pos !== 'number' || typeof ch.end_pos !== 'number') {
      throw new Error(`Invalid chapter object at index ${i}: ${JSON.stringify(ch)}`);
    }
    if (ch.start_pos >= ch.end_pos) {
      throw new Error(`Chapter "${ch.title}" has invalid positions: start=${ch.start_pos}, end=${ch.end_pos}`);
    }
  }

  console.log(`  ✓ Identified ${chapters.length} chapters`);

  return chapters;
}

/**
 * Extract text for a specific chapter
 * @param {string} bookText - Full book text
 * @param {number} startPos - Start position
 * @param {number} endPos - End position
 * @returns {string} Chapter text
 */
export function extractChapterText(bookText, startPos, endPos) {
  return bookText.substring(startPos, endPos);
}
