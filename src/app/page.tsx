'use client';

import { useState } from 'react';
import TeamSetup from '@/components/team-setup';
import Dashboard from '@/components/dashboard';
import type { Team, Player } from '@/types';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [team, setTeam] = useState<Team | null>(null);
  const { toast } = useToast();

  const handleTeamSetup = (teamName: string, playerNames: string[]) => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `${Date.now()}-${index}`,
      name,
      stats: { points: 0, assists: 0, rebounds: 0, fouls: 0, events: [] },
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
        stats: { points: 0, assists: 0, rebounds: 0, fouls: 0, events: [] },
    }));
    setTeam({ ...team, players: resetPlayers });
  };

  const handleImportTeam = (importedTeam: Team) => {
    // Basic validation
    if (importedTeam && importedTeam.name && Array.isArray(importedTeam.players)) {
      setTeam(importedTeam);
      toast({
        title: "Importazione Riuscita",
        description: `I dati della squadra "${importedTeam.name}" sono stati caricati.`,
      });
    } else {
       toast({
        variant: "destructive",
        title: "Importazione Fallita",
        description: "Il file JSON non è valido o è corrotto.",
      });
    }
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
              onImportTeam={handleImportTeam}
            />
          )}
        </div>
      </div>
      <Toaster />
    </>
  );
}
