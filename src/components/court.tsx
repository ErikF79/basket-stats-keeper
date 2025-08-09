'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

interface CourtProps {
  onCourtClick: (x: number, y: number) => void;
}

export default function Court({ onCourtClick }: CourtProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clickPosition, setClickPosition] = useState<{x: number, y: number} | null>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setClickPosition({ x, y });
    
    // Simulate a delay to show the marker, then pass data to parent
    setTimeout(() => {
      onCourtClick(x, y);
      setClickPosition(null);
    }, 300);
  };

  return (
    <div ref={containerRef} className="relative w-full aspect-[4/3] cursor-pointer">
      <Image
        src="/basketball-court.svg"
        alt="Campo da basket"
        layout="fill"
        objectFit="contain"
        onClick={handleImageClick}
        data-ai-hint="basketball court"
      />
      {clickPosition && (
        <div
          className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${clickPosition.x}%`, top: `${clickPosition.y}%` }}
        ></div>
      )}
    </div>
  );
}
