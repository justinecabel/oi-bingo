
import React from 'react';
import { BingoNumber } from '../types';

interface DrawnHistoryProps {
  drawnNumbers: BingoNumber[];
}

const DrawnHistory: React.FC<DrawnHistoryProps> = ({ drawnNumbers }) => {
  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="text-xl font-bold text-slate-300 mb-4 flex-shrink-0">Called Numbers</h3>
      {drawnNumbers.length === 0 ? (
         <div className="flex-grow flex items-center justify-center text-slate-500">
            <p>No numbers called yet.</p>
        </div>
      ) : (
        <div className="overflow-y-auto pr-2 flex-grow">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2">
            {drawnNumbers.map((num, index) => (
                <div
                key={`${num.letter}-${num.number}-${index}`}
                className={`
                    flex items-center justify-center p-2 rounded-lg font-roboto-mono font-bold text-lg
                    ${index === 0 ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'}
                `}
                >
                {num.letter}-{num.number}
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default DrawnHistory;
