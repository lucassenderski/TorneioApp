
export interface Team {
  id: number;
  name: string;
}

export enum GameStatus {
  Waiting = 'waiting',
  InProgress = 'in_progress',
  Finished = 'finished',
}

export enum Sport {
  Volleyball = 'volleyball',
  Futsal = 'futsal',
}

export interface VolleyballScore {
  setsA: number;
  setsB: number;
  currentSet: number;
  points: { a: number; b: number }[];
  faultsA: number;
  faultsB: number;
}

export interface FutsalScore {
  goalsA: number;
  goalsB: number;
  faultsA: number;
  faultsB: number;
  isPenaltyShootout: boolean;
  penalties: { a: (boolean | null)[]; b: (boolean | null)[] };
}

export interface Match {
  id: number;
  sport: Sport;
  teamAId: number | null;
  teamBId: number | null;
  status: GameStatus;
  winnerId?: number | null;
  score: VolleyballScore | FutsalScore;
}

export interface BracketRound {
  id: number;
  name: string;
  matches: Match[];
}

// New types for logging
export interface ActionLog {
  id: string; // nanoid or timestamp + random
  timestamp: string;
  fiscalId: string;
  matchId: number;
  sport: Sport;
  action: string; // e.g., "SCORE_UPDATE", "STATUS_CHANGE"
  details: any; // e.g., { from: 1, to: 2 }, { from: 'in_progress', to: 'finished' }
}

export interface FiscalSession {
  id: string;
  fiscalId: string;
  loginTime: string;
  logoutTime?: string;
}
