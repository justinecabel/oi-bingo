import React from 'react';
import { BingoNumber, GameMode } from '../types';
import { BINGO_RANGES } from '../constants';

interface BingoBoardProps {
  allNumbers: BingoNumber[];
  currentNumber: BingoNumber | null;
  gameMode: GameMode;
  requiredColumns: string[];
}

const BingoBoard: React.FC<BingoBoardProps> = ({ allNumbers, currentNumber, gameMode, requiredColumns }) => {
  const isInPatternMode = gameMode === 'pattern' && requiredColumns.length > 0;
    
  return (
    <div className="bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-slate-700 w-full">
      <div className="grid grid-cols-5 gap-2 sm:gap-4">
        {BINGO_RANGES.map(({ letter, min, max }) => {
            const isColumnActive = !isInPatternMode || requiredColumns.includes(letter);
            
            return (
              <div key={letter} className="text-center flex flex-col">
                <h2 className={`text-4xl sm:text-5xl font-black text-cyan-400 mb-3 sm:mb-4 transition-opacity duration-300 ${isColumnActive ? 'opacity-100' : 'opacity-30'}`}>
                    {letter}
                </h2>
                <div className={`grid grid-cols-2 gap-1 sm:gap-2 transition-opacity duration-300 ${isColumnActive ? 'opacity-100' : 'opacity-30'}`}>
                  {allNumbers
                    .filter(n => n.number >= min && n.number <= max)
                    .map(num => {
                        const isCalled = num.called;
                        const isCurrent = currentNumber?.number === num.number;

                        const cellClasses = [
                            'font-roboto-mono', 'font-bold', 'text-base sm:text-lg',
                            'h-9 sm:h-10', 'flex', 'items-center', 'justify-center',
                            'rounded-sm sm:rounded-md', 'transition-all', 'duration-300',
                        ];

                        if (isCurrent) {
                            cellClasses.push('bg-amber-400 text-slate-900 scale-110 shadow-lg shadow-amber-400/30');
                        } else if (isCalled) {
                            cellClasses.push('bg-slate-700 text-slate-500');
                        } else {
                            // Default uncalled state for all modes
                            cellClasses.push('bg-slate-900 text-slate-300 hover:bg-slate-700');
                        }
                        
                        return (
                            <div
                                key={num.number}
                                className={cellClasses.join(' ')}
                            >
                            {num.number}
                            </div>
                        );
                    })}
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default BingoBoard;