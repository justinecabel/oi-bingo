
import React from 'react';
import { Settings, ImageUp, Trash2, X } from 'lucide-react';

interface EventSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
  setHeaderText: (text: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  onUploadClick: () => void;
}

const EventSetupModal: React.FC<EventSetupModalProps> = ({
  isOpen,
  onClose,
  headerText,
  setHeaderText,
  logoUrl,
  setLogoUrl,
  onUploadClick,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-fast"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-md m-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Close event setup"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 mr-3 text-purple-400" />
          <h3 className="text-2xl font-bold text-slate-100">Event Setup</h3>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="header-text-input" className="block text-sm font-medium text-slate-400 mb-2">Header Text</label>
            <input
              id="header-text-input"
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="e.g., Company Bingo Night"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Header Text Input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Event Logo</label>
            <div className="flex items-center gap-2">
              <button
                onClick={onUploadClick}
                className="flex-grow flex items-center justify-center w-full px-4 py-2 text-md font-semibold rounded-lg transition-all duration-200 bg-slate-700 text-slate-300 hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
                aria-label="Upload a new logo"
              >
                <ImageUp className="mr-2 h-5 w-5" />
                Upload Logo
              </button>
              {logoUrl && (
                <button
                  onClick={() => setLogoUrl('')}
                  className="flex-shrink-0 p-2.5 rounded-lg transition-all duration-200 bg-red-900/40 text-red-400 hover:bg-red-900/70 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                  aria-label="Remove current logo"
                  title="Remove logo"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EventSetupModal;
