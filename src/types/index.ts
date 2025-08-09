export interface StatEvent {
  type: 'point' | 'assist' | 'rebound' | 'foul' | 'missed_shot';
  points?: 1 | 2 | 3;
  x: number;
  y: number;
}

export interface PlayerStats {
  points: number;
  assists: number;
  rebounds: number;
  fouls: number;
  missed_shots: number;
  events: StatEvent[];
}

export interface Player {
  id: string;
  name: string;
  stats: PlayerStats;
}

export interface Team {
  name:string;
  players: Player[];
}
