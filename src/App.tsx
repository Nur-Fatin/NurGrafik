/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { PosterPreview } from './components/PosterPreview';
import { PosterData } from './types/poster';
import { SAMPLE_PRESETS } from './utils/themePresets';

export default function App() {
  // Load saved draft or initial preset
  const [posterData, setPosterData] = useState<PosterData>(() => {
    try {
      const saved = localStorage.getItem('nurgrafik_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaultData = SAMPLE_PRESETS[0].data;
        return {
          ...defaultData,
          ...parsed,
          speaker: (parsed.speaker && parsed.speaker.trim()) || defaultData.speaker,
          speakerTitle: parsed.speakerTitle || defaultData.speakerTitle,
          speakerCredential: parsed.speakerCredential || defaultData.speakerCredential,
          contactNumber: (parsed.contactNumber && parsed.contactNumber.trim()) || defaultData.contactNumber,
          decorativeStyle: parsed.decorativeStyle || defaultData.decorativeStyle || 'kubah-menara',
          aspectRatio: '1:1',
          showBismillah: true,
          showHijri: true,
        };
      }
    } catch {
      // Fallback
    }
    return SAMPLE_PRESETS[0].data;
  });

  const [isLargeText, setIsLargeText] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nurgrafik_large_text');
      return saved !== null ? saved === 'true' : true; // Default large text for seniors
    } catch {
      return true;
    }
  });

  // Auto-save draft
  useEffect(() => {
    try {
      localStorage.setItem('nurgrafik_draft', JSON.stringify(posterData));
    } catch {
      // Ignore
    }
  }, [posterData]);

  const handleToggleLargeText = () => {
    setIsLargeText((prev) => {
      const next = !prev;
      localStorage.setItem('nurgrafik_large_text', String(next));
      return next;
    });
  };

  return (
    <div className={`min-h-screen bg-[#FAF7F2] text-slate-900 flex flex-col ${isLargeText ? 'senior-text-lg' : ''}`}>
      {/* Top Bar Header */}
      <Header
        isLargeText={isLargeText}
        onToggleLargeText={handleToggleLargeText}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Direct Text Input & Theme Selection */}
          <div className="lg:col-span-7 space-y-6">
            <InputPanel
              data={posterData}
              onChange={setPosterData}
              isLargeText={isLargeText}
            />
          </div>

          {/* Right Column: Sticky Poster Preview & WhatsApp One-Tap Export */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <PosterPreview
              data={posterData}
              isLargeText={isLargeText}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-900/10 py-6 px-4 bg-white/50 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <span>
            NurGrafik &copy; {new Date().getFullYear()} &middot; Dihasilkan khusus untuk kemudahan biro penerangan masjid, surau, dan kariah komuniti.
          </span>
        </div>
      </footer>
    </div>
  );
}
