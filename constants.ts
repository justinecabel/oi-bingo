
import { BingoRange } from './types';

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
