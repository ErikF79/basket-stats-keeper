
'use client';

import type { Team, Player } from '@/types';
import PlayerCard from '@/components/player-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Users, Download, Upload, BarChart2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


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
  const [exportFileName, setExportFileName] = useState(`${team.name.toLowerCase().replace(/\s/g, '_')}_stats`);
  const { toast } = useToast();
  const router = useRouter();

  const handleExport = () => {
    if (!exportFileName.trim()) {
        toast({
            variant: "destructive",
            title: "Nome file non valido",
            description: "Per favore, inserisci un nome per il file.",
        });
        return;
    }
    
    const jsonString = JSON.stringify(team, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFileName.trim()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
     toast({
        title: "Esportazione completata",
        description: "Le statistiche sono state salvate in un file JSON.",
      });
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
      localStorage.setItem('current_game_for_analysis', JSON.stringify(team));
    } catch (error) {
      console.error("Could not save game to local storage", error);
       toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile salvare i dati della partita per l'analisi.",
      });
    }
    router.push('/analysis');
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
          <Dialog>
            <DialogTrigger asChild>
               <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Esporta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Esporta Statistiche</DialogTitle>
                <DialogDescription>
                  Inserisci un nome per il file di esportazione. Verrà aggiunta l'estensione .json automaticamente.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="filename" className="text-right">
                    Nome File
                  </Label>
                  <Input
                    id="filename"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Annulla</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit" variant="secondary" className="text-secondary-foreground" onClick={handleExport}>Salva Esportazione</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleImportClick} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importa
          </Button>
          <Button onClick={handleAnalyze} variant="secondary" className="text-[#6D001A] font-bold border-2 border-green-600">
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
