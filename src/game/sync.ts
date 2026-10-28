import { CHANNEL_NAME, STORAGE_KEY } from '../config';
import type { GameState } from './types';
import { initialState } from './reducer';

export type SyncMessage =
  | { type: 'hello' }
  | { type: 'state'; state: Partial<GameState> }
  | { type: 'sfx'; name: string }
  | { type: 'heartbeat'; at: number };

export function createChannel(): BroadcastChannel | null {
  return 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_NAME) : null;
}
export function loadState(): GameState | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const saved = JSON.parse(value) as Partial<GameState>;
    if (
      !saved.categoryStandings
      || !saved.category
      || !saved.categoryStandings[saved.category]
      || !Array.isArray(saved.categoryStandings[saved.category].teamNames)
      || !Array.isArray(saved.categoryStandings[saved.category].scores)
    ) {
      return {
        ...initialState,
        session: saved.session ?? initialState.session,
        multipliers: saved.multipliers ?? initialState.multipliers,
        played: saved.played ?? [],
        timerDuration: saved.timerDuration ?? 0,
        seconds: saved.timerDuration ?? 0,
      };
    }
    const restored = {
      ...initialState,
      ...saved,
      categoryStandings: { ...initialState.categoryStandings, ...saved.categoryStandings },
      history: saved.history ?? [],
    };
    if (restored.selectedQuestion && !restored.selectedQuestion.category) {
      return {
        ...restored,
        selectedQuestion: null,
        opened: [],
        control: null,
        firstControl: null,
        strikes: 0,
        bank: 0,
        stealing: false,
        roundDone: false,
        history: [],
      };
    }
    return restored;
  } catch (error) {
    console.warn('State tersimpan tidak dapat dibaca.', error);
    return null;
  }
}
export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('State permainan tidak dapat disimpan.', error);
  }
}
export function audienceState(state: GameState): Partial<GameState> {
  return {
    ...state,
    selectedQuestion: state.selectedQuestion ? {
      ...state.selectedQuestion,
      answers: state.selectedQuestion.answers.map((answer, index) =>
        state.opened[index] ? answer : { text: '', points: 0 }),
    } : null,
    history: [],
  };
}
