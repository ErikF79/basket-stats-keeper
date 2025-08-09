'use client';

import { useState } from 'react';
import TeamSetup from '@/components/team-setup';
import Dashboard from '@/components/dashboard';
import type { Team, Player } from '@/types';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const [team, setTeam] = useState<Team | null>(null);

  const handleTeamSetup = (teamName: string, playerNames: string[]) => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `${Date.now()}-${index}`,
      name,
      stats: { points: 0, assists: 0, rebounds: 0, fouls: 0 },
    }));
    setTeam({ name: teamName, players });
  };
  
  const handleUpdatePlayerStats = (playerId: string, newStats: Player['stats']) => {
    if (!team) return;
    const updatedPlayers = team.players.map(player => 
      player.id === playerId ? { ...player, stats: newStats } : player
    );
    setTeam({ ...team, players: updatedPlayers });
  };
  
  const handleReset = () => {
    setTeam(null);
  };
  
  const handleResetStats = () => {
    if (!team) return;
    const resetPlayers = team.players.map(player => ({
        ...player,
        stats: { points: 0, assists: 0, rebounds: 0, fouls: 0 },
    }));
    setTeam({ ...team, players: resetPlayers });
  }

  return (
    <>
      <div className="min-h-screen w-full">
        <div className="container mx-auto p-4 py-8 md:p-8">
          {!team ? (
            <TeamSetup onSetupComplete={handleTeamSetup} />
          ) : (
            <Dashboard 
              team={team} 
              onUpdateStats={handleUpdatePlayerStats} 
              onResetApp={handleReset} 
              onResetStats={handleResetStats}
            />
          )}
        </div>
      </div>
      <Toaster />
    </>
  );
}
