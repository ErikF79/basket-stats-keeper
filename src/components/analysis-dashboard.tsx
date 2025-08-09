'use client';
import type { Team, Player, StatEvent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Heatmap from '@/components/heatmap';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AnalysisDashboardProps {
  team: Team;
}

const getFilteredEvents = (players: Player[], filter: 'all' | 'point' | 'assist' | 'rebound' | 'foul'): StatEvent[] => {
  let allEvents = players.flatMap(p => p.stats.events);
  if (filter !== 'all') {
    allEvents = allEvents.filter(event => event.type === filter);
  }
  return allEvents;
};

export default function AnalysisDashboard({ team }: AnalysisDashboardProps) {
  const allEvents = team.players.flatMap(player => player.stats.events);

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Riepilogo Giocatori</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap di Squadra</TabsTrigger>
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
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="heatmap">
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">Tutti</TabsTrigger>
                    <TabsTrigger value="point">Punti</TabsTrigger>
                    <TabsTrigger value="assist">Assist</TabsTrigger>
                    <TabsTrigger value="rebound">Rimbalzi</TabsTrigger>
                    <TabsTrigger value="foul">Falli</TabsTrigger>
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
            </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
