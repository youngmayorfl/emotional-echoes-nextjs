'use server';

/**
 * @fileOverview Generates abstract art based on a user's mood.
 *
 * - generateArtFromMood - A function that generates abstract art based on mood.
 * - MoodBasedArtInput - The input type for the generateArtFromMood function.
 * - MoodBasedArtOutput - The return type for the generateArtFromMood function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodBasedArtInputSchema = z.object({
  mood: z.string().describe('The current mood of the user (e.g., joyful, melancholic, energetic).'),
});
export type MoodBasedArtInput = z.infer<typeof MoodBasedArtInputSchema>;

const MoodBasedArtOutputSchema = z.object({
  artDataUri: z.string().describe('A data URI containing the generated abstract art image.'),
});
export type MoodBasedArtOutput = z.infer<typeof MoodBasedArtOutputSchema>;

export async function generateArtFromMood(input: MoodBasedArtInput): Promise<MoodBasedArtOutput> {
  return moodBasedArtFlow(input);
}

const moodBasedArtPrompt = ai.definePrompt({
  name: 'moodBasedArtPrompt',
  input: {schema: MoodBasedArtInputSchema},
  output: {schema: MoodBasedArtOutputSchema},
  prompt: `Generate a unique abstract art pattern that reflects the mood: {{{mood}}}. The art should have an ethereal theme with deep purples, teals, and soft golds. Return the image as a data URI.
`,
});

const moodBasedArtFlow = ai.defineFlow(
  {
    name: 'moodBasedArtFlow',
    inputSchema: MoodBasedArtInputSchema,
    outputSchema: MoodBasedArtOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a unique abstract art pattern that reflects the mood: ${input.mood}. The art should have an ethereal theme with deep purples, teals, and soft golds.`,
    });

    return {
      artDataUri: media!.url,
    };
  }
);
