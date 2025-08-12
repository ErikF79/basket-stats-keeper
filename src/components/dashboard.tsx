'use client';

import type { Team, Player } from '@/types';
import PlayerCard from '@/components/player-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Users, Download, Upload, BarChart2 } from 'lucide-react';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


interface DashboardProps {
  team: Team;
  onUpdateStats: (playerId: string, newStats: Player['stats']) => void;
  onResetApp: () => void;
  onResetStats: () => void;
  onImportTeam: (team: Team) => void;
}

export default function Dashboard({ team, onUpdateStats, onResetApp, onResetStats, onImportTeam }: DashboardProps) {
  const totalPoints = team.players.reduce((sum, player) => sum + player.stats.points, 0);
  const totalAssists = team.players.reduce((sum, player) => sum + player.stats.assists, 0);
  const totalRebounds = team.players.reduce((sum, player) => sum + player.stats.rebounds, 0);
  const totalFouls = team.players.reduce((sum, player) => sum + player.stats.fouls, 0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleExport = () => {
    const jsonString = JSON.stringify(team, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${team.name.toLowerCase().replace(/\s/g, '_')}_stats.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
     toast({
        title: "Esportazione completata",
        description: "Le statistiche sono state salvate in un file JSON.",
      })
  };

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
          // Add missed_shots to older JSON files if it doesn't exist
          const sanitizedTeam = {
            ...importedData,
            players: importedData.players.map((p: Player) => ({
              ...p,
              stats: {
                points: 0,
                assists: 0,
                rebounds: 0,
                fouls: 0,
                missed_shots: 0,
                events: [],
                ...p.stats
              }
            }))
          };
          onImportTeam(sanitizedTeam);
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
    // Reset the input value to allow importing the same file again
    event.target.value = '';
  };
  
  const handleAnalyze = () => {
    try {
      // Save team data to localStorage to be read by the analysis page
      localStorage.setItem('current_game_stats', JSON.stringify(team));
      router.push('/analysis');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile salvare i dati della partita per l'analisi.",
      });
    }
  };


  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{team.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">Statistiche di Gioco in Tempo Reale</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <Button onClick={onResetStats} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Nuova Partita
          </Button>
          <Button onClick={onResetApp} variant="destructive">
            <Users className="mr-2 h-4 w-4" />
            Cambia Squadra
          </Button>
           <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          <Button onClick={handleImportClick} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importa
          </Button>
          <Button onClick={handleAnalyze} variant="secondary" className="text-[#6D001A] font-bold">
            <BarChart2 className="mr-2 h-4 w-4" />
            Analizza Statistiche
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden"
            accept=".json"
          />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Totali di Squadra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">Punti</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{totalAssists}</p>
              <p className="text-sm text-muted-foreground">Assist</p>
            </div>
             <div>
              <p className="text-3xl font-bold">{totalRebounds}</p>
              <p className="text-sm text-muted-foreground">Rimbalzi</p>
            </div>
             <div>
              <p className="text-3xl font-bold">{totalFouls}</p>
              <p className="text-sm text-muted-foreground">Falli</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Statistiche Giocatori</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.players.map(player => (
            <PlayerCard 
              key={player.id}
              player={player}
              onUpdateStats={(newStats) => onUpdateStats(player.id, newStats)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
