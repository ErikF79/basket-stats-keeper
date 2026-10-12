'use client';

import type { StatEvent, StatEventType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { withBasePath } from '@/lib/config';

interface HeatmapProps {
  events: StatEvent[];
  title: string;
}

const eventColorMap: Record<StatEventType, string> = {
  point: 'bg-green-500',
  assist: 'bg-blue-500',
  rebound: 'bg-yellow-500',
  foul: 'bg-red-500',
  missed_shot: 'bg-orange-500',
};

const eventLabelMap: Record<StatEventType, string> = {
  point: 'Punti',
  assist: 'Assist',
  rebound: 'Rimbalzi',
  foul: 'Falli',
  missed_shot: 'Tiri Sbagliati',
};

export default function Heatmap({ events, title }: HeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full">
          <img
            src={withBasePath('/basketball-court.svg')}
            alt="Campo da basket"
            draggable={false}
            className="w-full rounded-lg border"
          />
          {events.map((event, index) => {
            const colorClass = eventColorMap[event.type] || 'bg-gray-500';
            const label = eventLabelMap[event.type] || event.type;
            return (
              <div
                key={index}
                className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 opacity-80 ${colorClass}`}
                style={{ left: `${event.x}%`, top: `${event.y}%` }}
                title={`${label}${event.points ? ` (${event.points} pt)` : ''} - Q${event.quarter}`}
              />
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-green-500" />
            Punti
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-blue-500" />
            Assist
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-yellow-500" />
            Rimbalzi
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-red-500" />
            Falli
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-orange-500" />
            Tiri Sbagliati
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
