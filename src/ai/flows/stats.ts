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
      Analizza le seguenti statistiche di una partita di basket e fornisci un breve riassunto e suggerimenti per migliorare.
      La squadra si chiama "${stats.name}".
      Le statistiche dei giocatori sono:
      ${stats.players.map(p => `- ${p.name}: ${p.stats.points} punti, ${p.stats.assists} assist, ${p.stats.rebounds} rimbalzi, ${p.stats.fouls} falli`).join('\n')}

      Concentrati sulle prestazioni chiave (migliori marcatori, giocatori a tutto tondo) e sulle potenziali aree di preoccupazione (ad es. falli elevati, pochi rimbalzi).
      Mantieni il riassunto conciso e pratico.
      Formatta l'output come markdown con intestazioni per "Riepilogo" e "Suggerimenti".
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
