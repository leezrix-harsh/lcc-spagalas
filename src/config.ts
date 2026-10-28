export const EVENT_TITLE = 'LCC SUMPAH PEMUDA x BULAN BAHASA';
export const SCHOOL_NAME = 'SMP Negeri 13 Jember (Spagalas)';
export const SESSIONS = ['Penyisihan', 'Semi-Final', 'Final'] as const;
export type SessionName = (typeof SESSIONS)[number];
export const CATEGORIES = {
  'Kelas 7': ['7A', '7B', '7C', '7D'],
  'Kelas 8': ['8A', '8B', '8C'],
  'Kelas 9': ['9A', '9B', '9C', '9D'],
} as const;
export type GradeCategory = keyof typeof CATEGORIES;
export const CATEGORY_NAMES = Object.keys(CATEGORIES) as GradeCategory[];
export const ROUND_CORRECT_POINTS: Record<SessionName, number> = {
  Penyisihan: 2,
  'Semi-Final': 3,
  Final: 5,
};
export const ROUND_WRONG_ANSWER_PENALTIES: Record<SessionName, number> = {
  Penyisihan: 0,
  'Semi-Final': 0,
  Final: 2,
};
export const ROUND_TIMERS: Record<SessionName, number> = {
  Penyisihan: 30,
  'Semi-Final': 25,
  Final: 20,
};
export const TIMER_OPTIONS = [0, 10, 15, 20, 25, 30, 60] as const;
export const STORAGE_KEY = 'lcc-spagalas-state-v1';
export const CHANNEL_NAME = 'lcc-spagalas';
export const customSounds: Partial<Record<string, string>> = {};
