
import React from 'react';
import { CircleDashed, Grid, Target } from 'lucide-react';
import { GameMode } from '../types';

interface FloatingDrawButtonProps {
  onClick: () => void;
  isDrawing: boolean;
  isGameOver: boolean;
  gameMode: GameMode;
  noPatternSelected: boolean;
}

const FloatingDrawButton: React.FC<FloatingDrawButtonProps> = ({ onClick, isDrawing, isGameOver, gameMode, noPatternSelected }) => {
  const isDisabled = isDrawing || isGameOver || noPatternSelected;

  const modeConfig = {
    blackout: {
      color: 'bg-purple-600 hover:bg-purple-500 focus:ring-purple-400/50',
      icon: <CircleDashed className="w-6 h-6 sm:w-7 sm:w-7" strokeWidth={2.5} />,
      text: 'Draw Number',
    },
    pattern: {
      color: 'bg-amber-500 hover:bg-amber-400 focus:ring-amber-300/50',
      icon: <Grid className="w-6 h-6 sm:w-7 sm:w-7" strokeWidth={2.5} />,
      text: 'Draw Pattern',
    },
  };

  const getAriaLabel = () => {
    if (isGameOver) return 'Game Over';
    if (noPatternSelected) return 'Select a pattern to start drawing';
    if (isDrawing) return 'Rolling for a new number';
    return `Draw a new number for ${gameMode} mode`;
  };

  const getButtonContent = () => {
    if (isDrawing) {
      return (
        <>
          <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-t-2 border-b-2 border-white"></div>
          <span className="ml-3 text-base sm:text-lg font-bold tracking-wide">Rolling...</span>
        </>
      );
    }
    if (isGameOver) {
      return <span className="text-base sm:text-lg font-bold tracking-wide">Game Over</span>;
    }
    if (noPatternSelected) {
      return (
        <>
          <Target className="w-6 h-6 sm:w-7 sm:w-7" strokeWidth={2.5} />
          <span className="ml-3 text-base sm:text-lg font-bold tracking-wide">Select a Pattern</span>
        </>
      );
    }
    
    const { icon, text } = modeConfig[gameMode];
    return (
      <>
        {icon}
        <span className="ml-3 text-base sm:text-lg font-bold tracking-wide">{text}</span>
      </>
    );
  };

  const buttonColor = isDisabled && !noPatternSelected ? 'bg-slate-600' : modeConfig[gameMode].color;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
      className={`
        fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50
        flex items-center justify-center
        h-16 px-6 sm:h-20 sm:px-8
        rounded-full
        text-white
        shadow-xl
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-4
        ${buttonColor}
        transform hover:scale-105
        disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
      `}
    >
      {getButtonContent()}
    </button>
  );
};

export default FloatingDrawButton;