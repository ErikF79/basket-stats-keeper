'use server';
/**
 * @fileOverview A basketball stats analysis AI agent.
 *
 * - summarizeStats - A function that handles the basketball stats analysis process.
 */
import {z} from 'zod';
import {ai} from '../genkit';
import { statsSchema } from '@/types/stats';

export async function summarizeStats(stats: z.infer<typeof statsSchema>): Promise<string> {
  return summarizeStatsFlow(stats);
}

const summarizeStatsFlow = ai.defineFlow(
  {
    name: 'summarizeStatsFlow',
    inputSchema: statsSchema,
    outputSchema: z.string(),
  },
  async (stats) => {
    const prompt = `
      Analyze the following basketball game statistics and provide a brief summary and suggestions for improvement.
      The team is "${stats.name}".
      The player stats are:
      ${stats.players.map(p => `- ${p.name}: ${p.stats.points} pts, ${p.stats.assists} ast, ${p.stats.rebounds} reb, ${p.stats.fouls} fouls`).join('\n')}

      Focus on key performances (high scorers, all-around players) and potential areas of concern (e.g., high fouls, low rebounds).
      Keep the summary concise and actionable.
      Format the output as markdown with headings for "Summary" and "Suggestions".
    `;

    const llmResponse = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.0-flash',
      config: {
        temperature: 0.5,
      },
    });

    return llmResponse.text;
  }
);
