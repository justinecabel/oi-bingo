import React, { useState, useEffect, useRef } from 'react';
import { BingoNumber } from '../types';
import { BINGO_LETTERS, BINGO_RANGES } from '../constants';

interface CurrentNumberDisplayProps {
  currentNumber: BingoNumber | null;
  isDrawing: boolean;
}

const getRandomBingoNumber = (): BingoNumber => {
    const letter = BINGO_LETTERS[Math.floor(Math.random() * BINGO_LETTERS.length)];
    const range = BINGO_RANGES.find(r => r.letter === letter)!;
    const number = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    return { letter, number, called: false };
}

const CurrentNumberDisplay: React.FC<CurrentNumberDisplayProps> = ({ currentNumber, isDrawing }) => {
  const [animatingNumber, setAnimatingNumber] = useState<BingoNumber | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (isDrawing) {
      intervalRef.current = window.setInterval(() => {
        setAnimatingNumber(getRandomBingoNumber());
      }, 60);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setAnimatingNumber(null);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDrawing]);

  const displayContent = () => {
    const numberToDisplay = isDrawing ? animatingNumber : currentNumber;

    if (numberToDisplay) {
      const animationClass = !isDrawing ? 'animate-fade-in' : '';
      return (
        <div className={`flex items-baseline justify-center ${animationClass}`}>
          <span className="text-8xl md:text-9xl font-black text-cyan-400 mr-2">{numberToDisplay.letter}</span>
          <span className="text-8xl md:text-9xl font-black text-white font-roboto-mono">{numberToDisplay.number}</span>
        </div>
      );
    }

    return (
      <div className="flex items-baseline justify-center">
        <span className="text-6xl md:text-7xl font-black text-slate-600 font-roboto-mono">--</span>
      </div>
    );
  };
  
  return (
    <div className="bg-slate-800/50 w-full h-48 md:h-56 rounded-2xl flex items-center justify-center border border-slate-700 shadow-lg overflow-hidden">
      {displayContent()}
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
};

export default CurrentNumberDisplay;