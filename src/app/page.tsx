'use client';

import { useEffect, useState } from 'react';
import TeamSetup from '@/components/team-setup';
import Dashboard from '@/components/dashboard';
import type { Team, Player } from '@/types';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import {
  emptyStats,
  loadCurrentGame,
  saveCurrentGame,
  clearCurrentGame,
  sanitizeTeam,
} from '@/lib/storage';

export default function Home() {
  const [team, setTeam] = useState<Team | null>(null);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const restored = loadCurrentGame();
    if (restored) {
      setTeam(restored.team);
      setCurrentQuarter(restored.quarter);
      toast({
        title: 'Sessione ripristinata',
        description: `Ripresa la partita "${restored.team.name}" con i dati salvati.`,
      });
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !team) return;
    saveCurrentGame(team, currentQuarter);
  }, [team, currentQuarter, ready]);

  const handleTeamSetup = (teamName: string, playerNames: string[]) => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `${Date.now()}-${index}`,
      name,
      stats: emptyStats(),
    }));
    setCurrentQuarter(1);
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
    clearCurrentGame();
    setTeam(null);
    setCurrentQuarter(1);
  };

  const handleResetStats = () => {
    if (!team) return;
    const resetPlayers = team.players.map(player => ({
      ...player,
      stats: emptyStats(),
    }));
    setCurrentQuarter(1);
    setTeam({ ...team, players: resetPlayers });
  };

  const handleImportTeam = (imported: Team) => {
    const sanitized = sanitizeTeam(imported);
    if (sanitized) {
      setCurrentQuarter(1);
      setTeam(sanitized);
      toast({
        title: 'Importazione riuscita',
        description: `I dati della squadra "${sanitized.name}" sono stati caricati.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Importazione fallita',
        description: 'Il file JSON non è valido o è corrotto.',
      });
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Caricamento...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[100dvh] w-full">
        <div className="container mx-auto p-3 py-4 sm:p-4 sm:py-8 md:p-8">
          {!team ? (
            <TeamSetup onSetupComplete={handleTeamSetup} />
          ) : (
            <Dashboard
              team={team}
              currentQuarter={currentQuarter}
              onQuarterChange={setCurrentQuarter}
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
