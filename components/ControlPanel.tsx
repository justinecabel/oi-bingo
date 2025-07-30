
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ControlPanelProps {
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onReset }) => {
  return (
    <div className="flex flex-col gap-4 flex-shrink-0">
      <button
        onClick={onReset}
        className="
          flex items-center justify-center w-full px-6 py-3 text-md font-semibold rounded-lg transition-all duration-200
          bg-slate-700 text-slate-300 hover:bg-slate-600
          focus:outline-none focus:ring-4 focus:ring-slate-500/50
        "
        aria-label="Start a new game"
      >
        <RefreshCw className="mr-2 h-4 w-4"/>
        New Game
      </button>
    </div>
  );
};

export default ControlPanel;
