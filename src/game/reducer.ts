import { CATEGORIES, ROUND_TIMERS, ROUND_WRONG_ANSWER_PENALTIES, SESSIONS, type GradeCategory } from '../config';
import type { GameAction, GameSnapshot, GameState } from './types';

const initialSnapshot: GameSnapshot = {
  session: SESSIONS[0],
  category: 'Kelas 7',
  categoryStandings: {
    'Kelas 7': { teamNames: [...CATEGORIES['Kelas 7']], scores: [0, 0, 0, 0] },
    'Kelas 8': { teamNames: [...CATEGORIES['Kelas 8']], scores: [0, 0, 0] },
    'Kelas 9': { teamNames: [...CATEGORIES['Kelas 9']], scores: [0, 0, 0, 0] },
  },
  selectedQuestion: null,
  played: [],
  opened: [],
  control: null,
  firstControl: null,
  strikes: 0,
  bank: 0,
  stealing: false,
  roundDone: false,
  timerDuration: 0,
  seconds: 0,
  timerRunning: false,
  winnerShown: false,
};
export const initialState: GameState = { ...initialSnapshot, history: [] };

function snapshot(state: GameState): GameSnapshot {
  const { history: _history, ...rest } = state;
  return rest;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'undo') {
    const previous = state.history[state.history.length - 1];
    return previous ? { ...previous, history: state.history.slice(0, -1) } : state;
  }
  if (action.type === 'tick') {
    if (!state.timerRunning || state.seconds <= 0) return state;
    return { ...state, seconds: state.seconds - 1, timerRunning: state.seconds > 1 };
  }
  if (action.type === 'timerToggle') {
    if (!state.timerDuration) return state;
    const seconds = state.timerRunning ? state.seconds : state.seconds || state.timerDuration;
    return { ...state, seconds, timerRunning: !state.timerRunning };
  }
  if (action.type === 'timerDuration') {
    return { ...state, timerDuration: action.value, seconds: action.value, timerRunning: false };
  }
  if (action.type === 'resetAll') return initialState;

  const next = { ...state, history: [...state.history, snapshot(state)].slice(-30) };
  switch (action.type) {
    case 'session':
      return {
        ...next, session: action.session, selectedQuestion: null, opened: [], control: null, bank: 0, strikes: 0,
        roundDone: false, stealing: false,
        ...(next.category === 'Kelas 9' ? { timerDuration: ROUND_TIMERS[action.session], seconds: ROUND_TIMERS[action.session] } : {}),
      };
    case 'category':
      return {
        ...next, category: action.category, selectedQuestion: null, opened: [], control: null, firstControl: null,
        bank: 0, strikes: 0, roundDone: false, stealing: false, winnerShown: false,
        ...(action.category === 'Kelas 9' ? { timerDuration: ROUND_TIMERS[next.session], seconds: ROUND_TIMERS[next.session] } : {}),
      };
    case 'teamName': {
      const current = next.categoryStandings[next.category];
      if (!Number.isInteger(action.team) || action.team < 0 || action.team >= current.teamNames.length) return state;
      const teamNames = [...current.teamNames];
      teamNames[action.team] = action.value;
      return { ...next, categoryStandings: updateStanding(next, { ...current, teamNames }) };
    }
    case 'selectQuestion':
      return {
        ...next, selectedQuestion: action.question, opened: action.question.answers.map(() => false),
        played: next.played.includes(action.question.id) ? next.played : [...next.played, action.question.id],
        bank: 0, strikes: 0, control: null, firstControl: null, stealing: false, roundDone: false,
        timerRunning: false, seconds: next.timerDuration,
      };
    case 'control':
      return next.roundDone || !isTeamIndex(next, action.team)
        ? state
        : { ...next, control: action.team, firstControl: next.firstControl ?? action.team, stealing: false };
    case 'answer': {
      const question = next.selectedQuestion;
      if (
        !question
        || !isTeamIndex(next, next.control)
        || next.roundDone
        || !Number.isInteger(action.index)
        || action.index < 0
        || action.index >= question.answers.length
        || next.opened[action.index]
      ) return state;
      const opened = [...next.opened];
      opened[action.index] = true;
      const points = question.answers[action.index].points;
      const allOpen = opened.every(Boolean);
      const current = next.categoryStandings[next.category];
      if (next.stealing) {
        const scores = [...current.scores];
        scores[next.control] += next.bank + points;
        return { ...next, opened, categoryStandings: updateStanding(next, { ...current, scores }), bank: 0, roundDone: true, stealing: false, timerRunning: false };
      }
      if (allOpen) {
        const scores = [...current.scores];
        scores[next.control] += next.bank + points;
        return { ...next, opened, categoryStandings: updateStanding(next, { ...current, scores }), bank: 0, roundDone: true, timerRunning: false };
      }
      return { ...next, opened, bank: next.bank + points };
    }
    case 'strike': {
      if (!next.selectedQuestion || !isTeamIndex(next, next.control) || next.roundDone) return state;
      const strikes = next.strikes + 1;
      const current = next.categoryStandings[next.category];
      const scores = [...current.scores];
      const wrongPenalty = ROUND_WRONG_ANSWER_PENALTIES[next.session];
      scores[next.control] -= wrongPenalty;
      const categoryStandings = updateStanding(next, { ...current, scores });
      if (strikes >= 3 && !next.stealing) {
        const otherTeam = (next.control + 1) % next.categoryStandings[next.category].teamNames.length;
        return { ...next, strikes, categoryStandings, control: otherTeam, stealing: true, timerRunning: false };
      }
      if (next.stealing) {
        const finalScores = addScore(scores, next.firstControl, next.bank);
        return { ...next, strikes, categoryStandings: updateStanding(next, { ...current, scores: finalScores }), bank: 0, roundDone: true, stealing: false };
      }
      return { ...next, strikes, categoryStandings };
    }
    case 'manualScore':
      return updateTeamScore(next, action.team, action.amount);
    case 'resetStrikes':
      return { ...next, strikes: 0 };
    case 'revealAll':
      return { ...next, opened: next.opened.map(() => true) };
    case 'nextQuestion':
      return { ...next, selectedQuestion: null, opened: [], control: null, firstControl: null, strikes: 0, bank: 0, stealing: false, roundDone: false };
    case 'newMatch':
      return resetCurrentMatch(next);
    case 'winner':
      return { ...next, winnerShown: !next.winnerShown };
    default:
      return state;
  }
}

function resetCurrentMatch(state: GameState): GameState {
  const current = state.categoryStandings[state.category];
  const categoryStandings = updateStanding(state, { ...current, scores: current.scores.map(() => 0) });
  return {
    ...initialSnapshot,
    session: state.session,
    category: state.category,
    categoryStandings,
    played: state.played,
    timerDuration: state.timerDuration,
    seconds: state.timerDuration,
    history: state.history,
  };
}

function addScore(scores: number[], team: number | null, amount: number): number[] {
  if (team === null || team < 0 || team >= scores.length) return scores;
  const updated = [...scores];
  updated[team] = Math.max(0, updated[team] + amount);
  return updated;
}

function isTeamIndex(state: GameState, team: number | null): team is number {
  return team !== null && Number.isInteger(team) && team >= 0 && team < state.categoryStandings[state.category].teamNames.length;
}

function updateStanding(state: GameState, standing: GameState['categoryStandings'][GradeCategory]): GameState['categoryStandings'] {
  return { ...state.categoryStandings, [state.category]: standing };
}

function updateTeamScore(state: GameState, team: number, amount: number): GameState {
  const current = state.categoryStandings[state.category];
  if (!Number.isInteger(team) || team < 0 || team >= current.scores.length) return state;
  return {
    ...state,
    categoryStandings: updateStanding(state, { ...current, scores: addScore(current.scores, team, amount) }),
  };
}
