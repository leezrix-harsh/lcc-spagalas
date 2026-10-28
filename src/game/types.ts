import type { GradeCategory, SessionName } from '../config';

export interface Answer {
  text: string;
  points: number;
}

export interface Question {
  id: string;
  category: GradeCategory;
  session: SessionName;
  number: number;
  question: string;
  options?: string[];
  answers: Answer[];
}

export type TeamIndex = number;
export interface CategoryStanding {
  teamNames: string[];
  scores: number[];
}
export interface GameState {
  session: SessionName;
  category: GradeCategory;
  categoryStandings: Record<GradeCategory, CategoryStanding>;
  multipliers: Record<SessionName, number>;
  selectedQuestion: Question | null;
  played: string[];
  opened: boolean[];
  control: TeamIndex | null;
  firstControl: TeamIndex | null;
  strikes: number;
  bank: number;
  stealing: boolean;
  roundDone: boolean;
  timerDuration: number;
  seconds: number;
  timerRunning: boolean;
  winnerShown: boolean;
  history: GameSnapshot[];
}

export type GameSnapshot = Omit<GameState, 'history'>;
export type GameAction =
  | { type: 'session'; session: SessionName }
  | { type: 'category'; category: GradeCategory }
  | { type: 'multiplier'; session: SessionName; value: number }
  | { type: 'teamName'; team: TeamIndex; value: string }
  | { type: 'selectQuestion'; question: Question }
  | { type: 'control'; team: TeamIndex }
  | { type: 'answer'; index: number }
  | { type: 'strike' }
  | { type: 'timerDuration'; value: number }
  | { type: 'timerToggle' }
  | { type: 'tick' }
  | { type: 'manualScore'; team: TeamIndex; amount: number }
  | { type: 'resetStrikes' }
  | { type: 'revealAll' }
  | { type: 'nextQuestion' }
  | { type: 'newMatch' }
  | { type: 'resetAll' }
  | { type: 'winner' }
  | { type: 'undo' };
