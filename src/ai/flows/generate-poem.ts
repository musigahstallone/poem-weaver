
'use server';
/**
 * @fileOverview AI flow for generating poems.
 *
 * - generatePoem - A function that calls the poem generation flow.
 * - PoemGenerationInput - The input type for the poem generation.
 * - PoemGenerationOutput - The output type (the generated poem).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PoemGenerationInputSchema = z.object({
  theme: z.string().min(1).describe('The theme or topic for the poem.'),
  style: z.string().min(1).describe('The desired style of the poem (e.g., haiku, sonnet, free verse, romantic, melancholic).'),
});
export type PoemGenerationInput = z.infer<typeof PoemGenerationInputSchema>;

const PoemGenerationOutputSchema = z.object({
  poem: z.string().describe('The generated poem.'),
});
export type PoemGenerationOutput = z.infer<typeof PoemGenerationOutputSchema>;

export async function generatePoem(input: PoemGenerationInput): Promise<PoemGenerationOutput> {
  return generatePoemFlow(input);
}

const poemPrompt = ai.definePrompt({
  name: 'poemPrompt',
  model: 'gemini-1.5-flash-latest',
  input: { schema: PoemGenerationInputSchema },
  output: { schema: PoemGenerationOutputSchema },
  prompt: `You are an exceptionally gifted poet, known for your ability to craft verses that resonate deeply.
Please compose a poem based on the following details:

Theme: {{{theme}}}
Style: {{{style}}}

Weave your words with elegance and emotion. The poem should be uplifting, inspiring, or deeply touching.
Aim for a poem of considerable length, exploring the theme and style in depth. A longer, more developed piece is preferred.
Ensure the poem is well-structured according to the specified style if it's a formal one (like sonnet or haiku). For free verse, let creativity flow.
`,
  config: {
    temperature: 0.7,
    maxOutputTokens: 512,
    // safetySettings: [ 
    //   {
    //     category: 'HARM_CATEGORY_HATE_SPEECH',
    //     threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    //   },
    // ],
  },
});

const generatePoemFlow = ai.defineFlow(
  {
    name: 'generatePoemFlow',
    inputSchema: PoemGenerationInputSchema,
    outputSchema: PoemGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await poemPrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a poem. Please try a different theme or style.');
    }
    return output;
  }
);
