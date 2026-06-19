
export interface BingoNumber {
  letter: 'B' | 'I' | 'N' | 'G' | 'O';
  number: number;
  called: boolean;
}

export interface BingoRange {
  letter: 'B' | 'I' | 'N' | 'G' | 'O';
  min: number;
  max: number;
}

export type GameMode = 'blackout' | 'pattern';

export interface RegisteredCard {
  id: string;
  numbers: (number | null)[];
}

export interface BingoPattern {
  id: string;
  game: number;
  name: string;
  cells: number[];
}
