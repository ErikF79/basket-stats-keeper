'use client';

import type { Team, Player } from '@/types';
import PlayerCard from '@/components/player-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnalysisCard from '@/components/analysis-card';
import { RefreshCw, Users } from 'lucide-react';

interface DashboardProps {
  team: Team;
  onUpdateStats: (playerId: string, newStats: Player['stats']) => void;
  onResetApp: () => void;
  onResetStats: () => void;
}

export default function Dashboard({ team, onUpdateStats, onResetApp, onResetStats }: DashboardProps) {
  const totalPoints = team.players.reduce((sum, player) => sum + player.stats.points, 0);
  const totalAssists = team.players.reduce((sum, player) => sum + player.stats.assists, 0);
  const totalRebounds = team.players.reduce((sum, player) => sum + player.stats.rebounds, 0);
  const totalFouls = team.players.reduce((sum, player) => sum + player.stats.fouls, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{team.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">Live Game Statistics</p>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={onResetStats} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            New Game
          </Button>
          <Button onClick={onResetApp} variant="destructive">
            <Users className="mr-2 h-4 w-4" />
            Change Team
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Team Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">Points</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{totalAssists}</p>
              <p className="text-sm text-muted-foreground">Assists</p>
            </div>
             <div>
              <p className="text-3xl font-bold">{totalRebounds}</p>
              <p className="text-sm text-muted-foreground">Rebounds</p>
            </div>
             <div>
              <p className="text-3xl font-bold">{totalFouls}</p>
              <p className="text-sm text-muted-foreground">Fouls</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Player Stats</h2>
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
      
      <AnalysisCard team={team} />
    </div>
  );
}
