/**
 * Gemini LLM client wrapper
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Get Gemini API client
 * @returns {GoogleGenerativeAI}
 */
export function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Parse JSON from LLM response, handling markdown code fences and extraction
 * @param {string} text - Raw LLM response text
 * @returns {any} Parsed JSON
 */
export function parseJsonResponse(text) {
  text = text.trim();

  // Remove markdown code fencing if present
  if (text.startsWith('```')) {
    const lines = text.split('\n');
    // Remove first line (```json or ```) and last line (```)
    text = lines.slice(1, lines[lines.length - 1].trim() === '```' ? -1 : lines.length).join('\n');
    text = text.trim();
  }

  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON array
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (e2) {
        // Continue to object match
      }
    }

    // Try to extract JSON object
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (e2) {
        // Fall through to error
      }
    }

    throw new Error(`Could not parse JSON from response: ${text.substring(0, 200)}...`);
  }
}

/**
 * Generate content using Gemini
 * @param {string} model - Model name (e.g., 'gemini-2.5-flash')
 * @param {string} prompt - The prompt text
 * @param {Object} options - Generation options
 * @param {number} [options.temperature=0.3] - Temperature (0-1)
 * @param {number} [options.maxOutputTokens] - Max output tokens
 * @returns {Promise<string>} Generated text
 */
export async function generateContent(model, prompt, options = {}) {
  const client = getClient();
  const genModel = client.getGenerativeModel({ model });

  const config = {
    temperature: options.temperature ?? 0.3,
  };

  if (options.maxOutputTokens) {
    config.maxOutputTokens = options.maxOutputTokens;
  }

  const result = await genModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: config,
  });

  return result.response.text();
}

/**
 * Generate JSON content using Gemini
 * @param {string} model - Model name
 * @param {string} prompt - The prompt text
 * @param {Object} options - Generation options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function generateJson(model, prompt, options = {}) {
  const text = await generateContent(model, prompt, options);
  return parseJsonResponse(text);
}
