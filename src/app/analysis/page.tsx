
'use client';

import { useState, useEffect } from 'react';
import type { Team } from '@/types';
import AnalysisDashboard from '@/components/analysis-dashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AnalysisPage() {
  const [games, setGames] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedGameJSON = localStorage.getItem('current_game_for_analysis');
      if (savedGameJSON) {
        const savedGame = JSON.parse(savedGameJSON);
        if (savedGame && savedGame.name && Array.isArray(savedGame.players)) {
          setGames([savedGame]);
        }
        // Clean up localStorage after loading
        localStorage.removeItem('current_game_for_analysis');
      }
    } catch (error) {
      console.error("Failed to load game from local storage", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare i dati della partita precedente.",
      });
    }
    setLoading(false);
  }, [toast]);


  const handleFileImported = (importedData: Team) => {
    // Basic validation
    if (importedData && importedData.name && Array.isArray(importedData.players)) {
      setGames(prevGames => [...prevGames, importedData]);
      toast({
        title: "Importazione Riuscita",
        description: `I dati della partita "${importedData.name}" sono stati caricati.`,
      });
    } else {
       toast({
        variant: "destructive",
        title: "Importazione Fallita",
        description: "Il file JSON non è valido o è corrotto.",
      });
    }
  };


  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Caricamento delle statistiche...</p>
        </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-bold mb-4">Nessun dato da analizzare</h2>
        <p className="text-muted-foreground mb-6">
          Carica una partita salvata per iniziare l'analisi.
        </p>
        <div className="flex gap-4">
          <AnalysisDashboard games={games} onFileImported={handleFileImported} />
          <Button asChild variant="outline">
            <Link href="/">Torna alla Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <AnalysisDashboard games={games} onFileImported={handleFileImported} />;
}
