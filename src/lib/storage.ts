import type { Team, Player, PlayerStats, StatEvent, StatEventType } from '@/types';

const GAME_KEY = 'basket-stats-keeper:current-game:v1';
const ANALYSIS_KEY = 'basket-stats-keeper:analysis-handoff:v1';
const THEME_KEY = 'basket-stats-keeper:theme:v1';

const EVENT_TYPES: StatEventType[] = ['point', 'assist', 'rebound', 'foul', 'missed_shot'];

export const emptyStats = (): PlayerStats => ({
  points: 0,
  assists: 0,
  rebounds: 0,
  fouls: 0,
  missed_shots: 0,
  events: [],
});

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeEvent = (raw: any): StatEvent | null => {
  if (!raw || typeof raw !== 'object') return null;
  const type = EVENT_TYPES.includes(raw.type) ? (raw.type as StatEventType) : null;
  if (!type) return null;

  const event: StatEvent = {
    type,
    x: toNumber(raw.x),
    y: toNumber(raw.y),
    quarter: Math.max(1, Math.round(toNumber(raw.quarter, 1))),
  };

  if (type === 'point' || type === 'missed_shot') {
    const points = Math.round(toNumber(raw.points, 0));
    if (points === 1 || points === 2 || points === 3) event.points = points;
  }

  return event;
};

export const sanitizeStats = (raw: any): PlayerStats => {
  const events = Array.isArray(raw?.events)
    ? (raw.events.map(sanitizeEvent).filter(Boolean) as StatEvent[])
    : [];

  const derived = events.reduce(
    (acc, event) => {
      if (event.type === 'point') {
        acc.points += event.points || 0;
      } else if (event.type === 'missed_shot') {
        acc.missed_shots += 1;
      } else if (event.type === 'assist') {
        acc.assists += 1;
      } else if (event.type === 'rebound') {
        acc.rebounds += 1;
      } else if (event.type === 'foul') {
        acc.fouls += 1;
      }
      return acc;
    },
    { points: 0, assists: 0, rebounds: 0, fouls: 0, missed_shots: 0 }
  );

  // Prefer event-derived totals when events exist, otherwise trust stored totals.
  if (events.length > 0) {
    return { ...derived, events };
  }

  return {
    points: toNumber(raw?.points),
    assists: toNumber(raw?.assists),
    rebounds: toNumber(raw?.rebounds),
    fouls: toNumber(raw?.fouls),
    missed_shots: toNumber(raw?.missed_shots),
    events,
  };
};

export const sanitizeTeam = (raw: any): Team | null => {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.name !== 'string' || !Array.isArray(raw.players)) return null;

  const players: Player[] = raw.players.map((player: any, index: number) => ({
    id: typeof player?.id === 'string' && player.id ? player.id : `player-${index}`,
    name:
      typeof player?.name === 'string' && player.name.trim()
        ? player.name.trim()
        : `Giocatore ${index + 1}`,
    stats: sanitizeStats(player?.stats),
  }));

  return { name: raw.name.trim() || 'Squadra senza nome', players };
};

export const loadCurrentGame = (): { team: Team; quarter: number } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const team = sanitizeTeam(parsed?.team);
    if (!team) return null;
    const quarter = Math.max(1, Math.round(toNumber(parsed?.quarter, 1)));
    return { team, quarter };
  } catch (error) {
    console.error('Impossibile recuperare la partita salvata', error);
    return null;
  }
};

export const saveCurrentGame = (team: Team, quarter: number) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GAME_KEY, JSON.stringify({ team, quarter }));
  } catch (error) {
    console.error('Impossibile salvare la partita corrente', error);
  }
};

export const clearCurrentGame = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(GAME_KEY);
  } catch (error) {
    console.error('Impossibile rimuovere la partita corrente', error);
  }
};

export const saveAnalysisHandoff = (team: Team) => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(ANALYSIS_KEY, JSON.stringify(team));
    return true;
  } catch (error) {
    console.error('Impossibile preparare i dati per l\'analisi', error);
    return false;
  }
};

export const takeAnalysisHandoff = (): Team | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ANALYSIS_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(ANALYSIS_KEY);
    return sanitizeTeam(JSON.parse(raw));
  } catch (error) {
    console.error('Impossibile caricare i dati per l\'analisi', error);
    return null;
  }
};

export const loadTheme = (): 'light' | 'dark' | null => {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(THEME_KEY);
  return value === 'light' || value === 'dark' ? value : null;
};

export const saveTheme = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Impossibile salvare il tema', error);
  }
};
