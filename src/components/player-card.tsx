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

export default function PlayerCard({ player, onUpdateStats }: PlayerCardProps) {
  const [activeAction, setActiveAction] = useState<{ type: 'point' | 'assist' | 'rebound' | 'foul' | 'missed_shot', value?: 1 | 2 | 3 } | null>(null);

  const handleActionSelection = (type: 'point' | 'assist' | 'rebound' | 'foul' | 'missed_shot', value?: 1 | 2 | 3) => {
    setActiveAction({ type, value });
  };

  const handleCourtClick = (x: number, y: number) => {
    if (!activeAction) return;
    
    const newStats = { ...player.stats };
    let newEvent: StatEvent;

    switch (activeAction.type) {
      case 'point':
        if (activeAction.value) {
          newEvent = { type: 'point', points: activeAction.value, x, y };
          newStats.points += activeAction.value;
          newStats.events.push(newEvent);
        }
        break;
      case 'missed_shot':
        if (activeAction.value) {
            newEvent = { type: 'missed_shot', points: activeAction.value, x, y };
            newStats.missed_shots++;
            newStats.events.push(newEvent);
        }
        break;
      case 'assist':
        newEvent = { type: 'assist', x, y };
        newStats.assists++;
        newStats.events.push(newEvent);
        break;
      case 'rebound':
        newEvent = { type: 'rebound', x, y };
        newStats.rebounds++;
        newStats.events.push(newEvent);
        break;
      case 'foul':
        newEvent = { type: 'foul', x, y };
        newStats.fouls++;
        newStats.events.push(newEvent);
        break;
    }
    
    onUpdateStats(newStats);
    setActiveAction(null);
  };
  
  const handleUndo = (stat: 'assists' | 'rebounds' | 'fouls' | 'missed_shots') => {
    const newStats = { ...player.stats };
    const statToEventMap = {
        'assists': 'assist',
        'rebounds': 'rebound',
        'fouls': 'foul',
        'missed_shots': 'missed_shot'
    }
    const eventType = statToEventMap[stat];
    const lastEventIndex = newStats.events.findLastIndex(e => e.type === eventType);
    
    if(lastEventIndex > -1) {
      newStats.events.splice(lastEventIndex, 1);
      newStats[stat] = newStats.events.filter(e => e.type === eventType).length;
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
            <Button variant="outline" size="sm" onClick={handleUndoPoints} disabled={!player.stats.events.some(e => e.type === 'point')}>Annulla Punto</Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <p className="mb-2 font-medium">Segna Punti</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant={activeAction?.type === 'point' && activeAction?.value === 1 ? "default" : "secondary"} onClick={() => handleActionSelection('point', 1)}>+1 PT</Button>
            <Button variant={activeAction?.type === 'point' && activeAction?.value === 2 ? "default" : "secondary"} onClick={() => handleActionSelection('point', 2)}>+2 PTS</Button>
            <Button variant={activeAction?.type === 'point' && activeAction?.value === 3 ? "default" : "secondary"} onClick={() => handleActionSelection('point', 3)}>+3 PTS</Button>
          </div>
        </div>
        <div>
          <p className="mb-2 font-medium text-destructive">Tiri Sbagliati</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant={activeAction?.type === 'missed_shot' && activeAction?.value === 1 ? "destructive" : "secondary"} onClick={() => handleActionSelection('missed_shot', 1)}>1 PT</Button>
            <Button variant={activeAction?.type === 'missed_shot' && activeAction?.value === 2 ? "destructive" : "secondary"} onClick={() => handleActionSelection('missed_shot', 2)}>2 PTS</Button>
            <Button variant={activeAction?.type === 'missed_shot' && activeAction?.value === 3 ? "destructive" : "secondary"} onClick={() => handleActionSelection('missed_shot', 3)}>3 PTS</Button>
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
                    <Button variant={activeAction?.type === 'assist' ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => handleActionSelection('assist')}>
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
                    <Button variant={activeAction?.type === 'rebound' ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => handleActionSelection('rebound')}>
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
                    <Button variant={activeAction?.type === 'foul' ? 'default' : 'outline'} size="icon" className="h-7 w-7" onClick={() => handleActionSelection('foul')}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
             <div className="flex items-center justify-between">
                <p className="font-medium">Tiri Sbagliati</p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUndo('missed_shots')} disabled={!player.stats.events.some(e => e.type === 'missed_shot')}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-mono text-lg">{player.stats.missed_shots}</span>
                </div>
            </div>
        </div>

        {activeAction && (
          <div className="pt-4">
             <p className="text-sm font-medium text-center mb-2">
                Seleziona la posizione sul campo per
                <span className="font-bold text-primary">
                    {activeAction.type === 'point' && ` un tiro da ${activeAction.value} punt${activeAction.value === 1 ? 'o' : 'i'}`}
                    {activeAction.type === 'missed_shot' && ` un tiro sbagliato da ${activeAction.value} punt${activeAction.value === 1 ? 'o' : 'i'}`}
                    {activeAction.type === 'assist' && ' un assist'}
                    {activeAction.type === 'rebound' && ' un rimbalzo'}
                    {activeAction.type === 'foul' && ' un fallo'}
                </span>
             </p>
            <Court onCourtClick={handleCourtClick} />
            <Button variant="link" className="w-full mt-2" onClick={() => setActiveAction(null)}>Annulla selezione</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
