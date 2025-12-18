/**
 * Stage 3: Synthesize chapter extracts into cohesive narrative
 */
import fs from 'fs';
import { generateContent } from '../llm/client.js';

/**
 * Load prompt template
 * @returns {string}
 */
function loadPromptTemplate() {
  return fs.readFileSync('src/prompts/synthesize.md', 'utf-8');
}

/**
 * Synthesize chapter extracts into organized narrative
 * @param {string} bookTitle - Title of the book
 * @param {string} skillName - Name of the skill being created
 * @param {string} skillDescription - Description of the skill
 * @param {Array<Object>} chapterExtracts - Array of chapter extraction objects
 * @param {string} model - LLM model to use (default: gemini-2.5-pro)
 * @returns {Promise<string>} Synthesized markdown text
 */
export async function synthesize(bookTitle, skillName, skillDescription, chapterExtracts, model = 'gemini-3-pro-preview') {
  const template = loadPromptTemplate();

  // Format chapter extracts as readable text
  const extractsText = chapterExtracts
    .map((extract, index) => {
      return `## Chapter ${index + 1}: ${extract.chapter_title}\n\n${JSON.stringify(extract, null, 2)}`;
    })
    .join('\n\n---\n\n');

  const prompt = template
    .replace('{BOOK_TITLE}', bookTitle)
    .replace('{SKILL_NAME}', skillName)
    .replace('{SKILL_DESCRIPTION}', skillDescription)
    .replace('{CHAPTER_EXTRACTS}', extractsText);

  console.log('  Synthesizing chapter extracts...');
  console.log(`  Total chapters: ${chapterExtracts.length}`);
  console.log(`  Using model: ${model}`);

  const synthesis = await generateContent(model, prompt, {
    temperature: 0.4, // Slightly higher for creative organization
    maxOutputTokens: 32768, // Large output for comprehensive synthesis
  });

  console.log(`  ✓ Synthesis complete (${synthesis.length.toLocaleString()} chars)`);

  return synthesis;
}
