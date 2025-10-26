'use server';

/**
 * @fileOverview A flow that generates ambient soundscapes based on the visualized mood of the art.
 *
 * - generateAmbientSoundscape - A function that generates an ambient soundscape based on the mood.
 * - AmbientSoundscapeInput - The input type for the generateAmbientSoundscape function.
 * - AmbientSoundscapeOutput - The return type for the generateAmbientSoundscape function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const AmbientSoundscapeInputSchema = z.object({
  mood: z.string().describe('The mood to generate a soundscape for.'),
});
export type AmbientSoundscapeInput = z.infer<typeof AmbientSoundscapeInputSchema>;

const AmbientSoundscapeOutputSchema = z.object({
  media: z.string().describe('The generated ambient soundscape as a data URI.'),
});
export type AmbientSoundscapeOutput = z.infer<typeof AmbientSoundscapeOutputSchema>;

export async function generateAmbientSoundscape(input: AmbientSoundscapeInput): Promise<AmbientSoundscapeOutput> {
  return ambientSoundscapeFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const ambientSoundscapeFlow = ai.defineFlow(
  {
    name: 'ambientSoundscapeFlow',
    inputSchema: AmbientSoundscapeInputSchema,
    outputSchema: AmbientSoundscapeOutputSchema,
  },
  async input => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: `Generate an ambient soundscape for the mood: ${input.mood}. Do not use any speech. Just generate sounds. `,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);
