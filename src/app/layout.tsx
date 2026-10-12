import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/ui/toaster';
import PwaRegister from '@/components/pwa-register';
import ThemeToggle from '@/components/theme-toggle';
import { withBasePath } from '@/lib/config';
import './globals.css';

export const metadata: Metadata = {
  title: 'Basket Stats Keeper',
  description:
    'Registra e analizza le statistiche di basket per un giocatore o una squadra, anche offline.',
  manifest: withBasePath('/manifest.json'),
  applicationName: 'Basket Stats Keeper',
  appleWebApp: {
    capable: true,
    title: 'StatsKeeper',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: withBasePath('/icon-192x192.png'), sizes: '192x192', type: 'image/png' },
      { url: withBasePath('/icon-512x512.png'), sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: withBasePath('/apple-touch-icon.png'), sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E0F7FA' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1220' },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('basket-stats-keeper:theme:v1');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var d=document.documentElement;if(t==='dark'){d.classList.add('dark');}else{d.classList.remove('dark');}d.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <ThemeToggle />
        <PwaRegister />
      </body>
    </html>
  );
}
