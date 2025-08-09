'use client';

import { useState, useEffect } from 'react';
import type { Team } from '@/types';
import AnalysisDashboard from '@/components/analysis-dashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AnalysisPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('current_game_stats');
      if (savedData) {
        setTeam(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Failed to parse team data from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Caricamento delle statistiche...</p>
        </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-bold mb-4">Nessun dato da analizzare</h2>
        <p className="text-muted-foreground mb-6">
          Torna alla pagina principale per registrare una partita prima.
        </p>
        <Button asChild>
          <Link href="/">Torna alla Home</Link>
        </Button>
      </div>
    );
  }

  return <AnalysisDashboard team={team} />;
}
