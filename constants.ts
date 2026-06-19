
import { BingoPattern, BingoRange } from './types';

export const BINGO_LETTERS: ('B' | 'I' | 'N' | 'G' | 'O')[] = ['B', 'I', 'N', 'G', 'O'];

export const BINGO_RANGES: BingoRange[] = [
  { letter: 'B', min: 1, max: 15 },
  { letter: 'I', min: 16, max: 30 },
  { letter: 'N', min: 31, max: 45 },
  { letter: 'G', min: 46, max: 60 },
  { letter: 'O', min: 61, max: 75 },
];

// Corresponds to a 5x5 grid, read left-to-right, top-to-bottom.
export const PATTERN_MAP: ('B' | 'I' | 'N' | 'G' | 'O')[] = [
  'B', 'I', 'N', 'G', 'O',
  'B', 'I', 'N', 'G', 'O',
  'B', 'I', 'N', 'G', 'O', // Center 'N' corresponds to the free space
  'B', 'I', 'N', 'G', 'O',
  'B', 'I', 'N', 'G', 'O',
];

export const FREE_SPACE_INDEX = 12;

export const GAME_PATTERNS: BingoPattern[] = [
  { id: 'game-1', game: 1, name: 'Horizontal', cells: [5, 6, 7, 8, 9] },
  { id: 'game-2', game: 2, name: 'Small Kite', cells: [3, 4, 8, 9, 12, 16, 20] },
  { id: 'game-3', game: 3, name: 'Four Corners', cells: [0, 4, 20, 24] },
  { id: 'game-4', game: 4, name: 'Postage Stamp', cells: [3, 4, 8, 9] },
  { id: 'game-5', game: 5, name: 'Diamond', cells: [2, 6, 8, 10, 14, 16, 18, 22] },
  { id: 'game-6', game: 6, name: 'X', cells: [0, 4, 6, 8, 12, 16, 18, 20, 24] },
  { id: 'game-7', game: 7, name: 'I', cells: [0, 1, 2, 3, 4, 7, 12, 17, 20, 21, 22, 23, 24] },
  { id: 'game-8', game: 8, name: 'P', cells: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 15, 20] },
  { id: 'game-9', game: 9, name: 'Small Picture Frame', cells: [6, 7, 8, 11, 13, 16, 17, 18] },
  { id: 'game-10', game: 10, name: 'Big Picture Frame', cells: [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24] },
  { id: 'game-11', game: 11, name: 'Lucky 7', cells: [0, 1, 2, 3, 4, 8, 12, 16, 20] },
  { id: 'game-12', game: 12, name: 'Blackout', cells: Array.from({ length: 25 }, (_, index) => index) },
];
