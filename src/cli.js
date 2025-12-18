#!/usr/bin/env node
/**
 * CLI for converting books to Claude Code skills
 */
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { extractText } from './extractors/index.js';
import { identifyChapters } from './pipeline/identify-chapters.js';
import { extractChapters } from './pipeline/extract-chapters.js';
import { synthesize } from './pipeline/synthesize.js';
import { generateSkill } from './pipeline/generate-skill.js';

const program = new Command();

program
  .name('make-skill')
  .description('Convert technical books into Claude Code skills')
  .argument('<source>', 'Path to book file (EPUB, PDF, MOBI)')
  .argument('<name>', 'Skill name (kebab-case)')
  .argument('<description>', 'Skill description')
  .option('--output-dir <dir>', 'Output directory', 'skills')
  .option('--model <model>', 'Model for chapter processing', 'gemini-3-pro-preview')
  .option('--synthesis-model <model>', 'Model for synthesis and generation', 'gemini-3-pro-preview')
  .option('--concurrency <n>', 'Parallel chapter processing', '5')
  .option('--no-save-intermediates', 'Skip saving intermediate outputs')
  .action(async (source, name, description, options) => {
    try {
      // Convert positional args to options format for processBook
      const bookOptions = {
        ...options,
        skillName: name,
        description: description,
        saveIntermediates: options.saveIntermediates !== false, // Default true
      };
      await processBook(source, bookOptions);
    } catch (error) {
      console.error(`\nError: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Main processing function
 */
async function processBook(bookPath, options) {
  // Validate inputs
  if (!fs.existsSync(bookPath)) {
    throw new Error(`Book file not found: ${bookPath}`);
  }

  const bookTitle = path.basename(bookPath, path.extname(bookPath))
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  console.log(`\n📖 Processing: ${bookPath}`);
  console.log(`   Book title: ${bookTitle}\n`);

  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }

  // Stage 1: Extract text
  console.log('Stage 1: Extracting text from book...');
  const fullText = await extractText(bookPath);
  console.log(`  ✓ Extracted ${fullText.length.toLocaleString()} characters\n`);

  // Get skill name and description from options
  const skillName = options.skillName;
  const skillDescription = options.description;

  console.log(`Skill: ${skillName}`);
  console.log(`Description: ${skillDescription}\n`);

  // Create output directory
  const outputDir = path.join(options.outputDir, skillName);
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Output: ${outputDir}\n`);

  // Stage 2: Identify chapters
  console.log('Stage 2: Identifying chapters...');
  const chapters = await identifyChapters(fullText, options.model);
  console.log(`  Found chapters:`);
  chapters.forEach((ch, i) => {
    console.log(`    ${i + 1}. ${ch.title}`);
  });
  console.log();

  // Stage 3: Extract chapters in parallel
  console.log(`Stage 3: Processing ${chapters.length} chapters in parallel...`);
  const concurrency = parseInt(options.concurrency, 10);

  const chapterExtracts = await extractChapters(fullText, bookTitle, chapters, {
    model: options.model,
    concurrency,
    onProgress: (completed, total, title, error) => {
      if (error) {
        console.log(`  [${completed}/${total}] ✗ ${title}: ${error.message}`);
      } else {
        console.log(`  [${completed}/${total}] ✓ ${title}`);
      }
    },
  });

  console.log(`  Successfully processed ${chapterExtracts.length}/${chapters.length} chapters\n`);

  // Save intermediates if requested
  if (options.saveIntermediates) {
    const extractsPath = path.join(outputDir, 'chapter-extracts.json');
    fs.writeFileSync(extractsPath, JSON.stringify(chapterExtracts, null, 2));
    console.log(`  Saved chapter extracts: ${extractsPath}\n`);
  }

  // Stage 4: Synthesize
  console.log('Stage 4: Synthesizing chapter extracts...');
  const synthesis = await synthesize(
    bookTitle,
    skillName,
    skillDescription,
    chapterExtracts,
    options.synthesisModel
  );

  if (options.saveIntermediates) {
    const synthesisPath = path.join(outputDir, 'synthesis.md');
    fs.writeFileSync(synthesisPath, synthesis);
    console.log(`  Saved synthesis: ${synthesisPath}`);
  }
  console.log();

  // Stage 5: Generate skill
  console.log('Stage 5: Generating SKILL.md...');
  const skillContent = await generateSkill(
    bookTitle,
    skillName,
    skillDescription,
    synthesis,
    options.synthesisModel
  );

  const skillPath = path.join(outputDir, 'SKILL.md');
  fs.writeFileSync(skillPath, skillContent);
  console.log(`  ✓ Skill written to: ${skillPath}\n`);

  // Success message
  console.log('✅ Done!\n');
  console.log('To use this skill:');
  console.log(`  1. Copy to ~/.claude/skills/ (personal) or .claude/skills/ (project)`);
  console.log(`     cp -r ${outputDir} ~/.claude/skills/`);
  console.log(`  2. Claude will automatically discover it based on the description\n`);
}

program.parse();
