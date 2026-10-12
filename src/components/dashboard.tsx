'use client';

import type { Team, Player } from '@/types';
import PlayerCard from '@/components/player-card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Download, Upload, BarChart2, Minus, Plus } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { saveAnalysisHandoff } from '@/lib/storage';
import { computeAttackingSide, sideArrow, sideLabel } from '@/lib/rebounds';

interface DashboardProps {
  team: Team;
  currentQuarter: number;
  onQuarterChange: (quarter: number) => void;
  onUpdateStats: (playerId: string, newStats: Player['stats']) => void;
  onResetApp: () => void;
  onResetStats: () => void;
  onImportTeam: (team: Team) => void;
}

export default function Dashboard({
  team,
  currentQuarter,
  onQuarterChange,
  onUpdateStats,
  onResetApp,
  onResetStats,
  onImportTeam,
}: DashboardProps) {
  const totalPoints = team.players.reduce((sum, player) => sum + player.stats.points, 0);
  const totalAssists = team.players.reduce((sum, player) => sum + player.stats.assists, 0);
  const totalRebounds = team.players.reduce((sum, player) => sum + player.stats.rebounds, 0);
  const totalFouls = team.players.reduce((sum, player) => sum + player.stats.fouls, 0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportFileName, setExportFileName] = useState(`${team.name.toLowerCase().replace(/\s/g, '_')}_stats`);
  const { toast } = useToast();
  const router = useRouter();

  // Attacking half inferred from the shots of the current quarter (fallback: whole game).
  const attackingSide = useMemo(() => {
    const allEvents = team.players.flatMap(player => player.stats.events);
    const quarterEvents = allEvents.filter(event => event.quarter === currentQuarter);
    return computeAttackingSide(quarterEvents) ?? computeAttackingSide(allEvents);
  }, [team, currentQuarter]);

  const quarterLabel = currentQuarter <= 4 ? `Q${currentQuarter}` : `OT${currentQuarter - 4}`;

  const handleExport = () => {
    if (!exportFileName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nome file non valido',
        description: 'Per favore, inserisci un nome per il file.',
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
      title: 'Esportazione completata',
      description: 'Le statistiche sono state salvate in un file JSON.',
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          onImportTeam(JSON.parse(text));
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Errore di importazione',
          description: 'Impossibile analizzare il file JSON. Assicurati che sia formattato correttamente.',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleAnalyze = () => {
    if (!saveAnalysisHandoff(team)) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: "Impossibile salvare i dati della partita per l'analisi.",
      });
      return;
    }
    router.push('/analysis');
  };

  const totals = [
    { label: 'Punti', value: totalPoints, highlight: true },
    { label: 'Assist', value: totalAssists },
    { label: 'Rimbalzi', value: totalRebounds },
    { label: 'Falli', value: totalFouls },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-primary sm:text-3xl">{team.name}</h1>
          <p className="text-sm text-muted-foreground">Statistiche di gioco in tempo reale</p>
        </div>
      </header>

      {/* Sticky scoreboard */}
      <div className="sticky top-0 z-30 -mx-3 border-b bg-background/85 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4 md:-mx-8 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onQuarterChange(Math.max(1, currentQuarter - 1))}
              aria-label="Quarto precedente"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="w-14 text-center">
              <div className="text-lg font-bold leading-none text-primary">{quarterLabel}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">quarto</div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onQuarterChange(currentQuarter + 1)}
              aria-label="Quarto successivo"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {totals.map(item => (
              <div key={item.label} className="text-center">
                <div className={`text-xl font-bold leading-none ${item.highlight ? 'text-primary' : ''}`}>
                  {item.value}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Nuova Partita
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Iniziare una nuova partita?</AlertDialogTitle>
              <AlertDialogDescription>
                Tutte le statistiche della partita corrente verranno azzerate. La squadra resta invariata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={onResetStats}>Azzera statistiche</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Cambia Squadra
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cambiare squadra?</AlertDialogTitle>
              <AlertDialogDescription>
                Tornerai alla schermata di configurazione e la partita corrente verrà eliminata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={onResetApp}>Cambia squadra</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Esporta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Esporta statistiche</DialogTitle>
              <DialogDescription>
                Inserisci un nome per il file. L&apos;estensione .json verrà aggiunta automaticamente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <Label htmlFor="filename">Nome file</Label>
              <Input
                id="filename"
                value={exportFileName}
                onChange={e => setExportFileName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annulla
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="button" onClick={handleExport}>
                  Salva esportazione
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button onClick={handleImportClick} variant="outline" className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Importa
        </Button>
        <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".json" />

        <Button onClick={handleAnalyze} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <BarChart2 className="mr-2 h-4 w-4" />
          Analizza
        </Button>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Statistiche giocatori</h2>
          <span className="text-sm text-muted-foreground">
            Metà offensiva rilevata:{' '}
            <span className="font-semibold text-primary">
              {attackingSide ? `${sideArrow(attackingSide)} ${sideLabel(attackingSide)}` : 'non disponibile'}
            </span>
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {team.players.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              currentQuarter={currentQuarter}
              attackingSide={attackingSide}
              onUpdateStats={newStats => onUpdateStats(player.id, newStats)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
