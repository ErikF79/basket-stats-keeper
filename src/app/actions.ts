'use server';

import { summarizeStats } from '@/ai/flows/stats';
import type { Team } from '@/types';

export async function getAnalysis(teamData: Team): Promise<string> {
  try {
    const result = await summarizeStats(teamData);
    return result;
  } catch (error) {
    console.error("Error running AI analysis flow:", error);
    return "Si è verificato un errore durante l'analisi delle statistiche. Per favore, riprova.";
  }
}
