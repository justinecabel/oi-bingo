
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
  const labelClassName = 'ml-2 flex-shrink-0 whitespace-nowrap text-sm sm:text-base font-bold';

  const modeConfig = {
    blackout: {
      color: 'bg-purple-600 hover:bg-purple-500 focus:ring-purple-400/50',
      icon: <CircleDashed className="w-6 h-6 sm:w-7 sm:w-7" strokeWidth={2.5} />,
      text: 'Draw Number',
    },
    pattern: {
      color: 'bg-amber-500 hover:bg-amber-400 focus:ring-amber-300/50',
      icon: <Grid className="w-6 h-6 sm:w-7 sm:w-7" strokeWidth={2.5} />,
      text: 'Draw Number',
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
          <div className="bingo-shaker" aria-hidden="true">
            <div className="bingo-shaker-lid" />
            <div className="bingo-shaker-body">
              <span className="bingo-ball bingo-ball-one" />
              <span className="bingo-ball bingo-ball-two" />
              <span className="bingo-ball bingo-ball-three" />
            </div>
          </div>
          <span className={labelClassName} style={{ whiteSpace: 'nowrap' }}>Rolling...</span>
        </>
      );
    }
    if (isGameOver) {
    return <span className="flex-shrink-0 whitespace-nowrap text-sm sm:text-base font-bold" style={{ whiteSpace: 'nowrap' }}>Game Over</span>;
    }
    if (noPatternSelected) {
      return (
        <>
          <Target className="w-6 h-6 sm:w-7 sm:w-7" strokeWidth={2.5} />
          <span className={labelClassName} style={{ whiteSpace: 'nowrap' }}>Select a Pattern</span>
        </>
      );
    }
    
    const { icon, text } = modeConfig[gameMode];
    return (
      <>
        {icon}
        <span className={labelClassName} style={{ whiteSpace: 'nowrap' }}>{text}</span>
      </>
    );
  };

  const buttonColor = isDisabled && !noPatternSelected ? 'bg-slate-600' : modeConfig[gameMode].color;
  const buttonShadow = isDisabled && !noPatternSelected
    ? 'shadow-2xl shadow-black/40'
    : gameMode === 'pattern'
      ? 'shadow-2xl shadow-black/50'
      : 'shadow-2xl shadow-black/50';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
      className={`
        fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50
        flex items-center justify-center
        h-16 w-52 px-6 sm:h-20 sm:w-56 sm:px-8
        rounded-full
        text-white
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-4
        ${buttonShadow}
        ${buttonColor}
        transform hover:scale-105
        disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none
      `}
    >
      {getButtonContent()}
      <style>{`
        @keyframes bingo-shake {
          0%, 100% { transform: rotate(-8deg) translateY(0); }
          25% { transform: rotate(8deg) translateY(-1px); }
          50% { transform: rotate(-5deg) translateY(1px); }
          75% { transform: rotate(7deg) translateY(-1px); }
        }

        @keyframes bingo-ball-bounce {
          0%, 100% { transform: translate(0, 0); opacity: 0.95; }
          33% { transform: translate(4px, -5px); }
          66% { transform: translate(-3px, 4px); }
        }

        .bingo-shaker {
          position: relative;
          width: 1.75rem;
          height: 1.75rem;
          animation: bingo-shake 0.34s ease-in-out infinite;
          transform-origin: 50% 85%;
        }

        .bingo-shaker-lid {
          position: absolute;
          left: 0.45rem;
          top: 0.05rem;
          width: 0.85rem;
          height: 0.26rem;
          border-radius: 999px;
          background: currentColor;
        }

        .bingo-shaker-body {
          position: absolute;
          inset: 0.38rem 0.18rem 0.08rem;
          border: 2px solid currentColor;
          border-radius: 0.35rem 0.35rem 0.65rem 0.65rem;
          overflow: hidden;
        }

        .bingo-ball {
          position: absolute;
          width: 0.38rem;
          height: 0.38rem;
          border-radius: 999px;
          background: currentColor;
          animation: bingo-ball-bounce 0.42s ease-in-out infinite;
        }

        .bingo-ball-one { left: 0.18rem; bottom: 0.16rem; }
        .bingo-ball-two { left: 0.58rem; bottom: 0.45rem; animation-delay: -0.12s; }
        .bingo-ball-three { right: 0.16rem; bottom: 0.18rem; animation-delay: -0.24s; }
      `}</style>
    </button>
  );
};

export default FloatingDrawButton;
