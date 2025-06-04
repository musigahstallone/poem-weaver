'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest popular poem themes to inspire users.
 *
 * - suggestPoemThemes - A function that returns a list of suggested poem themes.
 * - SuggestPoemThemesOutput - The output type for the suggestPoemThemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPoemThemesOutputSchema = z.array(z.string().describe('A suggested poem theme.'));
export type SuggestPoemThemesOutput = z.infer<typeof SuggestPoemThemesOutputSchema>;

export async function suggestPoemThemes(): Promise<SuggestPoemThemesOutput> {
  return suggestPoemThemesFlow();
}

const prompt = ai.definePrompt({
  name: 'suggestPoemThemesPrompt',
  output: {schema: SuggestPoemThemesOutputSchema},
  prompt: `You are a creative writing assistant.  Suggest 5 popular and diverse themes for poems, as a JSON array of strings.  These should be suitable for a wide audience.  Examples of themes include:

["Love", "Nature", "Loss", "Hope", "Dreams"]`,
});

const suggestPoemThemesFlow = ai.defineFlow(
  {
    name: 'suggestPoemThemesFlow',
    outputSchema: SuggestPoemThemesOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
