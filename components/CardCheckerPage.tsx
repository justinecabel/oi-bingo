import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, ClipboardList, Download, MousePointerClick, Plus, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { BINGO_LETTERS, BINGO_RANGES, FREE_SPACE_INDEX, GAME_PATTERNS } from '../constants';
import { RegisteredCard } from '../types';

const emptyCardNumbers = (): (number | null)[] => Array.from({ length: 25 }, () => null);
type CheckerMode = 'prepare' | 'play';
type WinnerPopup = {
  number: number;
  winners: RegisteredCard[];
} | null;

const parseBingoNumber = (value: string): number | null => {
  const match = value.match(/\d+/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 75 ? parsed : null;
};

const isFreeSpace = (index: number) => index === FREE_SPACE_INDEX;
const getRangeForCell = (index: number) => {
  const letter = BINGO_LETTERS[index % BINGO_LETTERS.length];
  return BINGO_RANGES.find((range) => range.letter === letter) || BINGO_RANGES[0];
};

const normalizePatternCells = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(value.filter((cell) => Number.isInteger(cell) && cell >= 0 && cell < 25 && !isFreeSpace(cell))),
  ).sort((a, b) => a - b);
};

const normalizeCalledNumbers = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  return Array.from(new Set(value.filter((num) => Number.isInteger(num) && num >= 1 && num <= 75)));
};

const normalizeCards = (value: unknown): RegisteredCard[] => {
  const rawCards = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && Array.isArray((value as { cards?: unknown }).cards)
      ? (value as { cards: unknown[] }).cards
      : [];

  return rawCards.flatMap((card) => {
    if (!card || typeof card !== 'object') return [];

    const candidate = card as { id?: unknown; numbers?: unknown };
    const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
    if (!id || !Array.isArray(candidate.numbers) || candidate.numbers.length !== 25) {
      return [];
    }

    const seenNumbers = new Set<number>();
    const numbers = candidate.numbers.map((num, index) => {
      if (isFreeSpace(index)) return null;
      const range = getRangeForCell(index);
      const isValidNumber =
        typeof num === 'number' &&
        Number.isInteger(num) &&
        num >= range.min &&
        num <= range.max &&
        !seenNumbers.has(num);

      if (!isValidNumber) return null;
      seenNumbers.add(num);
      return num;
    });

    if (numbers.some((num, index) => !isFreeSpace(index) && typeof num !== 'number')) return [];

    return [{ id, numbers }];
  });
};

const CardCheckerPage: React.FC = () => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const cardInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cards, setCards] = useState<RegisteredCard[]>(() => {
    try {
      const saved = localStorage.getItem('bingo-checker-cards');
      const parsed = saved ? JSON.parse(saved) : [];
      return normalizeCards(parsed);
    } catch (error: any) {
      console.error('Failed to parse checker cards from localStorage', error);
      return [];
    }
  });
  const [calledNumbers, setCalledNumbers] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('bingo-checker-calledNumbers');
      const parsed = saved ? JSON.parse(saved) : [];
      return normalizeCalledNumbers(parsed);
    } catch (error: any) {
      console.error('Failed to parse checker called numbers from localStorage', error);
      return [];
    }
  });
  const [activePatternId, setActivePatternId] = useState<string>(() => {
    const savedPatternId = localStorage.getItem('bingo-checker-activePatternId');
    return GAME_PATTERNS.some((pattern) => pattern.id === savedPatternId) ? savedPatternId || GAME_PATTERNS[0].id : GAME_PATTERNS[0].id;
  });
  const [checkerMode, setCheckerMode] = useState<CheckerMode>(() => {
    return localStorage.getItem('bingo-checker-mode') === 'play' ? 'play' : 'prepare';
  });
  const [isPlaySetupCollapsed, setIsPlaySetupCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('bingo-checker-playSetupCollapsed') === 'true';
  });
  const [manualPatternCells, setManualPatternCells] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('bingo-checker-manualPatternCells');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? normalizePatternCells(parsed) : normalizePatternCells(GAME_PATTERNS[0].cells);
    } catch (error: any) {
      console.error('Failed to parse checker manual pattern from localStorage', error);
      return normalizePatternCells(GAME_PATTERNS[0].cells);
    }
  });
  const [cardId, setCardId] = useState('');
  const [cardNumbers, setCardNumbers] = useState<(number | null)[]>(emptyCardNumbers);
  const [message, setMessage] = useState('');
  const [winnerPopup, setWinnerPopup] = useState<WinnerPopup>(null);

  const activePattern = useMemo(
    () => GAME_PATTERNS.find((pattern) => pattern.id === activePatternId) || GAME_PATTERNS[0],
    [activePatternId],
  );

  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers]);
  const manualPatternSet = useMemo(() => new Set(manualPatternCells), [manualPatternCells]);

  const getWinningCards = (numbers: number[]) => {
    if (manualPatternCells.length === 0) return [];

    const numbersSet = new Set(numbers);
    return cards.filter((card) =>
      manualPatternCells.every((cellIndex) => {
        if (isFreeSpace(cellIndex)) return true;
        const cardNumber = card.numbers[cellIndex];
        return typeof cardNumber === 'number' && numbersSet.has(cardNumber);
      }),
    );
  };

  const winners = useMemo(() => {
    return getWinningCards(calledNumbers);
  }, [calledSet, cards, manualPatternCells]);

  useEffect(() => {
    try {
      localStorage.setItem('bingo-checker-cards', JSON.stringify(cards));
      localStorage.setItem('bingo-checker-calledNumbers', JSON.stringify(calledNumbers));
      localStorage.setItem('bingo-checker-activePatternId', activePatternId);
      localStorage.setItem('bingo-checker-mode', checkerMode);
      localStorage.setItem('bingo-checker-playSetupCollapsed', String(isPlaySetupCollapsed));
      localStorage.setItem('bingo-checker-manualPatternCells', JSON.stringify(manualPatternCells));
    } catch (error: any) {
      console.error('Failed to save checker state to localStorage', error);
    }
  }, [activePatternId, calledNumbers, cards, checkerMode, isPlaySetupCollapsed, manualPatternCells]);

  const handlePatternStarterChange = (patternId: string) => {
    const selectedPattern = GAME_PATTERNS.find((pattern) => pattern.id === patternId) || GAME_PATTERNS[0];
    setActivePatternId(patternId);
    setManualPatternCells(normalizePatternCells(selectedPattern.cells));
    setWinnerPopup(null);
    setMessage(`Loaded Game ${selectedPattern.game}: ${selectedPattern.name}.`);
  };

  const handleTogglePatternCell = (index: number) => {
    if (isFreeSpace(index)) return;

    setWinnerPopup(null);
    setManualPatternCells((prev) => {
      if (prev.includes(index)) {
        return prev.filter((cell) => cell !== index);
      }

      return [...prev, index].sort((a, b) => a - b);
    });
  };

  const focusCardInput = (startIndex: number, step: number) => {
    let nextIndex = startIndex + step;

    while (nextIndex >= 0 && nextIndex < 25 && isFreeSpace(nextIndex)) {
      nextIndex += step;
    }

    if (nextIndex >= 0 && nextIndex < 25) {
      cardInputRefs.current[nextIndex]?.focus();
      cardInputRefs.current[nextIndex]?.select();
    }
  };

  const handleCardNumberChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 2);
    const parsed = parseBingoNumber(sanitized);
    const range = getRangeForCell(index);
    const isInColumnRange = parsed === null || (parsed >= range.min && parsed <= range.max);

    setCardNumbers((prev) => {
      const next = [...prev];
      next[index] = sanitized === '' || !isInColumnRange ? null : parsed;
      return next;
    });

    if (sanitized.length > 0 && parsed && !isInColumnRange) {
      setMessage(`${range.letter} column accepts ${range.min}-${range.max}.`);
      return;
    }

    if (sanitized.length === 2 && parsed) {
      focusCardInput(index, 1);
    }
  };

  const handleCardNumberKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    const keyStepMap: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -5,
      ArrowDown: 5,
      Enter: 1,
    };
    const step = keyStepMap[event.key];

    if (step) {
      event.preventDefault();
      focusCardInput(index, step);
    }
  };

  const handleAddCard = () => {
    const trimmedId = cardId.trim();
    const hasDuplicateId = cards.some((card) => card.id.toLowerCase() === trimmedId.toLowerCase());
    const hasIncompleteCells = cardNumbers.some((num, index) => !isFreeSpace(index) && typeof num !== 'number');
    const enteredNumbers = cardNumbers.filter((num): num is number => typeof num === 'number');
    const hasDuplicateNumbers = enteredNumbers.length !== new Set(enteredNumbers).size;

    if (!trimmedId) {
      setMessage('Add a card ID first.');
      return;
    }

    if (hasDuplicateId) {
      setMessage(`Card ID "${trimmedId}" already exists.`);
      return;
    }

    if (hasIncompleteCells) {
      setMessage('Complete all card numbers before adding.');
      return;
    }

    if (hasDuplicateNumbers) {
      setMessage('Each card number must be unique.');
      return;
    }

    const nextCardNumbers = [...cardNumbers];
    nextCardNumbers[FREE_SPACE_INDEX] = null;
    setCards((prev) => [...prev, { id: trimmedId, numbers: nextCardNumbers }]);
    setCardId('');
    setCardNumbers(emptyCardNumbers());
    setMessage(`Card "${trimmedId}" registered.`);
  };

  const handleExportCards = () => {
    if (cards.length === 0) {
      setMessage('No registered cards to export.');
      return;
    }

    const payload = {
      app: 'Oi, Bingo!!',
      version: 1,
      exportedAt: new Date().toISOString(),
      cards,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oi-bingo-cards-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage(`Exported ${cards.length} registered card${cards.length === 1 ? '' : 's'}.`);
  };

  const handleImportCards = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        const importedCards = normalizeCards(parsed);

        if (importedCards.length === 0) {
          setMessage('No valid registered cards found in that JSON file.');
          return;
        }

        setCards((prev) => {
          const merged = new Map(prev.map((card) => [card.id.toLowerCase(), card]));
          importedCards.forEach((card) => merged.set(card.id.toLowerCase(), card));
          return Array.from(merged.values());
        });
        setWinnerPopup(null);
        setMessage(`Imported ${importedCards.length} card${importedCards.length === 1 ? '' : 's'} from JSON.`);
      } catch (error: any) {
        console.error('Failed to import registered cards', error);
        setMessage('Could not read that JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleToggleCalledNumber = (number: number) => {
    setCalledNumbers((prev) => {
      if (prev.includes(number)) {
        setWinnerPopup(null);
        setMessage(`Removed ${number} from host calls.`);
        return prev.filter((calledNumber) => calledNumber !== number);
      }

      const previousWinners = getWinningCards(prev);
      const nextCalledNumbers = [number, ...prev];
      const nextWinners = getWinningCards(nextCalledNumbers);
      const previousWinnerIds = new Set(previousWinners.map((card) => card.id));
      const newWinners = nextWinners.filter((card) => !previousWinnerIds.has(card.id));

      if (newWinners.length > 0) {
        setWinnerPopup({ number, winners: newWinners });
      } else {
        setWinnerPopup(null);
      }

      setMessage(`Host called ${number}.`);
      return nextCalledNumbers;
    });
  };

  const getCellState = (card: RegisteredCard, index: number) => {
    const isPatternCell = manualPatternSet.has(index);
    const number = card.numbers[index];
    const isCalled = isFreeSpace(index) || (typeof number === 'number' && calledSet.has(number));

    if (isPatternCell && isCalled) return 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-200';
    if (isPatternCell) return 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40';
    if (isCalled) return 'bg-slate-600 text-slate-200';
    return 'bg-slate-950 text-slate-400';
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto flex flex-col gap-6">
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportCards}
        className="hidden"
        aria-hidden="true"
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-800/50 border border-slate-700 rounded-2xl p-3">
        <div className="grid grid-cols-2 gap-2 sm:w-auto">
          {[
            { id: 'prepare' as const, label: 'Prepare', icon: ClipboardList },
            { id: 'play' as const, label: 'Play', icon: MousePointerClick },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = checkerMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setCheckerMode(mode.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                aria-pressed={isActive}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <div className="flex items-center justify-between sm:justify-end gap-4 text-sm font-roboto-mono text-slate-400">
            <span>{cards.length} cards</span>
            <span>{calledNumbers.length} calls</span>
            <span className={winners.length > 0 ? 'text-emerald-300' : 'text-slate-500'}>{winners.length} winners</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportCards}
              disabled={cards.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
          </div>
        </div>
      </div>

      {checkerMode === 'play' ? (
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)] gap-6 2xl:gap-8">
      <section className="flex flex-col gap-6 xl:sticky xl:top-6 xl:self-start">
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-white">Play Setup</h2>
              <p className="mt-1 truncate text-sm font-semibold text-slate-400">
                Game {activePattern.game}: {activePattern.name}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              {isPlaySetupCollapsed && (
                <div className="grid w-12 grid-cols-5 gap-0.5 xl:hidden" aria-hidden="true">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-[1px] ${
                        manualPatternSet.has(index)
                          ? 'bg-cyan-300'
                          : isFreeSpace(index)
                            ? 'bg-slate-500'
                            : 'bg-slate-950'
                      }`}
                    />
                  ))}
                </div>
              )}
              <span className="font-roboto-mono text-sm text-cyan-300">{cards.length} cards</span>
              <button
                onClick={() => setIsPlaySetupCollapsed((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-lg bg-slate-700 p-2 text-slate-200 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 xl:hidden"
                aria-expanded={!isPlaySetupCollapsed}
                aria-controls="play-setup-body"
                aria-label={isPlaySetupCollapsed ? 'Expand play setup' : 'Collapse play setup'}
                title={isPlaySetupCollapsed ? 'Expand play setup' : 'Collapse play setup'}
              >
                {isPlaySetupCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div id="play-setup-body" className={`mt-4 ${isPlaySetupCollapsed ? 'hidden xl:block' : 'block'}`}>
              <label htmlFor="game-pattern" className="block text-sm font-semibold text-slate-400 mb-2">
                Pattern Starter
              </label>
              <select
                id="game-pattern"
                value={activePatternId}
                onChange={(event) => handlePatternStarterChange(event.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {GAME_PATTERNS.map((pattern) => (
                  <option key={pattern.id} value={pattern.id}>
                    Game {pattern.game}: {pattern.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between gap-3 mt-4 mb-2">
                <p className="text-sm font-semibold text-slate-400">Manual Pattern</p>
                <button
                  onClick={() => {
                    setManualPatternCells([]);
                    setWinnerPopup(null);
                    setMessage('Manual pattern cleared.');
                  }}
                  disabled={manualPatternCells.length === 0}
                  className="text-sm font-semibold text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1" aria-label="Manual winning pattern drawing board">
                {Array.from({ length: 25 }).map((_, index) => {
                  const selected = manualPatternSet.has(index);
                  const freeSpace = isFreeSpace(index);
                  return (
                    <button
                      key={index}
                      onClick={() => handleTogglePatternCell(index)}
                      disabled={freeSpace}
                      className={`aspect-square rounded-sm border flex items-center justify-center text-[10px] font-bold ${
                        freeSpace
                          ? 'bg-slate-700 border-slate-600 text-slate-300 cursor-default'
                          : selected
                            ? 'bg-cyan-400 border-cyan-200 text-slate-950'
                            : 'bg-slate-950 border-slate-700 text-slate-600 hover:bg-slate-800'
                      }`}
                      aria-pressed={selected}
                      aria-label={freeSpace ? 'Free space' : `Pattern square ${index + 1}${selected ? ', selected' : ''}`}
                    >
                      {freeSpace ? 'FREE' : ''}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Draw the active winning shape here. Presets only fill the board as a starting point.
              </p>
            </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(340px,480px)] gap-6 min-w-0 items-start">
        <div className="min-w-0 flex flex-col gap-6">
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-xl font-bold text-slate-100">Click Host Calls</h3>
              <span className="font-roboto-mono text-sm text-cyan-300">{calledNumbers.length}/75</span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {BINGO_RANGES.map(({ letter, min, max }) => (
                <div key={letter} className="min-w-0">
                  <div className="text-center text-xl font-black text-cyan-300 mb-2">{letter}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3 gap-1.5">
                    {Array.from({ length: max - min + 1 }, (_, offset) => min + offset).map((number) => {
                      const isCalled = calledSet.has(number);
                      return (
                        <button
                          key={number}
                          onClick={() => handleToggleCalledNumber(number)}
                          className={`h-9 rounded-md font-roboto-mono font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                            isCalled
                              ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                              : 'bg-slate-950 text-slate-400 hover:bg-slate-700 hover:text-white'
                          }`}
                          aria-pressed={isCalled}
                          aria-label={`${letter}-${number}${isCalled ? ', called' : ''}`}
                        >
                          {number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-xl font-bold text-slate-100">Called Numbers</h3>
              <button
                onClick={() => {
                  setCalledNumbers([]);
                  setWinnerPopup(null);
                  setMessage('Host calls cleared.');
                }}
                disabled={calledNumbers.length === 0}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-10">
              {calledNumbers.length === 0 ? (
                <span className="text-slate-500">No host calls yet.</span>
              ) : (
                calledNumbers.map((number) => (
                  <span key={number} className="font-roboto-mono bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-sm">
                    {number}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-slate-100">Results</h3>
            <span className="font-roboto-mono text-sm text-cyan-300">{winners.length} winners</span>
          </div>

          {message && (
            <div className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300" role="status">
              {message}
            </div>
          )}

          {winners.length > 0 && (
            <div className="bg-emerald-500 text-slate-950 rounded-2xl p-5 shadow-lg shadow-emerald-500/20" role="alert">
              <div className="flex items-center gap-2 font-black text-xl">
                <CheckCircle2 className="w-6 h-6" />
                Winner
              </div>
              <p className="mt-2 font-bold">{winners.map((card) => card.id).join(', ')}</p>
            </div>
          )}

          {cards.length === 0 ? (
            <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-2xl p-8 text-center text-slate-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3" />
              No registered cards.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
              {cards.map((card) => {
                const isWinner = winners.some((winner) => winner.id === card.id);
                return (
                  <article
                    key={card.id}
                    className={`bg-slate-800/50 p-4 rounded-2xl border ${
                      isWinner ? 'border-emerald-300 shadow-lg shadow-emerald-500/20' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="min-w-0">
                        <h4 className="font-black text-white truncate">{card.id}</h4>
                        <p className={`text-sm ${isWinner ? 'text-emerald-300' : 'text-slate-500'}`}>
                          Manual pattern from Game {activePattern.game}
                        </p>
                      </div>
                      {isWinner && <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />}
                    </div>

                    <div className="grid grid-cols-5 gap-1 mb-1">
                      {BINGO_LETTERS.map((letter) => (
                        <div key={letter} className="text-center text-xs font-black text-cyan-300">
                          {letter}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {card.numbers.map((number, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-sm flex items-center justify-center font-roboto-mono text-sm font-bold ${getCellState(card, index)}`}
                        >
                          {isFreeSpace(index) ? 'F' : number}
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      </div>
      ) : (
      <section className="grid grid-cols-1 xl:grid-cols-[minmax(380px,520px)_minmax(0,1fr)] gap-6 min-w-0 items-start">
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 xl:sticky xl:top-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-xl font-bold text-slate-100">Register Card</h3>
            <input
              type="text"
              value={cardId}
              onChange={(event) => setCardId(event.target.value)}
              placeholder="Card ID"
              className="w-36 sm:w-48 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Card ID"
            />
          </div>

          <div className="w-full max-w-xl mx-auto">
            <div className="grid grid-cols-5 gap-2 mb-2">
              {BINGO_LETTERS.map((letter) => (
                <div key={letter} className="text-center text-lg font-black text-cyan-300">
                  {letter}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 25 }).map((_, index) => {
                const range = getRangeForCell(index);
                return (
                  <input
                    key={index}
                    ref={(element) => {
                      cardInputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    value={isFreeSpace(index) ? '' : cardNumbers[index] ?? ''}
                    onChange={(event) => handleCardNumberChange(index, event.target.value)}
                    onKeyDown={(event) => handleCardNumberKeyDown(index, event)}
                    disabled={isFreeSpace(index)}
                    placeholder={isFreeSpace(index) ? 'FREE' : `${range.min}-${range.max}`}
                    title={isFreeSpace(index) ? 'Free space' : `${range.letter}: ${range.min}-${range.max}`}
                    className={`aspect-square min-w-0 rounded-md text-center font-roboto-mono font-bold text-base sm:text-lg border focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                      isFreeSpace(index)
                        ? 'bg-slate-700 border-slate-600 text-slate-300 placeholder-slate-300'
                        : 'bg-slate-950 border-slate-700 text-white placeholder-slate-700'
                    }`}
                    aria-label={isFreeSpace(index) ? 'Free space' : `Card number square ${index + 1}, ${range.letter} ${range.min} to ${range.max}`}
                  />
                );
              })}
            </div>
          </div>

          <button
            onClick={handleAddCard}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-400/40"
          >
            <Plus className="w-5 h-5" />
            Add Card
          </button>
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-xl font-bold text-slate-100">Registered Cards</h3>
            <span className="font-roboto-mono text-sm text-cyan-300">{cards.length} cards</span>
          </div>
          {cards.length === 0 ? (
            <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-2xl p-8 text-center text-slate-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3" />
              No registered cards.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              {cards.map((card) => {
                const isWinner = winners.some((winner) => winner.id === card.id);
                return (
                  <article
                    key={card.id}
                    className={`bg-slate-800/50 p-4 rounded-2xl border ${
                      isWinner ? 'border-emerald-300 shadow-lg shadow-emerald-500/20' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="min-w-0">
                        <h4 className="font-black text-white truncate">{card.id}</h4>
                        <p className={`text-sm ${isWinner ? 'text-emerald-300' : 'text-slate-500'}`}>
                          Manual pattern from Game {activePattern.game}
                        </p>
                      </div>
                      <button
                        onClick={() => setCards((prev) => prev.filter((item) => item.id !== card.id))}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-300 hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-400/50"
                        aria-label={`Remove card ${card.id}`}
                        title="Remove card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-1 mb-1">
                      {BINGO_LETTERS.map((letter) => (
                        <div key={letter} className="text-center text-xs font-black text-cyan-300">
                          {letter}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {card.numbers.map((number, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-sm flex items-center justify-center font-roboto-mono text-sm font-bold ${getCellState(card, index)}`}
                        >
                          {isFreeSpace(index) ? 'F' : number}
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      )}
      {winnerPopup && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="winner-popup-title"
          onClick={() => setWinnerPopup(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-emerald-300 bg-emerald-400 p-6 text-slate-950 shadow-2xl shadow-emerald-400/30"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setWinnerPopup(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-900 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-slate-950"
              aria-label="Close winner popup"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 flex-shrink-0" />
              <div>
                <h3 id="winner-popup-title" className="text-2xl font-black">
                  Winner
                </h3>
                <p className="font-roboto-mono text-sm font-bold">Last call: {winnerPopup.number}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-4">
              {winnerPopup.winners.map((card) => (
                <div key={card.id} className="w-full max-w-[360px] rounded-xl bg-slate-950 p-4 text-emerald-300">
                  <h4 className="mb-3 truncate font-black">{card.id}</h4>
                  <div className="mb-1 grid grid-cols-5 gap-1">
                    {BINGO_LETTERS.map((letter) => (
                      <div key={letter} className="text-center text-xs font-black text-cyan-300">
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {card.numbers.map((number, index) => {
                      const isWinningCell = manualPatternSet.has(index);
                      const isLastCall = number === winnerPopup.number;
                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded-sm flex items-center justify-center font-roboto-mono text-sm font-bold ${
                            isWinningCell
                              ? 'bg-emerald-300 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          } ${isLastCall ? 'ring-4 ring-amber-300' : ''}`}
                        >
                          {isFreeSpace(index) ? 'F' : number}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardCheckerPage;
