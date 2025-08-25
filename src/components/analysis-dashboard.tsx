
'use client';
import type { Team, Player, StatEvent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Heatmap from '@/components/heatmap';
import { Button } from '@/components/ui/button';
import { Home, Upload } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface AnalysisDashboardProps {
  games: Team[];
  onFileImported: (team: Team) => void;
}

const getFilteredEvents = (players: Player[], filter: 'all' | 'point' | 'assist' | 'rebound' | 'foul' | 'missed_shot', quarter: number | 'all'): StatEvent[] => {
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
  
  let events = players.flatMap(p => p.stats.events.map(e => ({...e, quarter: e.quarter || 1})));
  if (quarter !== 'all') {
      events = events.filter(e => e.quarter === quarter);
  }

  events.forEach(event => {
      if (event.type === 'point') {
        stats.totalMade++;
        if (event.points === 1) { stats.made1p++; stats.attempted1p++; }
        if (event.points === 2) { stats.made2p++; stats.attempted2p++; }
        if (event.points === 3) { stats.made3p++; stats.attempted3p++; }
      } else if (event.type === 'missed_shot') {
        stats.totalMissed++;
        if (event.points === 1) { stats.attempted1p++; }
        if (event.points === 2) { stats.attempted2p++; }
        if (event.points === 3) { stats.attempted3p++; }
      }
    });

  return stats;
};

const aggregatePlayerData = (games: Team[], quarter: number | 'all') => {
    const playerMap = new Map<string, Player['stats']>();

    games.forEach(game => {
        game.players.forEach(player => {
            if (!playerMap.has(player.name)) {
                playerMap.set(player.name, {
                    points: 0,
                    assists: 0,
                    rebounds: 0,
                    fouls: 0,
                    missed_shots: 0,
                    events: []
                });
            }
            
            let eventsToProcess = player.stats.events.map(e => ({...e, quarter: e.quarter || 1}));
            if (quarter !== 'all') {
                eventsToProcess = eventsToProcess.filter(e => e.quarter === quarter);
            }

            const aggregatedStats = playerMap.get(player.name)!;
            aggregatedStats.points += eventsToProcess.filter(e => e.type === 'point').reduce((sum, e) => sum + (e.points || 0), 0);
            aggregatedStats.assists += eventsToProcess.filter(e => e.type === 'assist').length;
            aggregatedStats.rebounds += eventsToProcess.filter(e => e.type === 'rebound').length;
            aggregatedStats.fouls += eventsToProcess.filter(e => e.type === 'foul').length;
            aggregatedStats.missed_shots += eventsToProcess.filter(e => e.type === 'missed_shot').length;
            aggregatedStats.events.push(...eventsToProcess);
        });
    });
    
    return Array.from(playerMap.entries()).map(([name, stats], index) => ({
        id: `agg-${index}`,
        name,
        stats
    }));
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
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedData = JSON.parse(text);
          onFileImported(importedData);
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


  const handleGameSelection = (gameName: string) => {
    setSelectedGames(prev =>
      prev.includes(gameName) ? prev.filter(g => g !== gameName) : [...prev, gameName]
    );
  };
  
  const filteredGames = useMemo(() => games.filter(g => selectedGames.includes(g.name)), [games, selectedGames]);
  const aggregatedPlayers = useMemo(() => aggregatePlayerData(filteredGames, selectedQuarter), [filteredGames, selectedQuarter]);
  
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
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h2 className="text-2xl font-bold mb-4">Nessun dato da analizzare</h2>
            <p className="text-muted-foreground mb-6">
            Carica una partita salvata per iniziare l'analisi.
            </p>
            <div className="flex gap-4">
                <Button onClick={handleImportClick} variant="secondary" className="text-secondary-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    Importa Partita
                </Button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".json"
                />
                 <Button asChild variant="outline">
                    <Link href="/">Torna alla Home</Link>
                </Button>
            </div>
      </div>
     )
  }

  return (
    <div className="container mx-auto p-4 py-8 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Analisi Statistiche
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Riepilogo dettagliato e confronto delle performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleImportClick} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importa Altra Partita
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Torna alla Home
              </Link>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Selezione Partite</CardTitle>
          <CardDescription>
            Scegli le partite da includere nel confronto.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {games.map((game, index) => (
            <div key={`${game.name}-${index}`} className="flex items-center space-x-2">
              <Checkbox
                id={`game-${index}`}
                checked={selectedGames.includes(game.name)}
                onCheckedChange={() => handleGameSelection(game.name)}
              />
              <label
                htmlFor={`game-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {game.name}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Filtro per Quarto</CardTitle>
            <CardDescription>Analizza i dati di un quarto specifico.</CardDescription>
        </CardHeader>
        <CardContent>
            <Select onValueChange={(value) => setSelectedQuarter(value === 'all' ? 'all' : parseInt(value))} defaultValue="all">
                <SelectTrigger>
                    <SelectValue placeholder="Seleziona un quarto" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tutti i Quarti</SelectItem>
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
          <TabsTrigger value="overview">Riepilogo Giocatori</TabsTrigger>
          <TabsTrigger value="charts">Grafici Squadra</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
            <Card>
                <CardHeader>
                <CardTitle>Statistiche Aggregate per Giocatore</CardTitle>
                <CardDescription>
                    Riepilogo completo delle prestazioni individuali sulle partite e il quarto selezionati.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Giocatore</TableHead>
                        <TableHead className="text-center">Punti</TableHead>
                        <TableHead className="text-center">Assist</TableHead>
                        <TableHead className="text-center">Rimbalzi</TableHead>
                        <TableHead className="text-center">Falli</TableHead>
                        <TableHead className="text-center">Tiri Sbagliati</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {aggregatedPlayers.map(player => (
                        <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell className="text-center font-bold text-primary">{player.stats.points}</TableCell>
                        <TableCell className="text-center">{player.stats.assists}</TableCell>
                        <TableCell className="text-center">{player.stats.rebounds}</TableCell>
                        <TableCell className="text-center">{player.stats.fouls}</TableCell>
                        <TableCell className="text-center">{player.stats.missed_shots || 0}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="charts" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Confronto Giocatori</CardTitle>
                <CardDescription>Statistiche principali a confronto.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={aggregatedPlayers.map(p => ({ name: p.name, ...p.stats }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
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
                <CardTitle>Rapporto Tiri</CardTitle>
                <CardDescription>Percentuale totale tiri segnati vs sbagliati.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={shootingPercentageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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
                <CardTitle>Percentuali di Tiro</CardTitle>
                <CardDescription>Dettaglio delle percentuali per tipo di tiro.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <h3 className="text-2xl font-bold">{getPercentage(shootingStats.totalMade, totalShots)}</h3>
                    <p className="text-sm text-muted-foreground">Totale ({shootingStats.totalMade}/{totalShots})</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{getPercentage(shootingStats.made1p, shootingStats.attempted1p)}</h3>
                    <p className="text-sm text-muted-foreground">Tiri Liberi ({shootingStats.made1p}/{shootingStats.attempted1p})</p>
                  </div>
                   <div>
                    <h3 className="text-2xl font-bold">{getPercentage(shootingStats.made2p, shootingStats.attempted2p)}</h3>
                    <p className="text-sm text-muted-foreground">Tiri da 2 Punti ({shootingStats.made2p}/{shootingStats.attempted2p})</p>
                  </div>
                   <div>
                    <h3 className="text-2xl font-bold">{getPercentage(shootingStats.made3p, shootingStats.attempted3p)}</h3>
                    <p className="text-sm text-muted-foreground">Tiri da 3 Punti ({shootingStats.made3p}/{shootingStats.attempted3p})</p>
                  </div>
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="heatmap">
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="all">Tutti</TabsTrigger>
                    <TabsTrigger value="point">Punti</TabsTrigger>
                    <TabsTrigger value="assist">Assist</TabsTrigger>
                    <TabsTrigger value="rebound">Rimbalzi</TabsTrigger>
                    <TabsTrigger value="foul">Falli</TabsTrigger>
                    <TabsTrigger value="missed_shot">Tiri Sbagliati</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <Heatmap events={getFilteredEvents(aggregatedPlayers, 'all', selectedQuarter)} title="Mappa di tutti gli eventi" />
                </TabsContent>
                 <TabsContent value="point">
                    <Heatmap events={getFilteredEvents(aggregatedPlayers, 'point', selectedQuarter)} title="Mappa dei Punti" />
                </TabsContent>
                 <TabsContent value="assist">
                    <Heatmap events={getFilteredEvents(aggregatedPlayers, 'assist', selectedQuarter)} title="Mappa degli Assist" />
                </TabsContent>
                 <TabsContent value="rebound">
                    <Heatmap events={getFilteredEvents(aggregatedPlayers, 'rebound', selectedQuarter)} title="Mappa dei Rimbalzi" />
                </TabsContent>
                 <TabsContent value="foul">
                    <Heatmap events={getFilteredEvents(aggregatedPlayers, 'foul', selectedQuarter)} title="Mappa dei Falli" />
                </TabsContent>
                 <TabsContent value="missed_shot">
                    <Heatmap events={getFilteredEvents(aggregatedPlayers, 'missed_shot', selectedQuarter)} title="Mappa dei Tiri Sbagliati" />
                </TabsContent>
            </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
