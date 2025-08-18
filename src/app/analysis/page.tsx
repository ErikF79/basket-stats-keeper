'use client';

import { useState, useEffect, useRef } from 'react';
import type { Team } from '@/types';
import AnalysisDashboard from '@/components/analysis-dashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AnalysisPage() {
  const [games, setGames] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedData = JSON.parse(text);
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
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Errore di importazione",
          description: "Impossibile analizzare il file JSON. Assicurati che sia formattato correttamente.",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
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
          <Button onClick={handleImportClick} variant="secondary">
            <Upload className="mr-2 h-4 w-4" />
            Importa Partita
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Torna alla Home</Link>
          </Button>
        </div>
         <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden"
            accept=".json"
          />
      </div>
    );
  }

  return <AnalysisDashboard games={games} onImportGame={handleImportClick} />;
}
