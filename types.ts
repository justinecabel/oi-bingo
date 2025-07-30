
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