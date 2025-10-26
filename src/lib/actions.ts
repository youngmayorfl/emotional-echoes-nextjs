
'use server';

import { generateArtFromMood } from '@/ai/flows/mood-based-art-generation';
import { generateAmbientSoundscape } from '@/ai/flows/ambient-soundscape-cycle';

export async function getArtForMoodAction(mood: string) {
  if (!mood || mood.trim().length < 2) {
    return { error: 'Please describe your mood with at least 2 characters.' };
  }
  try {
    const result = await generateArtFromMood({ mood });
    return { artDataUri: result.artDataUri };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate art. Please try again later.' };
  }
}

export async function getSoundForMoodAction(mood: string) {
  if (!mood) {
    return { error: 'A mood is required to generate a soundscape.' };
  }
  try {
    const result = await generateAmbientSoundscape({ mood });
    return { soundDataUri: result.media };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate soundscape. Please try again later.' };
  }
}
