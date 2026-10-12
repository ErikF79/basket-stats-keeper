# Basket Stats Keeper

Progressive Web App per registrare e analizzare le statistiche di una partita di basket, pensata per un singolo operatore ma utilizzabile anche da più persone. Funziona **offline** e si installa su PC, tablet e smartphone.

## Funzionalità

- **Configurazione squadra**: nome squadra e giocatori.
- **Registrazione in tempo reale** per giocatore: punti (1/2/3), tiri sbagliati (1/2/3), assist, rimbalzi, falli.
- **Tracciamento geografico**: ogni evento viene salvato con la posizione sul campo.
- **Gestione per quarto** (inclusi i tempi supplementari) con barra punteggio sticky.
- **Autosalvataggio locale**: la partita in corso e il quarto vengono salvati automaticamente e ripristinati alla riapertura.
- **Modale del campo** ottimizzata per il touch (nessuno scroll necessario su smartphone) + feedback aptico.
- **Tema chiaro/scuro** con rilevamento automatico delle preferenze di sistema.
- **PWA offline-first**: service worker, cache dell'app shell e icone installabili.
- **Export/Import JSON** della partita.
- **Analisi multi-partita**: selezione partite, filtro per quarto, tabelle, grafici (barre e torta), percentuali di tiro e **heatmap** degli eventi filtrabile per tipo.

## Stack tecnologico

- Next.js 15 (App Router) con **export statico** (`output: 'export'`)
- React 18, TypeScript
- Tailwind CSS + shadcn/ui (Radix UI)
- Recharts
- localStorage (persistenza local-first)

## Sviluppo locale

```bash
npm install
npm run dev        # http://localhost:9002
npm run build      # export statico in ./out
npm run typecheck  # controllo dei tipi
```

> Nota: se la porta `9002` è occupata, avvia con `npx next dev --turbopack -p <porta>`.

## Deploy su GitHub Pages

Il repository include un workflow (`.github/workflows/deploy.yml`) che compila e pubblica automaticamente l'app su GitHub Pages ad ogni push su `main`.

1. Su GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Fai push su `main`: il workflow pubblica l'app all'indirizzo `https://<utente>.github.io/<repo>/`.

Il `basePath` viene impostato automaticamente a `/<nome-repo>` dal workflow. Se pubblichi su una **user/organization page** (`<utente>.github.io`), imposta `NEXT_PUBLIC_BASE_PATH` a stringa vuota nel workflow.

Per una build locale con basePath:

```powershell
$env:NEXT_PUBLIC_BASE_PATH="/nome-repo"; npm run build
```

## Dove finiscono i dati

L'app è **local-first**: i dati vengono salvati nel browser del dispositivo (localStorage).

- Ogni dispositivo (PC, tablet, smartphone) mantiene **i propri dati**.
- Non c'è ancora sincronizzazione automatica tra dispositivi: usa **Esporta/Importa JSON** per spostare una partita.
- Una sincronizzazione cloud multi-dispositivo (Firebase) è prevista come evoluzione futura.

## Prossimi passi (idee)

- Sincronizzazione cloud opzionale (Firebase).
- Avversario, punteggio partita e differenziale.
- Cronometro, timeout, falli di squadra/bonus.
- Statistiche extra: palle perse, recuperi, stoppate, tiri liberi, falli subiti.
- Timeline eventi editabile (correzione/eliminazione di qualsiasi evento).
- Shot chart stile NBA e metriche avanzate (eFG%, TS%, +/-).
