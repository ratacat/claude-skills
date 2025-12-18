/**
 * Type definitions for simplified chapter extraction output.
 */

/**
 * @typedef {Object} Concept
 * @property {string} concept - Rich description (2-4 sentences)
 * @property {string} scope - What this concept covers/applies to
 * @property {string} when_relevant - When/why this matters
 * @property {string[]} [examples] - Optional concrete examples
 */

/**
 * @typedef {Object} Term
 * @property {string} term - The term or concept name
 * @property {string} definition - Clear definition (1-2 sentences)
 * @property {string} [when_relevant] - When/where this term matters
 */

/**
 * @typedef {Object} Rule
 * @property {string} rule - Specific directive (imperative form)
 * @property {string} reasoning - Why follow this rule
 * @property {'critical'|'important'|'nice-to-have'} importance
 */

/**
 * @typedef {Object} ChapterExtract
 * @property {string} chapter_title
 * @property {Concept[]} concepts - Flexible count based on chapter content
 * @property {Term[]} terminology - Flexible count based on chapter content
 * @property {Rule[]} rules - Flexible count based on chapter content
 */

export const ExtractionSchema = {
  Concept: {},
  Term: {},
  Rule: {},
  ChapterExtract: {}
};
