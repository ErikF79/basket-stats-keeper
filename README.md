# Segnapunti Basket PWA

Questa è una Progressive Web App (PWA) avanzata per la gestione e l'analisi delle statistiche di pallacanestro, creata con Firebase Studio. Progettata per allenatori, giocatori e appassionati, l'applicazione permette di tracciare le performance di una squadra in tempo reale e di analizzare i dati raccolti attraverso una dashboard interattiva.

## Funzionalità Principali

- **Creazione Squadra Personalizzata**: Inizia inserendo il nome della tua squadra e l'elenco dei giocatori.
- **Registrazione Statistiche in Tempo Reale**: Per ogni giocatore, puoi registrare:
    - Punti (da 1, 2 o 3)
    - Tiri Sbagliati (da 1, 2 o 3)
    - Assist
    - Rimbalzi
    - Falli
- **Tracciamento Geografico**: Ogni evento statistico viene registrato con la sua posizione esatta sul campo, permettendo un'analisi spaziale dettagliata.
- **Gestione per Quarto di Gioco**: Seleziona il quarto di gioco corrente (inclusi eventuali tempi supplementari) per associare ogni azione al momento corretto della partita.
- **Dashboard di Gioco**: Visualizza i totali di squadra (punti, assist, rimbalzi, falli) in tempo reale.
- **Esportazione e Importazione Dati**: Salva i dati completi di una partita in un file JSON. Puoi importare uno o più file per analizzarli in un secondo momento.
- **Analisi Avanzata Multi-Partita**:
    - **Dashboard Dedicata**: Una sezione separata per l'analisi post-partita.
    - **Confronto Partite**: Carica più file JSON e confronta le statistiche aggregate di diverse partite.
    - **Filtri Dinamici**: Filtra i dati per una o più partite e per uno specifico quarto di gioco.
    - **Grafici Interattivi**: Analizza la distribuzione di punti, assist, rimbalzi e falli tra i giocatori con grafici a barre.
    - **Statistiche di Tiro**: Visualizza le percentuali di tiro totali, da 1, 2 e 3 punti, con grafici a torta per il rapporto tra tiri segnati e sbagliati.
- **Heatmap (Mappa di Calore)**: Visualizza la densità e la posizione di tutti gli eventi sul campo. Puoi filtrare la mappa per tipo di evento (punti, assist, falli, ecc.) per un'analisi ancora più mirata.

## Come si Usa l'Applicazione

### 1. Configurazione della Partita
- Apri l'applicazione: verrai accolto dalla schermata di configurazione.
- **Nome Squadra**: Inserisci il nome che identificherà la partita o la squadra (es. "Stagione 2024 - Partita 1").
- **Giocatori**: Aggiungi i nomi dei giocatori. Puoi aggiungerne o rimuoverne quanti ne servono.
- **Inizia a Tracciare**: Clicca su "Inizia a Tracciare le Statistiche" per accedere alla dashboard di gioco.

### 2. Registrazione dei Dati durante la Partita
- **Seleziona il Quarto**: Utilizza il selettore nella parte superiore della dashboard per scegliere il quarto di gioco corrente.
- **Registra un'Azione**:
    1. Trova la scheda del giocatore desiderato.
    2. Clicca sul pulsante dell'azione che vuoi registrare (es. "+2 PTS" per un tiro da due punti segnato, o il `+` accanto ad "Assist").
    3. Si attiverà la visualizzazione del campo da basket. Clicca nel punto del campo in cui è avvenuta l'azione.
    4. L'evento verrà registrato e le statistiche del giocatore e della squadra si aggiorneranno automaticamente.
- **Annulla Azioni**: Utilizza i pulsanti `-` o "Annulla Punto" per rimuovere l'ultima azione registrata di quel tipo per un giocatore.

### 3. Gestione e Analisi
- **Nuova Partita**: Clicca su "Nuova Partita" per azzerare tutte le statistiche dei giocatori, mantenendo la stessa squadra.
- **Cambia Squadra**: Clicca su "Cambia Squadra" per tornare alla schermata di configurazione iniziale.
- **Esporta Dati**: Clicca su "Esporta", assegna un nome al file e salva le statistiche della partita corrente in formato JSON.
- **Importa Dati**: Clicca su "Importa" per caricare un file JSON di una partita salvata in precedenza.
- **Analizza Statistiche**:
    1. Clicca sul pulsante "Analizza Statistiche" per passare alla dashboard di analisi. I dati della partita in corso verranno trasferiti automaticamente.
    2. Nella pagina di analisi, puoi importare altre partite usando il pulsante "Importa Altra Partita".
    3. Usa le checkbox per selezionare quali partite includere nell'analisi aggregata.
    4. Utilizza il menu a tendina per filtrare i dati per un quarto specifico.
    5. Esplora i dati attraverso le tabelle, i grafici e la heatmap.

## Tecnologie Utilizzate

L'applicazione è stata sviluppata utilizzando un moderno stack tecnologico per garantire performance, reattività e una user experience di alta qualità.

- **Framework**: [Next.js](https://nextjs.org/) (con App Router)
- **Linguaggio**: [TypeScript](https://www.typescriptlang.org/)
- **Libreria UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Componenti UI**: [shadcn/ui](https://ui.shadcn.com/)
- **Libreria per Grafici**: [Recharts](https://recharts.org/)

---

*Questo progetto è stato creato con Firebase Studio.*
