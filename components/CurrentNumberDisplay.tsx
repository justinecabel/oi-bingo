import React, { useState, useEffect, useRef } from 'react';
import { BingoNumber } from '../types';
import { BINGO_LETTERS, BINGO_RANGES } from '../constants';

interface CurrentNumberDisplayProps {
  currentNumber: BingoNumber | null;
  isDrawing: boolean;
  onRevealStateChange?: (isRevealing: boolean) => void;
  onRevealComplete?: (number: BingoNumber) => void;
}

const getRandomBingoNumber = (): BingoNumber => {
    const letter = BINGO_LETTERS[Math.floor(Math.random() * BINGO_LETTERS.length)];
    const range = BINGO_RANGES.find(r => r.letter === letter)!;
    const number = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    return { letter, number, called: false };
}

const CurrentNumberDisplay: React.FC<CurrentNumberDisplayProps> = ({ currentNumber, isDrawing, onRevealStateChange, onRevealComplete }) => {
  const [animatingNumber, setAnimatingNumber] = useState<BingoNumber | null>(null);
  const [revealStep, setRevealStep] = useState(3);
  const intervalRef = useRef<number | null>(null);
  const revealCompleteStep = currentNumber ? String(currentNumber.number).length + 1 : 3;
  const isRevealing = !isDrawing && Boolean(currentNumber) && revealStep < revealCompleteStep;
  const completedRevealRef = useRef<string | null>(null);

  useEffect(() => {
    onRevealStateChange?.(isRevealing);
  }, [isRevealing, onRevealStateChange]);

  useEffect(() => {
    if (isDrawing || !currentNumber) return;

    const revealKey = `${currentNumber.letter}-${currentNumber.number}`;
    if (revealStep >= revealCompleteStep && completedRevealRef.current !== revealKey) {
      completedRevealRef.current = revealKey;
      onRevealComplete?.(currentNumber);
    }
  }, [currentNumber, isDrawing, onRevealComplete, revealCompleteStep, revealStep]);
  
  useEffect(() => {
    if (isDrawing || isRevealing) {
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
  }, [isDrawing, isRevealing]);

  useEffect(() => {
    if (isDrawing || !currentNumber) {
      setRevealStep(0);
      completedRevealRef.current = null;
      return;
    }

    setRevealStep(0);
    completedRevealRef.current = null;
    const timers = [
      window.setTimeout(() => setRevealStep(1), 350),
      window.setTimeout(() => setRevealStep(2), 1200),
    ];

    if (String(currentNumber.number).length > 1) {
      timers.push(window.setTimeout(() => setRevealStep(3), 2050));
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [currentNumber, isDrawing]);

  const displayContent = () => {
    const numberToDisplay = isDrawing ? animatingNumber : currentNumber;
    const rollingNumber = animatingNumber || numberToDisplay;

    if (numberToDisplay && rollingNumber) {
      const finalDigits = String(numberToDisplay.number);
      const rollingDigits = String(rollingNumber.number).padStart(finalDigits.length, '0').slice(-finalDigits.length);
      const shouldReveal = !isDrawing;
      const displayLetter = shouldReveal && revealStep >= 1 ? numberToDisplay.letter : rollingNumber.letter;
      return (
        <div className="flex items-baseline justify-center">
          <span className={`text-8xl md:text-9xl font-black mr-2 reveal-piece ${
            shouldReveal && revealStep >= 1 ? 'text-cyan-400' : 'text-slate-500'
          }`}>
            {displayLetter}
          </span>
          <span className="text-8xl md:text-9xl font-black font-roboto-mono tabular-nums">
            {finalDigits.split('').map((digit, index) => {
              const digitRevealed = shouldReveal && revealStep >= index + 2;
              return (
              <span
                key={`${digit}-${index}`}
                className={`inline-block reveal-piece ${digitRevealed ? 'text-white' : 'text-slate-400'}`}
              >
                {digitRevealed ? digit : rollingDigits[index]}
              </span>
              );
            })}
          </span>
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
    <div className={`w-full h-48 md:h-56 rounded-2xl flex items-center justify-center border shadow-lg overflow-hidden ${
      isDrawing || isRevealing ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-800/50 border-slate-700'
    }`}>
      {displayContent()}
       <style>{`
        .reveal-piece {
          transition: opacity 0.22s ease, transform 0.22s ease;
        }
      `}</style>
    </div>
  );
};

export default CurrentNumberDisplay;
