/**
 * Intelligent text parser for Malaysian Mosque & Community announcements
 */
import { PosterData, ThemeId, LayoutVariant } from '../types/poster';

export function cleanQuotesAndStars(str: string): string {
  return str.replace(/[*_~`]/g, '').trim();
}

export function parseMalayEventText(rawText: string): Partial<PosterData> & {
  suggestedTheme: ThemeId;
  suggestedLayout: LayoutVariant;
} {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const textLower = rawText.toLowerCase();

  let subCategory = 'Kuliah Agama';
  let suggestedTheme: ThemeId = 'zamrud-emas';
  let suggestedLayout: LayoutVariant = 'gerbang-islami';

  // 1. Program Ramadan, Solat Hajat, Nuzul Quran & Qiamullail -> Nilam Malam & Bintang
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
    } else {
      subCategory = 'Solat Hajat';
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
  } 
  // 3. Kursus, Bengkel, Jenazah, Seminar -> Merak Laut & Emas
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
  } 
  // 5. Kuliah Agama, Pengajian Umum, Masjid -> Hijau Zamrud & Emas (Pilihan Utama Masjid)
  else {
    subCategory = 'Kuliah Agama';
    suggestedTheme = 'zamrud-emas';
    suggestedLayout = 'gerbang-islami';
  }

  // Find Speaker and Credentials
  let speaker = '';
  let speakerTitle = 'Penceramah Jemputan';
  let speakerCredential = '';

  // 1. Check for Penceramah header with same-line or next-line name & optional credential in brackets
  const penceramahBlock = rawText.match(/(?:penceramah jemputan|penceramah khas|penceramah|kuliah oleh|disampaikan oleh|bersama|tetamu jemputan)[:\s]*\n*([^\n]+)(?:\n\(([^\n]+)\))?/i);
  if (penceramahBlock && cleanQuotesAndStars(penceramahBlock[1])) {
    speaker = cleanQuotesAndStars(penceramahBlock[1]);
    if (penceramahBlock[2]) {
      speakerCredential = cleanQuotesAndStars(penceramahBlock[2]);
    }
  }

  // 2. If still empty, search all lines after stripping asterisks for Ustaz / Dr / Sheikh etc.
  if (!speaker) {
    for (let i = 0; i < lines.length; i++) {
      const lineClean = cleanQuotesAndStars(lines[i]);
      if (/^(ustaz|ustazah|dr\.|prof\.|tuan guru|sheikh|habib|da'i|imam)/i.test(lineClean)) {
        speaker = lineClean;
        if (lines[i + 1] && /^\([^\)]+\)$/.test(cleanQuotesAndStars(lines[i + 1]))) {
          speakerCredential = cleanQuotesAndStars(lines[i + 1]).replace(/[()]/g, '').trim();
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
    let rawDate = cleanQuotesAndStars(dateMatch[1] || dateMatch[0]);
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
    hijriDate = cleanQuotesAndStars(hijriMatch[1] || hijriMatch[0]);
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
    time = cleanQuotesAndStars(timeMatch[1] || timeMatch[0]);
  } else {
    time = 'Selepas Solat Maghrib (Jam 7:45 Malam)';
  }

  // Find Venue
  let venue = '';
  const venueMatch = rawText.match(/(?:tempat|lokasi)[:\s]*([^\n]+)/i) ||
                     rawText.match(/(masjid[^\n]+|surau[^\n]+|dewan[^\n]+)/i);
  if (venueMatch) {
    venue = cleanQuotesAndStars(venueMatch[1] || venueMatch[0]);
  } else {
    venue = 'Masjid Al-Falah, Seksyen 9, Shah Alam';
  }

  // Find Contact (Look for phone numbers + name)
  let contactNumber = '';
  const phoneLine = lines.find(l => /01\d{1}[-\s]?\d{7,8}/.test(l));
  if (phoneLine) {
    contactNumber = cleanQuotesAndStars(phoneLine).replace(/^(hubungi|maklumat lanjut|pertanyaan|no\. tel|whatsapp)[:\s]*/i, '').trim();
  } else {
    contactNumber = 'Haji Razak (019-2345678)';
  }

  // Find Notes / Jamuan
  let notes = '';
  const notesMatch = rawText.match(/(?:jamuan[^\n]+|semua[^\n]+dijemput[^\n]+|muslimin[^\n]+dijemput[^\n]+)/i);
  if (notesMatch) {
    notes = cleanQuotesAndStars(notesMatch[0]);
  } else {
    const nLine = lines.find(l => /jamuan|makan malam|sarapan|dijemput|terbuka kepada/i.test(l));
    if (nLine) notes = cleanQuotesAndStars(nLine);
    else notes = 'Jamuan makan malam disediakan selepas solat Isyak. Semua dijemput hadir.';
  }

  // Find Organizer
  let organizer = '';
  const orgLine = lines.find(l => /biro dakwah|biro|jawatankuasa|kariah masjid|pengurusan masjid/i.test(l) && !/hubungi/i.test(l) && !/01\d/.test(l));
  if (orgLine) {
    organizer = cleanQuotesAndStars(orgLine).replace(/^(anjuran|anjurkan oleh)[:\s]*/i, '').trim();
  } else {
    organizer = 'Biro Dakwah & Kariah Masjid Al-Falah';
  }

  // Find Title (Tajuk / Kuliah)
  let title = '';
  const titleMatch = rawText.match(/(?:tajuk|program|majlis|acara)[:\s]*([^\n]+)/i);
  if (titleMatch) {
    title = cleanQuotesAndStars(titleMatch[1]);
  } else {
    const validLines = lines.filter(l => !/^(assalam|bismillah|bismillahi|alhamdulillah|peringatan|jemputan)/i.test(l));
    title = cleanQuotesAndStars(validLines[0] || lines[0] || 'Meniti Jalan Taqwa & Ketenangan Hati Dalam Kehidupan');
  }

  return {
    title: title.slice(0, 80),
    subCategory,
    speaker: speaker.slice(0, 70),
    speakerTitle,
    speakerCredential: speakerCredential.slice(0, 60),
    date: date.slice(0, 50),
    hijriDate: hijriDate.slice(0, 50),
    time: time.slice(0, 50),
    venue: venue.slice(0, 90),
    organizer: organizer.slice(0, 90),
    contactNumber: contactNumber.slice(0, 60),
    notes: notes.slice(0, 140),
    suggestedTheme,
    suggestedLayout,
  };
}
