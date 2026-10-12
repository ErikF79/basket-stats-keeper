'use client';

import type { Player, PlayerStats, StatEvent, StatEventType, CourtSide } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Target, Undo2 } from 'lucide-react';
import { useState } from 'react';
import Court from '@/components/court';
import { splitRebounds } from '@/lib/rebounds';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PlayerCardProps {
  player: Player;
  currentQuarter: number;
  attackingSide: CourtSide | null;
  onUpdateStats: (newStats: Player['stats']) => void;
}

type ActionType = StatEventType;
type Action = { type: ActionType; value?: 1 | 2 | 3 };

function deriveStats(events: StatEvent[]): PlayerStats {
  const stats: PlayerStats = {
    points: 0,
    assists: 0,
    rebounds: 0,
    fouls: 0,
    missed_shots: 0,
    events,
  };
  events.forEach(event => {
    switch (event.type) {
      case 'point':
        stats.points += event.points || 0;
        break;
      case 'missed_shot':
        stats.missed_shots += 1;
        break;
      case 'assist':
        stats.assists += 1;
        break;
      case 'rebound':
        stats.rebounds += 1;
        break;
      case 'foul':
        stats.fouls += 1;
        break;
    }
  });
  return stats;
}

const actionLabels: Record<ActionType, (value?: number) => string> = {
  point: value => `Tiro da ${value} segnato`,
  missed_shot: value => `Tiro da ${value} sbagliato`,
  assist: () => 'Assist',
  rebound: () => 'Rimbalzo',
  foul: () => 'Fallo',
};

export default function PlayerCard({ player, currentQuarter, attackingSide, onUpdateStats }: PlayerCardProps) {
  const [pendingAction, setPendingAction] = useState<Action | null>(null);

  const reboundSplit = splitRebounds(player.stats.events, attackingSide);

  const registerEvent = (event: Omit<StatEvent, 'quarter' | 'x' | 'y'> & { x: number; y: number }) => {
    const fullEvent: StatEvent = { ...event, quarter: currentQuarter };
    onUpdateStats(deriveStats([...player.stats.events, fullEvent]));
    setPendingAction(null);
  };

  const undoLast = (type: ActionType) => {
    const events = player.stats.events;
    let lastIndex = -1;
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].type === type) {
        lastIndex = i;
        break;
      }
    }
    if (lastIndex === -1) return;
    const remaining = events.filter((_, index) => index !== lastIndex);
    onUpdateStats(deriveStats(remaining));
  };

  const handleCourtClick = (x: number, y: number) => {
    if (!pendingAction) return;
    registerEvent({
      type: pendingAction.type,
      ...(pendingAction.value ? { points: pendingAction.value } : {}),
      x,
      y,
    } as Omit<StatEvent, 'quarter'>);
  };

  const has = (type: ActionType) => player.stats.events.some(e => e.type === type);

  const StatRow = ({
    label,
    value,
    type,
    hint,
  }: {
    label: string;
    value: number;
    type: ActionType;
    hint?: string;
  }) => (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => undoLast(type)}
          disabled={!has(type)}
          aria-label={`Annulla ${label}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-10 text-center font-mono text-xl font-semibold">{value}</span>
        <Button
          variant={pendingAction?.type === type ? 'default' : 'outline'}
          size="icon"
          className="h-10 w-10"
          onClick={() => setPendingAction({ type })}
          aria-label={`Aggiungi ${label}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="truncate">{player.name}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">{player.stats.points}</span>
            <span className="text-xs text-muted-foreground">PTS</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-5">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Target className="h-4 w-4" /> Segna Punti
          </p>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as const).map(value => (
              <Button
                key={`made-${value}`}
                className="h-11 text-base font-semibold"
                variant={pendingAction?.type === 'point' && pendingAction.value === value ? 'default' : 'secondary'}
                onClick={() => setPendingAction({ type: 'point', value })}
              >
                +{value}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Tiri Sbagliati</p>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as const).map(value => (
              <Button
                key={`missed-${value}`}
                className="h-11 text-base"
                variant={pendingAction?.type === 'missed_shot' && pendingAction.value === value ? 'destructive' : 'outline'}
                onClick={() => setPendingAction({ type: 'missed_shot', value })}
              >
                {value} ✕
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <StatRow label="Assist" value={player.stats.assists} type="assist" />
          <StatRow
            label="Rimbalzi"
            value={player.stats.rebounds}
            type="rebound"
            hint={
              reboundSplit.offensive + reboundSplit.defensive > 0
                ? `${reboundSplit.offensive} off \u00b7 ${reboundSplit.defensive} dif`
                : attackingSide === null && player.stats.rebounds > 0
                  ? 'classificazione non disponibile'
                  : undefined
            }
          />
          <StatRow label="Falli" value={player.stats.fouls} type="foul" />
          <StatRow label="Tiri Sbagliati" value={player.stats.missed_shots} type="missed_shot" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => undoLast('point')}
          disabled={!has('point')}
        >
          <Undo2 className="mr-2 h-4 w-4" />
          Annulla ultimo canestro
        </Button>
      </CardContent>

      <Dialog open={pendingAction !== null} onOpenChange={open => !open && setPendingAction(null)}>
        <DialogContent className="max-h-[92dvh] w-[95vw] max-w-2xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {pendingAction ? actionLabels[pendingAction.type](pendingAction.value) : ''} — {player.name}
            </DialogTitle>
            <DialogDescription>
              Tocca il punto del campo dove è avvenuta l&apos;azione.
            </DialogDescription>
          </DialogHeader>
          <Court onCourtClick={handleCourtClick} />
          <Button variant="outline" className="w-full" onClick={() => setPendingAction(null)}>
            Annulla
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
