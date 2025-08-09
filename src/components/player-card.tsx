'use client';
import type { Player } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onUpdateStats: (newStats: Player['stats']) => void;
}

const StatRow = ({ label, value, onIncrement, onDecrement }: { label: string; value: number; onIncrement: () => void; onDecrement: () => void; }) => (
  <div className="flex items-center justify-between">
    <p className="font-medium">{label}</p>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-7 w-7" onClick={onDecrement}>
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
  const handleStatChange = (stat: keyof Player['stats'], value: number) => {
    const currentStat = player.stats[stat];
    if (currentStat + value < 0) return;
    const newStats = { ...player.stats, [stat]: currentStat + value };
    onUpdateStats(newStats);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{player.name}</CardTitle>
        <CardDescription>Punti: <span className="text-2xl font-bold text-primary">{player.stats.points}</span></CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <p className="mb-2 font-medium">Segna Punti</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={() => handleStatChange('points', 1)}>+1 PT</Button>
            <Button variant="secondary" onClick={() => handleStatChange('points', 2)}>+2 PTS</Button>
            <Button variant="secondary" onClick={() => handleStatChange('points', 3)}>+3 PTS</Button>
          </div>
        </div>
        
        <div className="space-y-3 pt-2">
            <StatRow label="Assist" value={player.stats.assists} onIncrement={() => handleStatChange('assists', 1)} onDecrement={() => handleStatChange('assists', -1)} />
            <StatRow label="Rimbalzi" value={player.stats.rebounds} onIncrement={() => handleStatChange('rebounds', 1)} onDecrement={() => handleStatChange('rebounds', -1)} />
            <StatRow label="Falli" value={player.stats.fouls} onIncrement={() => handleStatChange('fouls', 1)} onDecrement={() => handleStatChange('fouls', -1)} />
        </div>

      </CardContent>
    </Card>
  );
}
