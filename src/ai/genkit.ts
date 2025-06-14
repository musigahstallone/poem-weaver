/**
 * @fileOverview Initializes and configures the Genkit AI toolkit.
 *
 * This file sets up the primary Genkit instance with necessary plugins,
 * such as the Google AI plugin for interacting with Gemini models.
 * It exports a singleton `ai` object that should be used throughout
 * the application for defining and running AI flows, prompts, and tools.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the GoogleAI plugin.
// Ensure GOOGLE_API_KEY environment variable is set.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash'
});
