'use client';
import type { Team, Player, StatEvent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Heatmap from '@/components/heatmap';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalysisDashboardProps {
  team: Team;
}

const getFilteredEvents = (players: Player[], filter: 'all' | 'point' | 'assist' | 'rebound' | 'foul' | 'missed_shot'): StatEvent[] => {
  let allEvents = players.flatMap(p => p.stats.events);
  if (filter !== 'all') {
    allEvents = allEvents.filter(event => event.type === filter);
  }
  return allEvents;
};

const calculateShootingStats = (players: Player[]) => {
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

  players.forEach(player => {
    player.stats.events.forEach(event => {
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
  });

  return stats;
};

export default function AnalysisDashboard({ team }: AnalysisDashboardProps) {
  const shootingStats = calculateShootingStats(team.players);
  const totalShots = shootingStats.totalMade + shootingStats.totalMissed;
  
  const shootingPercentageData = [
    { name: 'Segnati', value: shootingStats.totalMade, color: '#4CAF50' },
    { name: 'Sbagliati', value: shootingStats.totalMissed, color: '#F44336' },
  ];
  
  const getPercentage = (made: number, attempted: number) => {
    if (attempted === 0) return '0.0%';
    return `${((made / attempted) * 100).toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto p-4 py-8 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Analisi Statistiche: {team.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Riepilogo dettagliato della performance di squadra e dei giocatori.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Torna alla Home
          </Link>
        </Button>
      </header>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Riepilogo Giocatori</TabsTrigger>
          <TabsTrigger value="charts">Grafici Squadra</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
            <Card>
                <CardHeader>
                <CardTitle>Statistiche per Giocatore</CardTitle>
                <CardDescription>
                    Riepilogo completo delle prestazioni individuali.
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
                    {team.players.map(player => (
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
                    <BarChart data={team.players.map(p => ({ name: p.name, ...p.stats }))}>
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
                    <Heatmap events={getFilteredEvents(team.players, 'all')} title="Mappa di tutti gli eventi" />
                </TabsContent>
                 <TabsContent value="point">
                    <Heatmap events={getFilteredEvents(team.players, 'point')} title="Mappa dei Punti" />
                </TabsContent>
                 <TabsContent value="assist">
                    <Heatmap events={getFilteredEvents(team.players, 'assist')} title="Mappa degli Assist" />
                </TabsContent>
                 <TabsContent value="rebound">
                    <Heatmap events={getFilteredEvents(team.players, 'rebound')} title="Mappa dei Rimbalzi" />
                </TabsContent>
                 <TabsContent value="foul">
                    <Heatmap events={getFilteredEvents(team.players, 'foul')} title="Mappa dei Falli" />
                </TabsContent>
                 <TabsContent value="missed_shot">
                    <Heatmap events={getFilteredEvents(team.players, 'missed_shot')} title="Mappa dei Tiri Sbagliati" />
                </TabsContent>
            </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
