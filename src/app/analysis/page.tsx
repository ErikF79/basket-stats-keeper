'use client';

import { useState, useEffect } from 'react';
import type { Team } from '@/types';
import AnalysisDashboard from '@/components/analysis-dashboard';
import { useToast } from '@/hooks/use-toast';
import { takeAnalysisHandoff, sanitizeTeam } from '@/lib/storage';

export default function AnalysisPage() {
  const [games, setGames] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handedOff = takeAnalysisHandoff();
    if (handedOff) {
      setGames([handedOff]);
    }
    setLoading(false);
  }, []);

  const handleFileImported = (importedData: Team) => {
    const sanitized = sanitizeTeam(importedData);
    if (!sanitized) {
      toast({
        variant: 'destructive',
        title: 'Importazione fallita',
        description: 'Il file JSON non è valido o è corrotto.',
      });
      return;
    }

    setGames(prev => {
      const baseName = sanitized.name;
      let name = baseName;
      let counter = 2;
      while (prev.some(game => game.name === name)) {
        name = `${baseName} (${counter})`;
        counter += 1;
      }
      return [...prev, { ...sanitized, name }];
    });

    toast({
      title: 'Importazione riuscita',
      description: `I dati della partita "${sanitized.name}" sono stati caricati.`,
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-muted-foreground">
        Caricamento delle statistiche...
      </div>
    );
  }

  return <AnalysisDashboard games={games} onFileImported={handleFileImported} />;
}
