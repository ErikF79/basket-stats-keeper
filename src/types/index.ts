export interface PlayerStats {
  points: number;
  assists: number;
  rebounds: number;
  fouls: number;
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
