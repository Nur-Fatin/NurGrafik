import React from 'react';
import { Type } from 'lucide-react';

interface HeaderProps {
  isLargeText: boolean;
  onToggleLargeText: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLargeText,
  onToggleLargeText,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-amber-900/10 px-4 sm:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-400 flex items-center justify-center font-bold text-xl shadow-md border border-amber-400/30">
            ن
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-emerald-950 font-sans">
                NurGrafik
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-900 border border-amber-200">
                Edisi Masjid & Komuniti
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
              Penjana Poster WhatsApp Pantas & Bersih
            </p>
          </div>
        </div>

        {/* Accessibility & Options */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleLargeText}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border touch-target ${
              isLargeText
                ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Togol Saiz Tulisan Besar untuk Warga Emas"
            aria-pressed={isLargeText}
          >
            <Type className="w-4 h-4 text-emerald-700" />
            <span>{isLargeText ? 'Tulisan: Besar' : 'Tulisan: Biasa'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
