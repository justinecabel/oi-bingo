import React, { useMemo } from 'react';
import { X } from 'lucide-react';

interface PatternSelectorProps {
  selectedPattern: boolean[];
  onToggle: (index: number) => void;
  onClear: () => void;
}

const PatternSelector: React.FC<PatternSelectorProps> = ({ selectedPattern, onToggle, onClear }) => {
  const hasSelection = useMemo(() => selectedPattern.some(p => p), [selectedPattern]);

  return (
    <div className="flex flex-col p-4 rounded-lg bg-slate-900/50 border border-slate-700">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-amber-400">Pattern Setup</h3>
            <button
                onClick={onClear}
                disabled={!hasSelection}
                className="
                    flex items-center gap-1 text-sm text-slate-400 hover:text-white
                    disabled:text-slate-600 disabled:cursor-not-allowed transition-colors
                    focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-md
                "
                aria-label="Clear selected pattern"
            >
                <X className="w-4 h-4" />
                Clear
            </button>
        </div>
        <p className="text-sm text-slate-400 mb-4">Select squares to create a pattern. The drawer will only call numbers from the selected columns.</p>
        <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 25 }).map((_, index) => {
            const isFreeSpace = index === 12;
            const isSelected = selectedPattern[index];

            return (
            <button
                key={index}
                onClick={() => !isFreeSpace && onToggle(index)}
                disabled={isFreeSpace}
                className={`
                w-full aspect-square rounded-md flex items-center justify-center font-bold text-sm sm:text-base transition-all
                ${isFreeSpace ? 'bg-slate-700 text-slate-400 cursor-default' : ''}
                ${!isFreeSpace && isSelected ? 'bg-amber-500 text-white scale-105 shadow-lg shadow-amber-500/30' : ''}
                ${!isFreeSpace && !isSelected ? 'bg-slate-900 text-slate-300 hover:bg-slate-700' : ''}
                `}
                aria-label={isFreeSpace ? 'Free Space' : `Square ${index + 1}${isSelected ? ', selected' : ''}`}
            >
                {isFreeSpace ? 'FREE' : null}
            </button>
            );
        })}
        </div>
    </div>
  );
};

export default PatternSelector;