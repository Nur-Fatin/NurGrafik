import React, { useEffect, useRef, useState } from 'react';
import { 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Eye, 
  MessageSquare
} from 'lucide-react';
import { PosterData } from '../types/poster';
import { 
  renderPosterToCanvas, 
  downloadCanvasAsPng, 
  copyCanvasToClipboard, 
  getCanvasBlob,
  formatWhatsAppSummaryText 
} from '../utils/canvasRenderer';

interface PosterPreviewProps {
  data: PosterData;
  isLargeText: boolean;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({
  data,
  isLargeText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isTextCopied, setIsTextCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Re-render poster whenever data changes and when web fonts finish loading
  useEffect(() => {
    let isMounted = true;
    if (canvasRef.current) {
      renderPosterToCanvas(canvasRef.current, data);
    }

    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (isMounted && canvasRef.current) {
          renderPosterToCanvas(canvasRef.current, data);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [data]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const cleanTitle = data.title.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_').slice(0, 30) || 'Poster';
    const filename = `NurGrafik_${cleanTitle}_1080x1080.png`;
    downloadCanvasAsPng(canvasRef.current, filename);
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    const success = await copyCanvasToClipboard(canvasRef.current);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } else {
      handleDownload();
      setShareFeedback('Imej dimuat turun kerana pelayar tidak menyokong salin terus.');
      setTimeout(() => setShareFeedback(null), 3500);
    }
  };

  const handleCopyText = async () => {
    const text = formatWhatsAppSummaryText(data);
    await navigator.clipboard.writeText(text);
    setIsTextCopied(true);
    setTimeout(() => setIsTextCopied(false), 2500);
  };

  // Direct WhatsApp Share (Mobile Web Share API with File + WhatsApp link fallback)
  const handleShareToWhatsApp = async () => {
    if (!canvasRef.current) return;
    setIsSharing(true);
    setShareFeedback(null);

    const summaryText = formatWhatsAppSummaryText(data);

    try {
      const blob = await getCanvasBlob(canvasRef.current);
      if (blob && navigator.canShare) {
        const file = new File(
          [blob],
          `NurGrafik_1080x1080.png`,
          { type: 'image/png' }
        );

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: data.title,
            text: summaryText,
          });
          setShareFeedback('Berjaya dihantar ke WhatsApp!');
          setTimeout(() => setShareFeedback(null), 3000);
          setIsSharing(false);
          return;
        }
      }

      // If file share not supported (e.g. desktop), trigger PNG download and open WhatsApp
      handleDownload();
      const encodedText = encodeURIComponent(summaryText);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
      window.open(whatsappUrl, '_blank');
      setShareFeedback('Teks & pautan dibuka di WhatsApp. Fail PNG turut dimuat turun.');
      setTimeout(() => setShareFeedback(null), 4000);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handleDownload();
        const encodedText = encodeURIComponent(summaryText);
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-amber-900/10 space-y-5">
      {/* Interactive Poster Preview Canvas */}
      <div className="relative rounded-2xl bg-slate-900/5 p-3 sm:p-4 border border-slate-200 flex flex-col items-center justify-center min-h-[380px] overflow-hidden">
        {/* Toggle WhatsApp Simulator Badge */}
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold shadow-xs border border-slate-300 transition-all flex items-center gap-1.5 active:scale-95 touch-target"
          title="Lihat simulasi dalam chat WhatsApp"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-700" />
          <span>{showSimulator ? 'Tutup Simulasi' : 'Pratonton WhatsApp'}</span>
        </button>

        {/* Simulator Frame Overlay */}
        {showSimulator ? (
          <div className="w-full max-w-sm rounded-3xl bg-[#0b141a] p-3 shadow-2xl border-4 border-slate-800 text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                💬 Kumpulan Kariah Masjid
              </span>
              <span className="text-[10px] text-slate-400">10:45 AM</span>
            </div>
            <div className="bg-[#1f2c34] rounded-2xl p-2.5 shadow-md">
              <canvas
                ref={canvasRef}
                className="w-full aspect-square rounded-xl shadow-xs object-contain"
                style={{ maxHeight: '300px' }}
              />
              <div className="mt-2 text-right">
                <span className="text-[10px] text-slate-400">10:45 AM ✓✓</span>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 text-center">
              *Poster dipaparkan penuh tanpa potongan dalam chat WhatsApp.
            </p>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-xl shadow-lg border border-slate-300 object-contain w-auto aspect-square transition-all"
              style={{
                maxHeight: '440px',
                maxWidth: '100%',
              }}
            />
          </div>
        )}
      </div>

      {/* Share Feedback Toast */}
      {shareFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* Export & Share Buttons */}
      <div className="space-y-2.5">
        {/* Primary Giant WhatsApp Button */}
        <button
          onClick={handleShareToWhatsApp}
          disabled={isSharing}
          className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 touch-target text-lg sm:text-xl cursor-pointer"
        >
          <Share2 className="w-6 h-6 shrink-0" />
          <span>{isSharing ? 'Menghantar ke WhatsApp...' : 'Kongsi ke WhatsApp (1 Ketik)'}</span>
        </button>

        {/* Secondary Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Download PNG */}
          <button
            onClick={handleDownload}
            className="py-3 px-3 bg-emerald-900 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs touch-target"
          >
            <Download className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Muat Turun PNG</span>
          </button>

          {/* Copy Image */}
          <button
            onClick={handleCopyImage}
            className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-slate-200 touch-target"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Salin Imej</span>
              </>
            )}
          </button>

          {/* Copy WhatsApp Text */}
          <button
            onClick={handleCopyText}
            className="py-3 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-amber-200 touch-target"
          >
            {isTextCopied ? (
              <>
                <Check className="w-4 h-4 text-amber-700" />
                <span>Teks Tersalin!</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 text-amber-700" />
                <span>Salin Info Teks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
