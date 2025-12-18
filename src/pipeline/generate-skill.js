/**
 * Stage 4: Generate final SKILL.md from synthesis
 */
import fs from 'fs';
import { generateContent } from '../llm/client.js';

/**
 * Load prompt template
 * @returns {string}
 */
function loadPromptTemplate() {
  return fs.readFileSync('src/prompts/generate-skill.md', 'utf-8');
}

/**
 * Generate final SKILL.md from synthesis
 * @param {string} bookTitle - Title of the source book
 * @param {string} skillName - Skill name (kebab-case)
 * @param {string} skillDescription - Skill description
 * @param {string} synthesis - Synthesized markdown from previous stage
 * @param {string} model - LLM model to use (default: gemini-2.5-pro)
 * @returns {Promise<string>} Complete SKILL.md content
 */
export async function generateSkill(bookTitle, skillName, skillDescription, synthesis, model = 'gemini-3-pro-preview') {
  const template = loadPromptTemplate();

  const prompt = template
    .replace('{BOOK_TITLE}', bookTitle)
    .replace('{SKILL_NAME}', skillName)
    .replace('{SKILL_DESCRIPTION}', skillDescription)
    .replace('{SYNTHESIS}', synthesis);

  console.log('  Generating final SKILL.md...');
  console.log(`  Skill name: ${skillName}`);
  console.log(`  Using model: ${model}`);

  const skillContent = await generateContent(model, prompt, {
    temperature: 0.4,
    maxOutputTokens: 32768,
  });

  console.log(`  ✓ Skill generated (${skillContent.length.toLocaleString()} chars)`);

  // Validate that we have frontmatter
  if (!skillContent.startsWith('---')) {
    console.warn('  ⚠ Warning: Generated skill missing frontmatter, adding it...');
    const frontmatter = `---
name: ${skillName}
description: ${skillDescription}
location: user
---

`;
    return frontmatter + skillContent;
  }

  return skillContent;
}
