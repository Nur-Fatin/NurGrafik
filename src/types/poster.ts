export type AspectRatio = '1:1';

export type ThemeId = 'zamrud-emas' | 'nilam-malam' | 'hijau-harmoni' | 'merak-anggun' | 'fajar-lembut';

export type LayoutVariant = 'gerbang-islami' | 'moden-bersih' | 'sepanduk-elegan';

export type DecorativeStyle = 'kubah-menara' | 'mihrab-lentera' | 'arabesque-bintang' | 'bulan-bintang' | 'moden';

export interface PosterData {
  title: string;
  subCategory: string;
  speaker: string;
  speakerTitle: string;
  speakerCredential?: string;
  date: string;
  hijriDate: string;
  time: string;
  venue: string;
  organizer: string;
  contactNumber: string;
  notes: string;
  themeId: ThemeId;
  layoutVariant: LayoutVariant;
  decorativeStyle?: DecorativeStyle;
  tagline?: string;
  aspectRatio: AspectRatio;
  showBismillah: boolean;
  showHijri: boolean;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  bgGradient: [string, string, string]; // Top, Mid, Bottom
  cardBg: string;
  cardBorder: string;
  primaryText: string;
  secondaryText: string;
  accentGold: string;
  badgeBg: string;
  badgeText: string;
  starColor: string;
  glowColor: string;
  bannerBg: string;
}
