'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveTheme } from '@/lib/storage';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.dataset.theme = next;
    saveTheme(next);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label="Cambia tema"
      className="fixed bottom-4 right-4 z-40 h-11 w-11 rounded-full bg-background/80 shadow-lg backdrop-blur"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
