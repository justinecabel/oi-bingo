
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { BingoNumber, GameMode } from './types';
import { BINGO_RANGES, PATTERN_MAP } from './constants';
import BingoBoard from './components/BingoBoard';
import CurrentNumberDisplay from './components/CurrentNumberDisplay';
import DrawnHistory from './components/DrawnHistory';
import ControlPanel from './components/ControlPanel';
import FloatingDrawButton from './components/FloatingDrawButton';
import PatternSelector from './components/PatternSelector';
import { CircleDashed, X } from 'lucide-react';
import ModeSelector from './components/ModeSelector';
import EventSetupModal from './components/EventSetupModal';
import CardCheckerPage from './components/CardCheckerPage';

type AppPage = 'caller' | 'checker';

const initializeNumbers = (): BingoNumber[] => {
  const numbers: BingoNumber[] = [];
  BINGO_RANGES.forEach(({ letter, min, max }) => {
    for (let i = min; i <= max; i++) {
      numbers.push({ letter, number: i, called: false });
    }
  });
  return numbers;
};

const initializePattern = (): boolean[] => Array(25).fill(false);

const App: React.FC = () => {
    const [allNumbers, setAllNumbers] = useState<BingoNumber[]>(() => {
        try {
            const saved = localStorage.getItem('bingo-allNumbers');
            return saved ? JSON.parse(saved) : initializeNumbers();
        } catch (error: any) {
            console.error("Failed to parse allNumbers from localStorage", error);
            return initializeNumbers();
        }
    });
    const [drawnNumbers, setDrawnNumbers] = useState<BingoNumber[]>(() => {
        try {
            const saved = localStorage.getItem('bingo-drawnNumbers');
            return saved ? JSON.parse(saved) : [];
        } catch (error: any) {
            console.error("Failed to parse drawnNumbers from localStorage", error);
            return [];
        }
    });
    const [currentNumber, setCurrentNumber] = useState<BingoNumber | null>(() => {
        try {
            const saved = localStorage.getItem('bingo-currentNumber');
            return saved ? JSON.parse(saved) : null;
        } catch (error: any) {
            console.error("Failed to parse currentNumber from localStorage", error);
            return null;
        }
    });
    const [pendingNumber, setPendingNumber] = useState<BingoNumber | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [isRevealing, setIsRevealing] = useState<boolean>(false);
    const [gameMode, setGameMode] = useState<GameMode>(() => {
        const saved = localStorage.getItem('bingo-gameMode');
        return saved === 'pattern' ? 'pattern' : 'blackout';
    });
    const [selectedPattern, setSelectedPattern] = useState<boolean[]>(() => {
        try {
            const saved = localStorage.getItem('bingo-selectedPattern');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) && parsed.length === 25 ? parsed : initializePattern();
        } catch (error: any) {
            console.error("Failed to parse selectedPattern from localStorage", error);
            return initializePattern();
        }
    });
    const [headerText, setHeaderText] = useState<string>(() => {
        return localStorage.getItem('bingo-headerText') || 'Oi, Bingo!!';
    });
    const [logoUrl, setLogoUrl] = useState<string>(() => {
        return localStorage.getItem('bingo-logoUrl') || '';
    });
    const [activePage, setActivePage] = useState<AppPage>(() => {
        return localStorage.getItem('bingo-activePage') === 'checker' ? 'checker' : 'caller';
    });
    const [isEventSetupModalOpen, setIsEventSetupModalOpen] = useState(false);
    const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
        localStorage.setItem('bingo-allNumbers', JSON.stringify(allNumbers));
        localStorage.setItem('bingo-drawnNumbers', JSON.stringify(drawnNumbers));
        if (currentNumber) {
            localStorage.setItem('bingo-currentNumber', JSON.stringify(currentNumber));
        } else {
            localStorage.removeItem('bingo-currentNumber');
        }
    } catch (error: any) {
        console.error("Failed to save game state to localStorage", error);
    }
  }, [allNumbers, drawnNumbers, currentNumber]);

  useEffect(() => {
    try {
        localStorage.setItem('bingo-gameMode', gameMode);
        localStorage.setItem('bingo-selectedPattern', JSON.stringify(selectedPattern));
    } catch (error: any) {
        console.error("Failed to save UI state to localStorage", error);
    }
  }, [gameMode, selectedPattern]);

    useEffect(() => {
        try {
            localStorage.setItem('bingo-headerText', headerText);
            localStorage.setItem('bingo-logoUrl', logoUrl);
        } catch (error: any) {
            console.error("Failed to save customization state to localStorage", error);
        }
    }, [headerText, logoUrl]);

    useEffect(() => {
        localStorage.setItem('bingo-activePage', activePage);
    }, [activePage]);

  const availableNumbers = useMemo(() => allNumbers.filter(n => !n.called), [allNumbers]);
  const hasActivePattern = useMemo(() => selectedPattern.some(p => p), [selectedPattern]);

  const requiredColumns = useMemo(() => {
    if (gameMode === 'pattern' && hasActivePattern) {
        return [...new Set(selectedPattern.map((p, i) => p ? PATTERN_MAP[i] : null).filter(Boolean as any as (x: string | null) => x is string))];
    }
    return [];
  }, [gameMode, hasActivePattern, selectedPattern]);

  const isGameOver = useMemo(() => {
    if (gameMode === 'pattern' && hasActivePattern) {
        const patternAvailable = availableNumbers.filter(n => requiredColumns.includes(n.letter));
        return patternAvailable.length === 0;
    }
    return availableNumbers.length === 0;
  }, [availableNumbers, gameMode, hasActivePattern, requiredColumns]);
  
  const noPatternSelected = useMemo(() => gameMode === 'pattern' && !hasActivePattern, [gameMode, hasActivePattern]);

  const handleDrawNumber = useCallback(() => {
    if (isGameOver || isDrawing || isRevealing || noPatternSelected) return;

    let pool = availableNumbers;

    if (gameMode === 'pattern' && hasActivePattern) {
        pool = availableNumbers.filter(n => requiredColumns.includes(n.letter));
    }

    if (pool.length === 0) {
        console.warn("No available numbers to draw from for the current selection.");
        return;
    }

    setIsDrawing(true);
    setPendingNumber(null);
    setCurrentNumber(null); 

    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * pool.length);
        const drawn = pool[randomIndex];

        setPendingNumber(drawn);
        setIsDrawing(false);
    }, 2500);
  }, [availableNumbers, isGameOver, isDrawing, isRevealing, hasActivePattern, gameMode, noPatternSelected, requiredColumns]);

  const handleRevealComplete = useCallback((revealedNumber: BingoNumber) => {
    setPendingNumber((pending) => {
        if (!pending || pending.number !== revealedNumber.number) return pending;

        setCurrentNumber(revealedNumber);
        setDrawnNumbers(prev => [revealedNumber, ...prev]);
        setAllNumbers(prev =>
            prev.map(n => (n.number === revealedNumber.number ? { ...n, called: true } : n))
        );

        return null;
    });
  }, []);

  const handleNewGame = useCallback(() => {
    setAllNumbers(initializeNumbers());
    setDrawnNumbers([]);
    setCurrentNumber(null);
    setPendingNumber(null);
    setIsDrawing(false);
    setIsRevealing(false);
    // Game mode, pattern, and customization are intentionally preserved.
  }, []);

  const handleConfirmNewGame = useCallback(() => {
    handleNewGame();
    setIsNewGameConfirmOpen(false);
  }, [handleNewGame]);

  const handleTogglePattern = useCallback((index: number) => {
    setSelectedPattern(prev => {
        const newPattern = [...prev];
        newPattern[index] = !newPattern[index];
        return newPattern;
    })
  }, []);
  
  const handleClearPattern = useCallback(() => {
      setSelectedPattern(initializePattern());
  }, []);
  
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <input
        id="logo-upload"
        type="file"
        ref={fileInputRef}
        onChange={handleLogoChange}
        className="hidden"
        accept="image/*"
        aria-hidden="true"
      />
      <header className="w-full max-w-screen-2xl mx-auto flex flex-col gap-4 mb-6">
        <div className="w-full flex justify-between items-center gap-4">
        <button
          onClick={() => setIsEventSetupModalOpen(true)}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
          aria-label="Edit event title and logo"
          title="Edit event title and logo"
        >
          {logoUrl ? (
              <img src={logoUrl} alt="Custom Bingo Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover bg-slate-700" />
          ) : (
              <CircleDashed className="text-purple-400 w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0"/>
          )}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white text-left">
              {headerText}
          </h1>
        </button>
        <p className="font-roboto-mono text-lg text-purple-400 flex-shrink-0 ml-4">
            {activePage === 'caller' ? `${availableNumbers.length} left` : 'checker'}
        </p>
        </div>
        <nav className="flex w-full sm:w-auto gap-2 bg-slate-800/70 border border-slate-700 rounded-xl p-1.5" aria-label="App pages">
            {[
                { id: 'caller' as const, label: 'Caller' },
                { id: 'checker' as const, label: 'Card Checker' },
            ].map((page) => {
                const isActive = activePage === page.id;
                return (
                    <button
                        key={page.id}
                        onClick={() => setActivePage(page.id)}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                            isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {page.label}
                    </button>
                );
            })}
        </nav>
      </header>

      {activePage === 'caller' ? (
      <main className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
        <div className="lg:col-span-2 2xl:col-span-3 flex flex-col gap-8">
          <CurrentNumberDisplay
            currentNumber={pendingNumber || currentNumber}
            isDrawing={isDrawing}
            onRevealStateChange={setIsRevealing}
            onRevealComplete={handleRevealComplete}
          />
          <BingoBoard 
            allNumbers={allNumbers} 
            currentNumber={currentNumber}
            gameMode={gameMode}
            requiredColumns={requiredColumns}
          />
        </div>

        <div className="flex flex-col gap-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 min-h-0">
            <div className="flex flex-col gap-6">
                <ModeSelector gameMode={gameMode} onModeChange={setGameMode} />
                <ControlPanel onReset={() => setIsNewGameConfirmOpen(true)} />
                {gameMode === 'pattern' && (
                    <PatternSelector selectedPattern={selectedPattern} onToggle={handleTogglePattern} onClear={handleClearPattern} />
                )}
            </div>
            <div className="mt-2 flex-grow min-h-0">
                <DrawnHistory drawnNumbers={drawnNumbers} />
            </div>
        </div>
      </main>
      ) : (
        <main className="w-full">
          <CardCheckerPage />
        </main>
      )}
      
      {activePage === 'caller' && (
        <FloatingDrawButton
        onClick={handleDrawNumber}
        isDrawing={isDrawing || isRevealing}
        isGameOver={isGameOver}
        gameMode={gameMode}
        noPatternSelected={noPatternSelected}
        />
      )}

       <EventSetupModal
        isOpen={isEventSetupModalOpen}
        onClose={() => setIsEventSetupModalOpen(false)}
        headerText={headerText}
        setHeaderText={setHeaderText}
        logoUrl={logoUrl}
        setLogoUrl={setLogoUrl}
        onUploadClick={() => fileInputRef.current?.click()}
      />

      {isNewGameConfirmOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-game-confirm-title"
          onClick={() => setIsNewGameConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-5 text-slate-100 shadow-2xl shadow-black/30"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="new-game-confirm-title" className="text-xl font-black text-white">
                  New Game
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Clear all called numbers and start a new game?
                </p>
              </div>
              <button
                onClick={() => setIsNewGameConfirmOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label="Cancel new game"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsNewGameConfirmOpen(false)}
                className="rounded-lg bg-slate-800 px-4 py-2.5 font-bold text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNewGame}
                className="rounded-lg bg-red-500 px-4 py-2.5 font-bold text-white hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}

       <footer className="w-full max-w-screen-2xl mx-auto text-center mt-12 text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Oi, Bingo!!. All rights reserved.</p>
        </footer>
    </div>
  );
};

export default App;
