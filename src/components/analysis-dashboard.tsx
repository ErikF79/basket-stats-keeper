'use client';

import type { Team, Player, StatEvent, StatEventType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Heatmap from '@/components/heatmap';
import { Button } from '@/components/ui/button';
import { Home, Upload } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { computeAttackingSide, splitRebounds, sideArrow, sideLabel } from '@/lib/rebounds';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnalysisDashboardProps {
  games: Team[];
  onFileImported: (team: Team) => void;
}

const getFilteredEvents = (
  players: Player[],
  filter: 'all' | StatEventType,
  quarter: number | 'all'
): StatEvent[] => {
  let allEvents = players.flatMap(p => p.stats.events.map(e => ({ ...e, quarter: e.quarter || 1 })));

  if (quarter !== 'all') {
    allEvents = allEvents.filter(event => event.quarter === quarter);
  }

  if (filter !== 'all') {
    allEvents = allEvents.filter(event => event.type === filter);
  }
  return allEvents;
};

const calculateShootingStats = (players: Player[], quarter: number | 'all') => {
  const stats = {
    totalMade: 0,
    totalMissed: 0,
    made1p: 0,
    attempted1p: 0,
    made2p: 0,
    attempted2p: 0,
    made3p: 0,
    attempted3p: 0,
  };

  let events = players.flatMap(p => p.stats.events.map(e => ({ ...e, quarter: e.quarter || 1 })));
  if (quarter !== 'all') {
    events = events.filter(e => e.quarter === quarter);
  }

  events.forEach(event => {
    if (event.type === 'point') {
      stats.totalMade++;
      if (event.points === 1) {
        stats.made1p++;
        stats.attempted1p++;
      }
      if (event.points === 2) {
        stats.made2p++;
        stats.attempted2p++;
      }
      if (event.points === 3) {
        stats.made3p++;
        stats.attempted3p++;
      }
    } else if (event.type === 'missed_shot') {
      stats.totalMissed++;
      if (event.points === 1) stats.attempted1p++;
      if (event.points === 2) stats.attempted2p++;
      if (event.points === 3) stats.attempted3p++;
    }
  });

  return stats;
};

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

const aggregatePlayerData = (games: Team[], quarter: number | 'all') => {
  const playerMap = new Map<string, Player>();

  games.forEach(game => {
    game.players.forEach(player => {
      const key = normalizeName(player.name);
      if (!playerMap.has(key)) {
        playerMap.set(key, {
          id: `agg-${key}`,
          name: player.name.trim().replace(/\s+/g, ' '),
          stats: { points: 0, assists: 0, rebounds: 0, fouls: 0, missed_shots: 0, events: [] },
        });
      }

      let eventsToProcess = player.stats.events.map(e => ({ ...e, quarter: e.quarter || 1 }));
      if (quarter !== 'all') {
        eventsToProcess = eventsToProcess.filter(e => e.quarter === quarter);
      }

      const aggregatedStats = playerMap.get(key)!.stats;
      aggregatedStats.points += eventsToProcess
        .filter(e => e.type === 'point')
        .reduce((sum, e) => sum + (e.points || 0), 0);
      aggregatedStats.assists += eventsToProcess.filter(e => e.type === 'assist').length;
      aggregatedStats.rebounds += eventsToProcess.filter(e => e.type === 'rebound').length;
      aggregatedStats.fouls += eventsToProcess.filter(e => e.type === 'foul').length;
      aggregatedStats.missed_shots += eventsToProcess.filter(e => e.type === 'missed_shot').length;
      aggregatedStats.events.push(...eventsToProcess);
    });
  });

  return Array.from(playerMap.values());
};

export default function AnalysisDashboard({ games, onFileImported }: AnalysisDashboardProps) {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const newGameNames = games.map(g => g.name);
    setSelectedGames(prevSelected => {
      const currentSelected = new Set(prevSelected);
      newGameNames.forEach(name => currentSelected.add(name));
      return Array.from(currentSelected);
    });
  }, [games]);

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
          onFileImported(JSON.parse(text));
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

  const handleGameSelection = (gameName: string) => {
    setSelectedGames(prev =>
      prev.includes(gameName) ? prev.filter(g => g !== gameName) : [...prev, gameName]
    );
  };

  const filteredGames = useMemo(
    () => games.filter(g => selectedGames.includes(g.name)),
    [games, selectedGames]
  );
  const aggregatedPlayers = useMemo(
    () => aggregatePlayerData(filteredGames, selectedQuarter),
    [filteredGames, selectedQuarter]
  );

  // Attacking half inferred from the shots of the current selection.
  // Falls back to every event of the selected games when the scope has no shots.
  const attackingSide = useMemo(() => {
    const scopedEvents = aggregatedPlayers.flatMap(p => p.stats.events);
    const direct = computeAttackingSide(scopedEvents);
    if (direct) return direct;
    const allEvents = filteredGames.flatMap(g => g.players.flatMap(p => p.stats.events));
    return computeAttackingSide(allEvents);
  }, [aggregatedPlayers, filteredGames]);

  const shootingStats = calculateShootingStats(aggregatedPlayers, selectedQuarter);
  const totalShots = shootingStats.totalMade + shootingStats.totalMissed;

  const shootingPercentageData = [
    { name: 'Segnati', value: shootingStats.totalMade, color: '#4CAF50' },
    { name: 'Sbagliati', value: shootingStats.totalMissed, color: '#F44336' },
  ];

  const getPercentage = (made: number, attempted: number) => {
    if (attempted === 0) return '0.0%';
    return `${((made / attempted) * 100).toFixed(1)}%`;
  };

  if (games.length === 0) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold">Nessun dato da analizzare</h2>
        <p className="mb-6 text-muted-foreground">Carica una partita salvata per iniziare l&apos;analisi.</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Importa partita
          </Button>
          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".json" />
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Torna alla home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-3 py-4 sm:p-4 sm:py-8 md:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-4xl">Analisi statistiche</h1>
          <p className="text-sm text-muted-foreground sm:text-lg">Riepilogo dettagliato e confronto delle prestazioni.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button onClick={handleImportClick} variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Importa altra partita
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Torna alla home
            </Link>
          </Button>
          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".json" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Selezione partite</CardTitle>
            <CardDescription>Scegli le partite da includere nel confronto.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {games.map((game, index) => (
              <div key={`${game.name}-${index}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`game-${index}`}
                  checked={selectedGames.includes(game.name)}
                  onCheckedChange={() => handleGameSelection(game.name)}
                />
                <label htmlFor={`game-${index}`} className="text-sm font-medium leading-none">
                  {game.name}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Filtro per quarto</CardTitle>
            <CardDescription>Analizza i dati di un quarto specifico.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              onValueChange={value => setSelectedQuarter(value === 'all' ? 'all' : parseInt(value))}
              defaultValue="all"
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un quarto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i quarti</SelectItem>
                <SelectItem value="1">Quarto 1</SelectItem>
                <SelectItem value="2">Quarto 2</SelectItem>
                <SelectItem value="3">Quarto 3</SelectItem>
                <SelectItem value="4">Quarto 4</SelectItem>
                <SelectItem value="5">OT 1</SelectItem>
                <SelectItem value="6">OT 2</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Riepilogo</TabsTrigger>
          <TabsTrigger value="charts">Grafici</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Statistiche aggregate per giocatore</CardTitle>
              <CardDescription>
                Riepilogo completo delle prestazioni individuali sulle partite e il quarto selezionati. I rimbalzi
                offensivi/difensivi sono stimati dalla metà campo dei tiri (metà offensiva rilevata:{' '}
                <span className="font-semibold text-primary">
                  {attackingSide ? `${sideArrow(attackingSide)} ${sideLabel(attackingSide)}` : 'non disponibile'}
                </span>
                ).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Giocatore</TableHead>
                      <TableHead className="text-center">Punti</TableHead>
                      <TableHead className="text-center">Assist</TableHead>
                      <TableHead className="text-center">Rimbalzi</TableHead>
                      <TableHead className="text-center">Off.</TableHead>
                      <TableHead className="text-center">Dif.</TableHead>
                      <TableHead className="text-center">Falli</TableHead>
                      <TableHead className="text-center">Tiri sbagliati</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aggregatedPlayers.map(player => {
                      const reboundSplit = splitRebounds(player.stats.events, attackingSide);
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell className="text-center font-bold text-primary">{player.stats.points}</TableCell>
                          <TableCell className="text-center">{player.stats.assists}</TableCell>
                          <TableCell className="text-center">{player.stats.rebounds}</TableCell>
                          <TableCell className="text-center">{attackingSide ? reboundSplit.offensive : '\u2014'}</TableCell>
                          <TableCell className="text-center">{attackingSide ? reboundSplit.defensive : '\u2014'}</TableCell>
                          <TableCell className="text-center">{player.stats.fouls}</TableCell>
                          <TableCell className="text-center">{player.stats.missed_shots || 0}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Confronto giocatori</CardTitle>
              <CardDescription>Statistiche principali a confronto.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={aggregatedPlayers.map(p => ({ name: p.name, ...p.stats }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="points" fill="hsl(var(--primary))" name="Punti" />
                  <Bar dataKey="assists" fill="hsl(var(--chart-2))" name="Assist" />
                  <Bar dataKey="rebounds" fill="hsl(var(--chart-3))" name="Rimbalzi" />
                  <Bar dataKey="fouls" fill="hsl(var(--chart-5))" name="Falli" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rapporto tiri</CardTitle>
              <CardDescription>Percentuale totale tiri segnati vs sbagliati.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={shootingPercentageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {shootingPercentageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Percentuali di tiro</CardTitle>
              <CardDescription>Dettaglio delle percentuali per tipo di tiro.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <h3 className="text-2xl font-bold">{getPercentage(shootingStats.totalMade, totalShots)}</h3>
                <p className="text-sm text-muted-foreground">
                  Totale ({shootingStats.totalMade}/{totalShots})
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{getPercentage(shootingStats.made1p, shootingStats.attempted1p)}</h3>
                <p className="text-sm text-muted-foreground">
                  Tiri liberi ({shootingStats.made1p}/{shootingStats.attempted1p})
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{getPercentage(shootingStats.made2p, shootingStats.attempted2p)}</h3>
                <p className="text-sm text-muted-foreground">
                  Tiri da 2 ({shootingStats.made2p}/{shootingStats.attempted2p})
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{getPercentage(shootingStats.made3p, shootingStats.attempted3p)}</h3>
                <p className="text-sm text-muted-foreground">
                  Tiri da 3 ({shootingStats.made3p}/{shootingStats.attempted3p})
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-3 sm:grid-cols-6">
              <TabsTrigger value="all">Tutti</TabsTrigger>
              <TabsTrigger value="point">Punti</TabsTrigger>
              <TabsTrigger value="assist">Assist</TabsTrigger>
              <TabsTrigger value="rebound">Rimbalzi</TabsTrigger>
              <TabsTrigger value="foul">Falli</TabsTrigger>
              <TabsTrigger value="missed_shot">Sbagliati</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <Heatmap events={getFilteredEvents(aggregatedPlayers, 'all', selectedQuarter)} title="Mappa di tutti gli eventi" />
            </TabsContent>
            <TabsContent value="point">
              <Heatmap events={getFilteredEvents(aggregatedPlayers, 'point', selectedQuarter)} title="Mappa dei punti" />
            </TabsContent>
            <TabsContent value="assist">
              <Heatmap events={getFilteredEvents(aggregatedPlayers, 'assist', selectedQuarter)} title="Mappa degli assist" />
            </TabsContent>
            <TabsContent value="rebound">
              <Heatmap events={getFilteredEvents(aggregatedPlayers, 'rebound', selectedQuarter)} title="Mappa dei rimbalzi" />
            </TabsContent>
            <TabsContent value="foul">
              <Heatmap events={getFilteredEvents(aggregatedPlayers, 'foul', selectedQuarter)} title="Mappa dei falli" />
            </TabsContent>
            <TabsContent value="missed_shot">
              <Heatmap events={getFilteredEvents(aggregatedPlayers, 'missed_shot', selectedQuarter)} title="Mappa dei tiri sbagliati" />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
