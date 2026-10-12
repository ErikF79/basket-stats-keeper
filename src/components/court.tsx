'use client';

import { useEffect, useRef, useState } from 'react';
import { withBasePath } from '@/lib/config';

interface CourtProps {
  onCourtClick: (x: number, y: number) => void;
}

export default function Court({ onCourtClick }: CourtProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(20);
    }

    setClickPosition({ x, y });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onCourtClick(x, y);
      setClickPosition(null);
    }, 220);
  };

  return (
    <div className="relative w-full select-none">
      <img
        ref={imgRef}
        src={withBasePath('/basketball-court.svg')}
        alt="Campo da basket"
        draggable={false}
        onClick={handleImageClick}
        className="w-full cursor-crosshair rounded-lg border shadow-sm touch-manipulation"
      />
      {clickPosition && (
        <div
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500 shadow-lg transition-transform"
          style={{ left: `${clickPosition.x}%`, top: `${clickPosition.y}%` }}
        />
      )}
    </div>
  );
}
