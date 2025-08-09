'use client';
import type { StatEvent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface HeatmapProps {
  events: StatEvent[];
  title: string;
}

const eventColorMap = {
  point: 'bg-green-500',   // Verde per i punti
  assist: 'bg-blue-500',    // Blu per gli assist
  rebound: 'bg-yellow-500', // Giallo per i rimbalzi
  foul: 'bg-red-500',       // Rosso per i falli
};


export default function Heatmap({ events, title }: HeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[4/3]">
          <Image
            src="/basketball-court.svg"
            alt="Campo da basket"
            layout="fill"
            objectFit="contain"
            data-ai-hint="basketball court"
          />
          {events.map((event, index) => {
            const colorClass = eventColorMap[event.type] || 'bg-gray-500';
            return (
              <div
                key={index}
                className={`absolute w-3 h-3 rounded-full border border-white/50 transform -translate-x-1/2 -translate-y-1/2 opacity-80 ${colorClass}`}
                style={{ left: `${event.x}%`, top: `${event.y}%` }}
                title={`${event.type}${event.points ? ` (${event.points} pts)`: ''}`}
              ></div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-500"></div>Punti</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-500"></div>Assist</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-yellow-500"></div>Rimbalzi</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500"></div>Falli</div>
        </div>
      </CardContent>
    </Card>
  );
}
