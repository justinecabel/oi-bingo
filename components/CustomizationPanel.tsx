
import React from 'react';
import { Settings, ImageUp, Trash2 } from 'lucide-react';

interface CustomizationPanelProps {
  headerText: string;
  setHeaderText: (text: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  onUploadClick: () => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ headerText, setHeaderText, logoUrl, setLogoUrl, onUploadClick }) => {
  return (
    <div className="flex flex-col p-4 rounded-lg bg-slate-900/50 border border-slate-700">
      <div className="flex items-center mb-4">
        <Settings className="w-5 h-5 mr-2 text-slate-400" />
        <h3 className="text-xl font-bold text-slate-300">Event Setup</h3>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="header-text-input" className="block text-sm font-medium text-slate-400 mb-1">Header Text</label>
          <input
            id="header-text-input"
            type="text"
            value={headerText}
            onChange={(e) => setHeaderText(e.target.value)}
            placeholder="e.g., Company Bingo Night"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Header Text Input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Event Logo</label>
          <div className="flex items-center gap-2">
            <button
              onClick={onUploadClick}
              className="flex-grow flex items-center justify-center w-full px-4 py-2 text-md font-semibold rounded-lg transition-all duration-200 bg-slate-700 text-slate-300 hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
              aria-label="Upload a new logo"
            >
              <ImageUp className="mr-2 h-4 w-4" />
              Upload Logo
            </button>
            {logoUrl && (
              <button
                onClick={() => setLogoUrl('')}
                className="flex-shrink-0 p-2.5 rounded-lg transition-all duration-200 bg-red-900/40 text-red-400 hover:bg-red-900/70 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                aria-label="Remove current logo"
                title="Remove logo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;
