import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw,
  Trash2
} from 'lucide-react';
import { PosterData, ThemeId, LayoutVariant, DecorativeStyle } from '../types/poster';
import { parseMalayEventText } from '../utils/textParser';

interface InputPanelProps {
  data: PosterData;
  onChange: (newData: PosterData) => void;
  isLargeText: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  data,
  onChange,
  isLargeText,
}) => {
  const [rawText, setRawText] = useState(`*JEMPUTAN KULIAH MAGHRIB KHAS MASJID AL-FALAH*
Tarikh: Sabtu, 14 November 2026 (24 Jamadilawal 1448H)
Masa: Selepas Solat Maghrib (Jam 7:45 Malam)
Tempat: Masjid Al-Falah, Seksyen 9, Shah Alam

Penceramah Jemputan:
*Ustaz Dr. Hj. Mohd Fauzi bin Mustaffa*
(Pensyarah Kanan UIA)

Tajuk: Meniti Jalan Taqwa & Ketenangan Hati Dalam Kehidupan

Semua muslimin dan muslimat kariah dijemput hadir bersama keluarga. Jamuan makan malam disediakan selepas solat Isyak.

Sebarang maklumat lanjut hubungi:
Haji Razak (019-2345678)
Biro Dakwah Masjid Al-Falah`);

  const [isLoading, setIsLoading] = useState(false);

  // Auto-sync on mount if data is missing speaker or contact details
  React.useEffect(() => {
    if ((!data.speaker || !data.contactNumber || !data.speakerCredential) && rawText.trim()) {
      const parsed = parseMalayEventText(rawText);
      onChange({
        ...data,
        ...parsed,
        speaker: parsed.speaker || data.speaker,
        speakerTitle: parsed.speakerTitle || data.speakerTitle,
        speakerCredential: parsed.speakerCredential || data.speakerCredential,
        contactNumber: parsed.contactNumber || data.contactNumber,
        decorativeStyle: data.decorativeStyle || parsed.decorativeStyle || 'kubah-menara',
        aspectRatio: '1:1',
        showBismillah: true,
        showHijri: true,
      } as PosterData);
    }
  }, []);

  // Intelligent selection based on raw text using free Gemini 3.8 Flash model
  const handleGenerate = async () => {
    const textToAnalyze = rawText.trim();
    if (!textToAnalyze) return;

    setIsLoading(true);

    // 1. Immediate client-side parse so poster updates with zero lag
    const localParsed = parseMalayEventText(textToAnalyze);
    onChange({
      ...data,
      ...localParsed,
      decorativeStyle: localParsed.decorativeStyle || 'kubah-menara',
      aspectRatio: '1:1',
      showBismillah: true,
      showHijri: true,
    } as PosterData);

    try {
      // 2. Call backend for Gemini 3.8 Flash semantic parsing & design expert structuring
      const response = await fetch('/api/parse-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: textToAnalyze }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        const selectedThemeId = (d.suggestedTheme as ThemeId) || localParsed.suggestedTheme || data.themeId;
        const selectedLayout = (d.suggestedLayout as LayoutVariant) || localParsed.suggestedLayout || data.layoutVariant;
        const selectedDecStyle = (d.decorativeStyle as DecorativeStyle) || localParsed.decorativeStyle || data.decorativeStyle || 'kubah-menara';

        onChange({
          ...data,
          title: d.title || localParsed.title || data.title,
          subCategory: d.subCategory || localParsed.subCategory || data.subCategory,
          speaker: d.speaker || localParsed.speaker || '',
          speakerTitle: d.speakerTitle || localParsed.speakerTitle || 'Penceramah Jemputan',
          speakerCredential: d.speakerCredential || localParsed.speakerCredential || '',
          date: d.date || localParsed.date || data.date,
          hijriDate: d.hijriDate || localParsed.hijriDate || '24 Jamadilawal 1448H',
          time: d.time || localParsed.time || data.time,
          venue: d.venue || localParsed.venue || data.venue,
          organizer: d.organizer || localParsed.organizer || data.organizer,
          contactNumber: d.contactNumber || localParsed.contactNumber || data.contactNumber,
          notes: d.notes || localParsed.notes || data.notes,
          themeId: selectedThemeId,
          layoutVariant: selectedLayout,
          decorativeStyle: selectedDecStyle,
          aspectRatio: '1:1',
          showBismillah: true,
          showHijri: true,
        });
      }
    } catch {
      // Graceful fallback to client-side parse already applied
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setRawText('');
  };

  const inputSizeClass = isLargeText ? 'text-lg p-4' : 'text-base p-3';
  const labelSizeClass = isLargeText ? 'text-lg font-bold' : 'text-base font-bold';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-amber-900/10 space-y-5">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <label className={`text-slate-900 ${labelSizeClass}`}>
          Masukkan Teks Poster / Pengumuman:
        </label>
        {rawText && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 touch-target cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* Textarea */}
      <textarea
        rows={11}
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="Tampal atau taip mesej aktiviti di sini (cth: Kuliah Maghrib bersama Ustaz, Program Ramadan, Gotong-Royong, Kursus Jenazah, atau Infaq Karpet)..."
        className={`w-full rounded-2xl border-2 border-slate-300 focus:border-emerald-600 focus:ring-0 transition-colors bg-slate-50/60 leading-relaxed text-slate-900 font-sans ${inputSizeClass}`}
      />

      {/* Primary Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading || !rawText.trim()}
        className="w-full py-4 px-6 bg-emerald-800 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 touch-target text-lg sm:text-xl cursor-pointer"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Sedang Menjana...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Jana Poster</span>
          </>
        )}
      </button>
    </div>
  );
};
