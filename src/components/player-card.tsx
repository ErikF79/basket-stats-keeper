'use client';
import type { Player, StatEvent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import Court from '@/components/court';
import { useState } from 'react';

interface PlayerCardProps {
  player: Player;
  onUpdateStats: (newStats: Player['stats']) => void;
}

const StatRow = ({ label, value, onIncrement, onDecrement }: { label: string; value: number; onIncrement: () => void; onDecrement: () => void; }) => (
  <div className="flex items-center justify-between">
    <p className="font-medium">{label}</p>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-7 w-7" onClick={onDecrement} disabled={value === 0}>
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-mono text-lg">{value}</span>
      <Button variant="outline" size="icon" className="h-7 w-7" onClick={onIncrement}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  </div>
);


export default function PlayerCard({ player, onUpdateStats }: PlayerCardProps) {
  const [activeStat, setActiveStat] = useState<'points' | 'assists' | 'rebounds' | 'fouls' | null>(null);
  const [pointValue, setPointValue] = useState<1 | 2 | 3 | null>(null);

  const handleStatSelection = (stat: 'assists' | 'rebounds' | 'fouls') => {
    setActiveStat(stat);
    setPointValue(null);
  }

  const handlePointSelection = (value: 1 | 2 | 3) => {
    setActiveStat('points');
    setPointValue(value);
  }

  const handleCourtClick = (x: number, y: number) => {
    if (!activeStat) return;
    
    let newEvent: StatEvent;
    const newStats = { ...player.stats };

    if (activeStat === 'points' && pointValue) {
      newEvent = { type: 'point', points: pointValue, x, y };
      newStats.points += pointValue;
    } else if (activeStat !== 'points') {
      newEvent = { type: activeStat, x, y };
      newStats[activeStat]++;
    } else {
      return;
    }

    newStats.events = [...newStats.events, newEvent];
    
    onUpdateStats(newStats);
    setActiveStat(null);
    setPointValue(null);
  };
  
  const handleUndo = (stat: keyof Omit<Player['stats'], 'points' | 'events'>) => {
    const newStats = { ...player.stats };
    const lastEventIndex = newStats.events.findLastIndex(e => e.type === stat);
    
    if(lastEventIndex > -1) {
      newStats.events.splice(lastEventIndex, 1);
      newStats[stat] = newStats.events.filter(e => e.type === stat).length;
      if (stat === 'point') {
        newStats.points = newStats.events.filter(e => e.type === 'point').reduce((sum, e) => sum + (e.points || 0), 0);
      }
      onUpdateStats(newStats);
    }
  };

  const handleUndoPoints = () => {
    const newStats = { ...player.stats };
    const lastEventIndex = newStats.events.findLastIndex(e => e.type === 'point');
    if(lastEventIndex > -1) {
        newStats.events.splice(lastEventIndex, 1);
        newStats.points = newStats.events.filter(e => e.type === 'point').reduce((sum, e) => sum + (e.points || 0), 0);
        onUpdateStats(newStats);
    }
  }


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{player.name}</CardTitle>
        <div className="flex justify-between items-baseline">
            <CardDescription>Punti: <span className="text-2xl font-bold text-primary">{player.stats.points}</span></CardDescription>
            <Button variant="outline" size="sm" onClick={handleUndoPoints} disabled={!player.stats.events.some(e => e.type === 'point')}>Annulla</Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <p className="mb-2 font-medium">Segna Punti</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant={activeStat === 'points' && pointValue === 1 ? "default" : "secondary"} onClick={() => handlePointSelection(1)}>+1 PT</Button>
            <Button variant={activeStat === 'points' && pointValue === 2 ? "default" : "secondary"} onClick={() => handlePointSelection(2)}>+2 PTS</Button>
            <Button variant={activeStat === 'points' && pointValue === 3 ? "default" : "secondary"} onClick={() => handlePointSelection(3)}>+3 PTS</Button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
                <p className="font-medium">Assist</p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUndo('assists')} disabled={!player.stats.events.some(e => e.type === 'assist')}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-mono text-lg">{player.stats.assists}</span>
                    <Button variant={activeStat === 'assists' ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => handleStatSelection('assists')}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <p className="font-medium">Rimbalzi</p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUndo('rebounds')} disabled={!player.stats.events.some(e => e.type === 'rebound')}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-mono text-lg">{player.stats.rebounds}</span>
                    <Button variant={activeStat === 'rebounds' ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => handleStatSelection('rebounds')}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <p className="font-medium">Falli</p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUndo('fouls')} disabled={!player.stats.events.some(e => e.type === 'foul')}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-mono text-lg">{player.stats.fouls}</span>
                    <Button variant={activeStat === 'fouls' ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => handleStatSelection('fouls')}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>

        {activeStat && (
          <div className="pt-4">
             <p className="text-sm font-medium text-center mb-2">
                Seleziona la posizione sul campo per
                <span className="font-bold text-primary">
                    {activeStat === 'points' && ` un tiro da ${pointValue} punt${pointValue === 1 ? 'o' : 'i'}`}
                    {activeStat === 'assists' && ' un assist'}
                    {activeStat === 'rebounds' && ' un rimbalzo'}
                    {activeStat === 'fouls' && ' un fallo'}
                </span>
             </p>
            <Court onCourtClick={handleCourtClick} />
            <Button variant="link" className="w-full mt-2" onClick={() => setActiveStat(null)}>Annulla selezione</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
