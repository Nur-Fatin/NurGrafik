import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Heuristic fallback parser for Malay event text
function heuristicParseEvent(rawText: string) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const textLower = rawText.toLowerCase();

  let subCategory = 'Kuliah Agama';
  let suggestedTheme: 'zamrud-emas' | 'nilam-malam' | 'hijau-harmoni' | 'merak-anggun' | 'fajar-lembut' = 'zamrud-emas';
  let suggestedLayout: 'gerbang-islami' | 'moden-bersih' | 'sepanduk-elegan' = 'gerbang-islami';
  let decorativeStyle: 'kubah-menara' | 'mihrab-lentera' | 'arabesque-bintang' | 'bulan-bintang' | 'moden' = 'kubah-menara';

  // Intelligent Theme, Layout & Islamic Decorative Style Selection
  // 1. Program Ramadan, Solat Hajat, Nuzul Quran & Qiamullail -> Nilam Malam & Bulan Bintang
  if (
    textLower.includes('ramadan') || 
    textLower.includes('iftar') || 
    textLower.includes('berbuka') || 
    textLower.includes('tarawih') || 
    textLower.includes('nuzul') || 
    textLower.includes('solat hajat') || 
    textLower.includes('tahajjud') || 
    textLower.includes('qiamullail')
  ) {
    if (textLower.includes('ramadan') || textLower.includes('iftar') || textLower.includes('berbuka') || textLower.includes('tarawih') || textLower.includes('nuzul')) {
      subCategory = 'Program Ramadan';
      decorativeStyle = 'bulan-bintang';
    } else {
      subCategory = 'Solat Hajat';
      decorativeStyle = 'mihrab-lentera';
    }
    suggestedTheme = 'nilam-malam';
    suggestedLayout = 'gerbang-islami';
  } 
  // 2. Gotong-Royong, Kebersihan, Riadah -> Hijau Daun Harmoni
  else if (
    textLower.includes('gotong') || 
    textLower.includes('kebersihan') || 
    textLower.includes('riadah') || 
    textLower.includes('sukan') || 
    textLower.includes('alam sekitar')
  ) {
    subCategory = 'Gotong-Royong';
    suggestedTheme = 'hijau-harmoni';
    suggestedLayout = 'moden-bersih';
    decorativeStyle = 'moden';
  } 
  // 3. Kursus, Bengkel, Jenazah, Seminar -> Merak Laut & Emas & Arabesque
  else if (
    textLower.includes('kursus') || 
    textLower.includes('bengkel') || 
    textLower.includes('seminar') || 
    textLower.includes('jenazah') || 
    textLower.includes('fardhu')
  ) {
    subCategory = 'Kursus & Bengkel';
    suggestedTheme = 'merak-anggun';
    suggestedLayout = 'moden-bersih';
    decorativeStyle = 'arabesque-bintang';
  } 
  // 4. Infaq, Wakaf, Derma, Sumbangan -> Krim Hangat & Ambar Di-Raja
  else if (
    textLower.includes('infaq') || 
    textLower.includes('wakaf') || 
    textLower.includes('derma') || 
    textLower.includes('kutipan') || 
    textLower.includes('sumbangan') || 
    textLower.includes('sedekah')
  ) {
    subCategory = 'Infaq & Wakaf';
    suggestedTheme = 'fajar-lembut';
    suggestedLayout = 'sepanduk-elegan';
    decorativeStyle = 'mihrab-lentera';
  } 
  // 5. Kuliah Agama, Pengajian Umum, Masjid -> Hijau Zamrud & Emas (Pilihan Utama Masjid)
  else {
    subCategory = 'Kuliah Agama';
    suggestedTheme = 'zamrud-emas';
    suggestedLayout = 'gerbang-islami';
    decorativeStyle = 'kubah-menara';
  }

  // Clean quotes/asterisks from WhatsApp copy
  const clean = (s: string) => s.replace(/[*_~`]/g, '').trim();

  // Find Speaker and Credentials
  let speaker = '';
  let speakerTitle = 'Penceramah Jemputan';
  let speakerCredential = '';

  // 1. Check for Penceramah header with same-line or next-line name & optional credential in brackets
  const penceramahBlock = rawText.match(/(?:penceramah jemputan|penceramah khas|penceramah|kuliah oleh|disampaikan oleh|bersama|tetamu jemputan)[:\s]*\n*([^\n]+)(?:\n\(([^\n]+)\))?/i);
  if (penceramahBlock && clean(penceramahBlock[1])) {
    speaker = clean(penceramahBlock[1]);
    if (penceramahBlock[2]) {
      speakerCredential = clean(penceramahBlock[2]);
    }
  }

  // 2. If still empty, search all lines after stripping asterisks for Ustaz / Dr / Sheikh etc.
  if (!speaker) {
    for (let i = 0; i < lines.length; i++) {
      const lineClean = clean(lines[i]);
      if (/^(ustaz|ustazah|dr\.|prof\.|tuan guru|sheikh|habib|da'i|imam)/i.test(lineClean)) {
        speaker = lineClean;
        if (lines[i + 1] && /^\([^\)]+\)$/.test(clean(lines[i + 1]))) {
          speakerCredential = clean(lines[i + 1]).replace(/[()]/g, '').trim();
        }
        break;
      }
    }
  }

  // If speaker contains credential in brackets like "Ustaz XYZ (Pensyarah)", separate it
  const inlineCredMatch = speaker.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (inlineCredMatch) {
    speaker = inlineCredMatch[1].trim();
    if (!speakerCredential) {
      speakerCredential = inlineCredMatch[2].trim();
    }
  }

  // Find Date
  let date = '';
  const dateMatch = rawText.match(/(?:tarikh|hari\/tarikh|hari)[:\s]*([^\n]+)/i) ||
                    rawText.match(/(\d{1,2}\s+(?:januari|februari|mac|april|mei|jun|julai|ogos|september|oktober|november|disember|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4})/i) ||
                    rawText.match(/(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/);
  if (dateMatch) {
    let rawDate = clean(dateMatch[1] || dateMatch[0]);
    rawDate = rawDate.replace(/\([^\)]*jamadil[^\)]*\)/i, '').replace(/\([^\)]*h\)/i, '').trim();
    date = rawDate;
  } else {
    date = 'Sabtu, 14 November 2026';
  }

  // Find Hijri Date
  let hijriDate = '';
  const hijriMatch = rawText.match(/(\d{1,2}\s+(?:muharram|safar|rabiulawal|rabiulakhir|jamadilawal|jamadilakhir|rejab|syaaban|ramadan|syawal|zulkaedah|zulhijjah|jamadil\s*\w+)\s+\d{4}H?)/i) ||
                     rawText.match(/(\d{1,2}\s*H)/i);
  if (hijriMatch) {
    hijriDate = clean(hijriMatch[1] || hijriMatch[0]);
    if (!hijriDate.endsWith('H')) hijriDate += 'H';
  } else {
    hijriDate = '24 Jamadilawal 1448H';
  }

  // Find Time (Avoid matching 'jam' inside 'jamadilawal')
  let time = '';
  const timeMatch = rawText.match(/(?:masa|waktu|\bjam\b(?!adil))[:\s]*([^\n]+)/i) ||
                    rawText.match(/(selepas solat\s+[^\n,]+(?:\([^\)]+\))?)/i) ||
                    rawText.match(/(\b\d{1,2}(?::\d{2})?\s*(?:pagi|petang|malam|am|pm)\b)/i);
  if (timeMatch) {
    time = clean(timeMatch[1] || timeMatch[0]);
  } else {
    time = 'Selepas Solat Maghrib (Jam 7:45 Malam)';
  }

  // Find Venue
  let venue = '';
  const venueMatch = rawText.match(/(?:tempat|lokasi)[:\s]*([^\n]+)/i) ||
                     rawText.match(/(masjid[^\n]+|surau[^\n]+|dewan[^\n]+)/i);
  if (venueMatch) {
    venue = clean(venueMatch[1] || venueMatch[0]);
  } else {
    venue = 'Masjid Al-Falah, Seksyen 9, Shah Alam';
  }

  // Find Contact (Look for phone numbers + name)
  let contactNumber = '';
  const phoneLine = lines.find(l => /01\d{1}[-\s]?\d{7,8}/.test(l));
  if (phoneLine) {
    contactNumber = clean(phoneLine).replace(/^(hubungi|maklumat lanjut|pertanyaan|no\. tel|whatsapp)[:\s]*/i, '').trim();
  } else {
    contactNumber = 'Haji Razak (019-2345678)';
  }

  // Find Notes / Jamuan
  let notes = '';
  const notesMatch = rawText.match(/(?:jamuan[^\n]+|semua[^\n]+dijemput[^\n]+|muslimin[^\n]+dijemput[^\n]+)/i);
  if (notesMatch) {
    notes = clean(notesMatch[0]);
  } else {
    const nLine = lines.find(l => /jamuan|makan malam|sarapan|dijemput|terbuka kepada/i.test(l));
    if (nLine) notes = clean(nLine);
    else notes = 'Jamuan makan malam disediakan selepas solat Isyak. Semua dijemput hadir.';
  }

  // Find Organizer
  let organizer = '';
  const orgLine = lines.find(l => /biro dakwah|biro|jawatankuasa|kariah masjid|pengurusan masjid/i.test(l) && !/hubungi/i.test(l) && !/01\d/.test(l));
  if (orgLine) {
    organizer = clean(orgLine).replace(/^(anjuran|anjurkan oleh)[:\s]*/i, '').trim();
  } else {
    organizer = 'Biro Dakwah Masjid Al-Falah';
  }

  // Find Title
  let title = '';
  const titleMatch = rawText.match(/(?:tajuk|program|majlis|acara)[:\s]*([^\n]+)/i);
  if (titleMatch) {
    title = clean(titleMatch[1]);
  } else {
    const validLines = lines.filter(l => !/^(assalam|bismillah|bismillahi|alhamdulillah|peringatan|jemputan)/i.test(l));
    title = clean(validLines[0] || lines[0] || 'Meniti Jalan Taqwa & Ketenangan Hati Dalam Kehidupan');
  }

  return {
    title: clean(title).slice(0, 80),
    subCategory,
    speaker: clean(speaker).slice(0, 70),
    speakerTitle: clean(speakerTitle).slice(0, 60),
    speakerCredential: clean(speakerCredential).slice(0, 60),
    date: clean(date).slice(0, 50),
    hijriDate: clean(hijriDate).slice(0, 50),
    time: clean(time).slice(0, 50),
    venue: clean(venue).slice(0, 90),
    organizer: clean(organizer).slice(0, 90),
    contactNumber: clean(contactNumber).slice(0, 60),
    notes: clean(notes).slice(0, 140),
    suggestedTheme,
    suggestedLayout,
    decorativeStyle,
  };
}

// API endpoint for parsing event text using Gemini 3.8 Flash (Free model) or heuristic fallback
app.post('/api/parse-event', async (req: Request, res: Response) => {
  const { rawText } = req.body;

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({ error: 'Sila masukkan teks aktiviti atau pengumuman.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Return heuristic parsing immediately
    const parsed = heuristicParseEvent(rawText);
    return res.json({ success: true, data: parsed, source: 'heuristic' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `Anda ialah Pakar Kanan Reka Bentuk Grafik Masjid & Komuniti di Nusantara (Malaysia, Brunei, Singapura, Indonesia).
Kepakaran utama anda ialah menganalisis pengumuman aktiviti kariah WhatsApp dan menstrukturkan poster grafik 1:1 (1080x1080) yang berimpak tinggi, berkontras optimum untuk jemaah warga emas (60-80 tahun), kemas, tiada ruang terbazir, serta sarat dengan seni reka visual Islamik yang memikat hati.

Prinsip Reka Bentuk Utama:
1. Kejelasan Optimum & Kontras Tinggi: Nama penceramah, tajuk, tarikh, masa, tempat, dan nombor WhatsApp mestilah terang dan mudah dibaca tanpa silau.
2. Tiada Maklumat Tercicir: Ekstrak nama penceramah penuh berserta gelaran dan kelayakan akademik/institusi dalam kurungan jika ada.
3. Tarikh Hijrah Wajib: Pastikan sentiasa ada tarikh hijrah yang bersesuaian (cth: "24 Jamadilawal 1448H").
4. Padanan Tema Warna:
   - 'zamrud-emas': Kuliah pengajian umum, kuliah subuh/maghrib, majlis ilmu (Hijau zamrud baldu + emas)
   - 'nilam-malam': Program Ramadan, Solat Hajat, Nuzul Quran, Qiamullail (Biru nilam pekat + bintang emas)
   - 'hijau-harmoni': Gotong-royong, riadah kariah, kebersihan alam sekitar (Hijau daun segar + putih bersih)
   - 'merak-anggun': Kursus pengurusan jenazah, fardhu ain, bengkel belia, motivasi keluarga (Biru merak laut + ambar)
   - 'fajar-lembut': Infaq, wakaf, derma tabung masjid, bantuan prihatin (Krim gading + emas coklat)
5. Padanan Gaya Seni Latar Visual Islamik:
   - 'kubah-menara': Kubah masjid dan menara diiringi cahaya lembut emas (Sesuai untuk kuliah agama rasmi)
   - 'mihrab-lentera': Gerbang mihrab dan lampu pelita/lentera fanous (Sesuai untuk solat hajat, doa selamat, infaq)
   - 'bulan-bintang': Bulan sabit berseri dan buruj bintang (Sesuai untuk program Ramadan, Nuzul Quran, iftar)
   - 'arabesque-bintang': Corak geometri arabesque Rub El Hizb 8 penjuru (Sesuai untuk kursus, bengkel, seminar)
   - 'moden': Garisan geometri bersih dan sudut anggun (Sesuai untuk gotong-royong, riadah, belia)
6. Padanan Susun Atur:
   - 'gerbang-islami': Gerbang Kubah Klasik
   - 'moden-bersih': Moden Bersih
   - 'sepanduk-elegan': Sepanduk Di-Raja`;

    const prompt = `Analisis teks pengumuman/WhatsApp berikut dan hasilkan spesifikasi reka bentuk poster grafik rasmi dalam format JSON:
{
  "title": "Tajuk utama acara yang padat, jelas dan berwibawa (cth: Meniti Jalan Taqwa & Ketenangan Hati Dalam Kehidupan)",
  "subCategory": "Kuliah Agama | Gotong-Royong | Program Ramadan | Solat Hajat | Infaq & Wakaf | Kursus & Bengkel | Aktiviti Komuniti",
  "speaker": "Nama penceramah/tokoh jemputan bersama gelaran penuh (cth: Ustaz Dr. Hj. Mohd Fauzi bin Mustaffa)",
  "speakerTitle": "Gelaran peranan (cth: Penceramah Jemputan / Tetamu Khas / Imam Bertugas)",
  "speakerCredential": "Kelayakan, jawatan atau institusi (cth: Pensyarah Kanan UIA)",
  "date": "Tarikh hari dan masihi (cth: Sabtu, 14 November 2026)",
  "hijriDate": "Tarikh hijrah (cth: 24 Jamadilawal 1448H)",
  "time": "Masa berlangsung (cth: Selepas Solat Maghrib (Jam 7:45 Malam))",
  "venue": "Nama masjid/surau/lokasi (cth: Masjid Al-Falah, Seksyen 9, Shah Alam)",
  "organizer": "Pihak penganjur (cth: Biro Dakwah Masjid Al-Falah)",
  "contactNumber": "Nama pegawai dan nombor telefon untuk dihubungi (cth: Haji Razak (019-2345678))",
  "notes": "Pesanan atau jemputan ringkas (cth: Jamuan makan malam disediakan selepas solat Isyak. Semua dijemput hadir.)",
  "suggestedTheme": "zamrud-emas | nilam-malam | hijau-harmoni | merak-anggun | fajar-lembut",
  "suggestedLayout": "gerbang-islami | moden-bersih | sepanduk-elegan",
  "decorativeStyle": "kubah-menara | mihrab-lentera | arabesque-bintang | bulan-bintang | moden"
}

Teks pengumuman pengguna:
"""
${rawText}
"""`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    // 6-second timeout race: fallback to heuristic immediately if network latency occurs
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = response.text || '{}';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    // Complement with heuristic parser if any important field is missing
    const heuristic = heuristicParseEvent(rawText);

    return res.json({
      success: true,
      data: {
        title: parsedData.title || heuristic.title || 'Majlis Kuliah & Aktiviti Kariah',
        subCategory: parsedData.subCategory || heuristic.subCategory || 'Kuliah Agama',
        speaker: parsedData.speaker || heuristic.speaker || '',
        speakerTitle: parsedData.speakerTitle || heuristic.speakerTitle || 'Penceramah Jemputan',
        speakerCredential: parsedData.speakerCredential || heuristic.speakerCredential || '',
        date: parsedData.date || heuristic.date || 'Sabtu, 14 November 2026',
        hijriDate: parsedData.hijriDate || heuristic.hijriDate || '24 Jamadilawal 1448H',
        time: parsedData.time || heuristic.time || 'Selepas Solat Maghrib (Jam 7:45 Malam)',
        venue: parsedData.venue || heuristic.venue || 'Masjid Al-Falah, Seksyen 9, Shah Alam',
        organizer: parsedData.organizer || heuristic.organizer || 'Biro Dakwah Masjid Al-Falah',
        contactNumber: parsedData.contactNumber || heuristic.contactNumber || '',
        notes: parsedData.notes || heuristic.notes || 'Semua muslimin dan muslimat dijemput hadir.',
        suggestedTheme: parsedData.suggestedTheme || heuristic.suggestedTheme || 'zamrud-emas',
        suggestedLayout: parsedData.suggestedLayout || heuristic.suggestedLayout || 'gerbang-islami',
        decorativeStyle: parsedData.decorativeStyle || heuristic.decorativeStyle || 'kubah-menara',
      },
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Error invoking Gemini model in /api/parse-event:', error?.message || error);
    // Graceful fallback to heuristic
    const fallback = heuristicParseEvent(rawText);
    return res.json({ success: true, data: fallback, source: 'heuristic-fallback' });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite or Static file serving setup
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NurGrafik Server] Running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('[NurGrafik Server Error]', err);
});
