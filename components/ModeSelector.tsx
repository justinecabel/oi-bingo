
import React from 'react';
import { CircleDashed, Grid } from 'lucide-react';
import { GameMode } from '../types';

interface ModeSelectorProps {
    gameMode: GameMode;
    onModeChange: (mode: GameMode) => void;
}

const modes: { id: GameMode; label: string; icon: React.FC<any>; activeClass: string; focusClass: string; }[] = [
    { id: 'blackout', label: 'Blackout', icon: CircleDashed, activeClass: 'text-purple-400 border-purple-400', focusClass: 'focus:ring-purple-400' },
    { id: 'pattern', label: 'Pattern', icon: Grid, activeClass: 'text-amber-400 border-amber-400', focusClass: 'focus:ring-amber-400' },
];

const ModeSelector: React.FC<ModeSelectorProps> = ({ gameMode, onModeChange }) => {
    return (
        <div>
            <h3 className="text-xl font-bold text-slate-300 mb-4">Game Mode</h3>
            <div className="grid grid-cols-2 gap-2">
                {modes.map((mode) => {
                    const isActive = gameMode === mode.id;
                    const Icon = mode.icon;
                    return (
                        <button
                            key={mode.id}
                            onClick={() => onModeChange(mode.id)}
                            className={`
                                flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all
                                focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-800
                                ${isActive ? `${mode.activeClass} ${mode.focusClass}` : 'border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600 focus:ring-slate-500'}
                            `}
                            aria-pressed={isActive}
                            aria-label={`Select ${mode.label} mode`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-xs font-semibold">{mode.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default ModeSelector;