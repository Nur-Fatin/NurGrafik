import { PosterData } from '../types/poster';
import { THEME_CONFIGS } from './themePresets';

// Draw 8-pointed Islamic Star (Rub El Hizb / Khatam)
function drawIslamicStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.75;

  const points = 8;
  const outerRadius = size;
  const innerRadius = size * 0.55;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Draw Crescent Moon
function drawCrescentMoon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  glowColor: string
) {
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 16;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI * 0.35, Math.PI * 0.9, false);
  ctx.bezierCurveTo(cx - radius * 0.1, cy + radius * 0.5, cx + radius * 0.35, cy - radius * 0.2, cx, cy - radius);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Draw Hanging Islamic Lantern (Fanous)
function drawHangingLantern(
  ctx: CanvasRenderingContext2D,
  x: number,
  chainLength: number,
  scale: number,
  theme: any
) {
  ctx.save();
  // Chain
  ctx.strokeStyle = theme.accentGold;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, 32);
  ctx.lineTo(x, 32 + chainLength);
  ctx.stroke();

  const cy = 32 + chainLength;

  // Lantern Cap
  ctx.fillStyle = theme.accentGold;
  ctx.beginPath();
  ctx.moveTo(x - 14 * scale, cy);
  ctx.lineTo(x + 14 * scale, cy);
  ctx.lineTo(x, cy - 12 * scale);
  ctx.closePath();
  ctx.fill();

  // Glass Body
  ctx.fillStyle = 'rgba(255, 235, 175, 0.38)';
  ctx.strokeStyle = theme.accentGold;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - 14 * scale, cy);
  ctx.lineTo(x - 20 * scale, cy + 22 * scale);
  ctx.lineTo(x - 10 * scale, cy + 44 * scale);
  ctx.lineTo(x + 10 * scale, cy + 44 * scale);
  ctx.lineTo(x + 20 * scale, cy + 22 * scale);
  ctx.lineTo(x + 14 * scale, cy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Candlelight Glow
  const glow = ctx.createRadialGradient(x, cy + 22 * scale, 2, x, cy + 22 * scale, 34 * scale);
  glow.addColorStop(0, '#FFFBEB');
  glow.addColorStop(0.35, 'rgba(251, 191, 36, 0.7)');
  glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, cy + 22 * scale, 34 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Base finial & pendant drop
  ctx.fillStyle = theme.accentGold;
  ctx.beginPath();
  ctx.arc(x, cy + 48 * scale, 4 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Draw Grand Dome & Twin Minarets Silhouette
function drawDomeAndMinaretsSilhouette(ctx: CanvasRenderingContext2D, width: number, theme: any) {
  ctx.save();
  const domeColor = theme.cardBorder;
  const accentGold = theme.accentGold;

  // Central Dome Arch & Apex
  ctx.strokeStyle = domeColor;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  const domeW = 340;
  const domeLeft = (width - domeW) / 2;
  const domeRight = domeLeft + domeW;
  const baseLine = 190;

  ctx.moveTo(domeLeft, baseLine);
  ctx.bezierCurveTo(domeLeft + 20, baseLine - 95, width / 2 - 80, 52, width / 2, 44);
  ctx.bezierCurveTo(width / 2 + 80, 52, domeRight - 20, baseLine - 95, domeRight, baseLine);
  ctx.stroke();
  ctx.fill();

  // Crescent on top of Dome
  drawCrescentMoon(ctx, width / 2, 28, 12, accentGold, theme.glowColor);

  // Left Minaret
  drawMinaret(ctx, 110, baseLine, accentGold);
  // Right Minaret
  drawMinaret(ctx, width - 110, baseLine, accentGold);

  ctx.restore();
}

function drawMinaret(ctx: CanvasRenderingContext2D, x: number, baseY: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';

  // Shaft
  ctx.beginPath();
  ctx.moveTo(x - 12, baseY);
  ctx.lineTo(x - 9, 86);
  ctx.lineTo(x + 9, 86);
  ctx.lineTo(x + 12, baseY);
  ctx.closePath();
  ctx.stroke();

  // Balcony
  ctx.beginPath();
  ctx.rect(x - 16, 80, 32, 6);
  ctx.stroke();
  ctx.fill();

  // Spire & Domelet
  ctx.beginPath();
  ctx.moveTo(x - 8, 80);
  ctx.quadraticCurveTo(x, 50, x, 45);
  ctx.quadraticCurveTo(x, 50, x + 8, 80);
  ctx.closePath();
  ctx.stroke();

  // Crescent finial
  ctx.beginPath();
  ctx.arc(x, 38, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// Draw repeated subtle Islamic geometric background grid
function drawArabesquePattern(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  ctx.save();
  const stepX = 120;
  const stepY = 120;
  for (let x = 60; x < width; x += stepX) {
    for (let y = 60; y < height; y += stepY) {
      drawIslamicStar(ctx, x, y, 15, color);
    }
  }
  ctx.restore();
}

// Draw Celestial Crescent & Starfield
function drawCrescentAndStarfield(ctx: CanvasRenderingContext2D, width: number, theme: any) {
  ctx.save();
  // Crescent in the upper right
  drawCrescentMoon(ctx, width - 130, 95, 28, theme.accentGold, theme.glowColor);
  drawIslamicStar(ctx, width - 90, 80, 10, theme.accentGold);

  // Gentle twinkling stars across the upper sky
  const starCoords = [
    [120, 85, 7],
    [240, 65, 5],
    [320, 105, 8],
    [400, 70, 6],
    [680, 75, 7],
    [760, 110, 5],
    [840, 60, 8],
    [980, 130, 6],
  ];

  for (const [sx, sy, sz] of starCoords) {
    drawIslamicStar(ctx, sx, sy, sz, theme.accentGold);
  }
  ctx.restore();
}

// Word wrapping helper for canvas
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Rounded rectangle helper
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Main canvas poster drawing function - Expert 1080 × 1080 Square WhatsApp Layout
export async function renderPosterToCanvas(
  canvas: HTMLCanvasElement,
  data: PosterData
): Promise<void> {
  const width = 1080;
  const height = 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = THEME_CONFIGS[data.themeId] || THEME_CONFIGS['zamrud-emas'];

  // 1. Rich Layered Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, theme.bgGradient[0]);
  bgGrad.addColorStop(0.5, theme.bgGradient[1]);
  bgGrad.addColorStop(1, theme.bgGradient[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Radial ambient illumination
  const radialGlow = ctx.createRadialGradient(width / 2, 220, 60, width / 2, 220, width * 0.7);
  radialGlow.addColorStop(0, theme.glowColor);
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Arabesque Star Geometry
  drawArabesquePattern(ctx, width, height, theme.starColor);

  // 3. Decorative Frame Architecture (Eliminating wasted borders)
  const margin = 32;
  const innerW = width - margin * 2;
  const innerH = height - margin * 2;

  ctx.save();
  // Outer hairline gold border
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 3.5;
  roundRect(ctx, margin, margin, innerW, innerH, 24);
  ctx.stroke();

  // Secondary fine inner border
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.25;
  roundRect(ctx, margin + 10, margin + 10, innerW - 20, innerH - 20, 18);
  ctx.stroke();

  // 4 Corner Medallions
  const cornerDist = margin + 10;
  drawIslamicStar(ctx, cornerDist, cornerDist, 18, theme.accentGold);
  drawIslamicStar(ctx, width - cornerDist, cornerDist, 18, theme.accentGold);
  drawIslamicStar(ctx, cornerDist, height - cornerDist, 18, theme.accentGold);
  drawIslamicStar(ctx, width - cornerDist, height - cornerDist, 18, theme.accentGold);

  // 3b. Islamic Visual Decorative Styles
  const decStyle = data.decorativeStyle || (data.layoutVariant === 'gerbang-islami' ? 'kubah-menara' : 'moden');

  if (decStyle === 'kubah-menara') {
    drawDomeAndMinaretsSilhouette(ctx, width, theme);
  } else if (decStyle === 'mihrab-lentera') {
    drawHangingLantern(ctx, 100, 70, 1.1, theme);
    drawHangingLantern(ctx, width - 100, 70, 1.1, theme);
    
    // Mihrab Arch
    ctx.beginPath();
    const archTop = margin + 20;
    const archW = innerW - 60;
    const archH = 180;
    const archLeft = (width - archW) / 2;
    const archRight = archLeft + archW;

    ctx.moveTo(archLeft, archTop + archH);
    ctx.lineTo(archLeft, archTop + 70);
    ctx.bezierCurveTo(archLeft, archTop + 15, width / 2 - 70, archTop, width / 2, archTop - 6);
    ctx.bezierCurveTo(width / 2 + 70, archTop, archRight, archTop + 15, archRight, archTop + 70);
    ctx.lineTo(archRight, archTop + archH);

    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  } else if (decStyle === 'bulan-bintang') {
    drawCrescentAndStarfield(ctx, width, theme);
  } else if (decStyle === 'arabesque-bintang') {
    // Four inner corner star medallions
    drawIslamicStar(ctx, cornerDist + 35, cornerDist + 35, 12, theme.accentGold);
    drawIslamicStar(ctx, width - cornerDist - 35, cornerDist + 35, 12, theme.accentGold);
    drawIslamicStar(ctx, cornerDist + 35, height - cornerDist - 35, 12, theme.accentGold);
    drawIslamicStar(ctx, width - cornerDist - 35, height - cornerDist - 35, 12, theme.accentGold);
  } else {
    // Moden: Sleek fine geometric pinstripes
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 16, margin + 16, innerW - 32, 4);
    ctx.strokeRect(margin + 16, height - margin - 20, innerW - 32, 4);
  }

  // Dome Arch Motif for 'gerbang-islami' if not already drawn
  if (data.layoutVariant === 'gerbang-islami' && decStyle !== 'kubah-menara' && decStyle !== 'mihrab-lentera') {
    ctx.beginPath();
    const archTop = margin + 20;
    const archW = innerW - 60;
    const archH = 180;
    const archLeft = (width - archW) / 2;
    const archRight = archLeft + archW;

    ctx.moveTo(archLeft, archTop + archH);
    ctx.lineTo(archLeft, archTop + 70);
    ctx.bezierCurveTo(archLeft, archTop + 15, width / 2 - 70, archTop, width / 2, archTop - 6);
    ctx.bezierCurveTo(width / 2 + 70, archTop, archRight, archTop + 15, archRight, archTop + 70);
    ctx.lineTo(archRight, archTop + archH);

    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();

  // 4. Bismillah Calligraphy (Mandatory 44px Arab)
  let currentY = 76;

  ctx.save();
  ctx.font = 'bold 44px "Amiri", "Scheherazade New", serif';
  ctx.fillStyle = theme.accentGold;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Subtle text glow
  ctx.shadowColor = theme.accentGold;
  ctx.shadowBlur = 12;
  ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, currentY);
  ctx.restore();

  currentY += 52;

  // 5. Category Badge Ribbon (Bold 24px)
  ctx.save();
  const categoryText = (data.subCategory || 'AKTIVITI KARIAH').toUpperCase();
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  const catWidth = ctx.measureText(categoryText).width + 60;
  const badgeH = 44;

  ctx.fillStyle = theme.badgeBg;
  roundRect(ctx, (width - catWidth) / 2, currentY - badgeH / 2, catWidth, badgeH, 22);
  ctx.fill();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  roundRect(ctx, (width - catWidth) / 2, currentY - badgeH / 2, catWidth, badgeH, 22);
  ctx.stroke();

  ctx.fillStyle = theme.badgeText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(categoryText, width / 2, currentY);
  ctx.restore();

  currentY += 46;

  // 6. High-Impact Event Title (Bold 50px - 58px)
  ctx.save();
  const maxTitleWidth = innerW - 60;
  const hasSpeaker = Boolean(data.speaker && data.speaker.trim());
  let titleFontSize = hasSpeaker ? (data.title.length > 50 ? 46 : 52) : (data.title.length > 50 ? 52 : 60);
  ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = theme.primaryText;

  let titleLines = wrapText(ctx, data.title, maxTitleWidth);
  if (titleLines.length > 2 && hasSpeaker) {
    titleFontSize = 42;
    ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
    titleLines = wrapText(ctx, data.title, maxTitleWidth);
  }

  const lineHeight = titleFontSize * 1.22;
  for (let i = 0; i < Math.min(titleLines.length, 3); i++) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillText(titleLines[i], width / 2, currentY);
    currentY += lineHeight;
  }
  ctx.restore();

  currentY += 12;

  // 7. Prominent Speaker Spotlight Card (Elder-Friendly 44px - 48px Speaker Name + Credential)
  if (hasSpeaker) {
    ctx.save();
    const speakerBoxW = innerW - 40;
    // Determine credential text (either from speakerCredential or extracted from speakerTitle)
    let credential = (data.speakerCredential || '').trim();
    if (!credential && data.speakerTitle && data.speakerTitle.includes('(')) {
      const match = data.speakerTitle.match(/\(([^)]+)\)/);
      if (match) credential = match[1].trim();
    }

    const speakerBoxH = credential ? 166 : 142;
    const speakerBoxX = (width - speakerBoxW) / 2;

    // Outer card container
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, speakerBoxX, currentY, speakerBoxW, speakerBoxH, 20);
    ctx.fill();

    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 2.5;
    roundRect(ctx, speakerBoxX, currentY, speakerBoxW, speakerBoxH, 20);
    ctx.stroke();

    // Speaker Role Tag (✦ PENCERAMAH JEMPUTAN ✦)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.accentGold;
    let cleanRole = 'PENCERAMAH JEMPUTAN';
    if (data.speakerTitle) {
      const r = data.speakerTitle.replace(/\([^)]+\)/g, '').trim().toUpperCase();
      if (r) cleanRole = r;
    }
    ctx.fillText(`✦  ${cleanRole}  ✦`, width / 2, currentY + 16);

    // Speaker Name (GIANT BOLD 44px - 48px)
    let spFontSize = data.speaker.length > 34 ? 40 : 46;
    ctx.font = `800 ${spFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = theme.primaryText;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;

    // Check if speaker name fits on single line
    const speakerLines = wrapText(ctx, data.speaker, speakerBoxW - 40);
    if (speakerLines.length === 1) {
      ctx.fillText(speakerLines[0], width / 2, currentY + 52);
    } else {
      ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(speakerLines[0], width / 2, currentY + 46);
      ctx.fillText(speakerLines[1], width / 2, currentY + 86);
    }

    // Credential / Institution Subtitle (Elder-Friendly 26px Bold Gold)
    if (credential) {
      ctx.shadowBlur = 0;
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = theme.secondaryText;
      const credY = speakerLines.length === 1 ? currentY + 116 : currentY + 128;
      ctx.fillText(`(${credential})`, width / 2, credY);
    }

    currentY += speakerBoxH + 18;
    ctx.restore();
  } else {
    currentY += 20;
  }

  // 8. Event Details (Tarikh, Masa, Tempat) - Bold High-Impact 3-Column Grid
  ctx.save();
  const infoCards = [
    {
      title: 'TARIKH',
      primary: data.date,
      secondary: data.hijriDate || '24 Jamadilawal 1448H',
      icon: '📅',
    },
    {
      title: 'MASA',
      primary: data.time,
      secondary: '',
      icon: '⏰',
    },
    {
      title: 'TEMPAT',
      primary: data.venue,
      secondary: '',
      icon: '🕌',
    },
  ];

  const cols = 3;
  const gap = 16;
  const cardW = (innerW - 40 - gap * (cols - 1)) / cols;
  const cardH = hasSpeaker ? 186 : 220;
  const startX = (width - (cardW * cols + gap * (cols - 1))) / 2;

  for (let i = 0; i < cols; i++) {
    const card = infoCards[i];
    const cardX = startX + i * (cardW + gap);

    // Card background
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, cardX, currentY, cardW, cardH, 20);
    ctx.fill();

    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 2;
    roundRect(ctx, cardX, currentY, cardW, cardH, 20);
    ctx.stroke();

    // Card Header Label (24px bold)
    ctx.textAlign = 'center';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.accentGold;
    ctx.fillText(`${card.icon} ${card.title}`, cardX + cardW / 2, currentY + 28);

    // Primary Text (28px - 32px Bold)
    ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.primaryText;
    const lines = wrapText(ctx, card.primary, cardW - 24);
    let lineY = currentY + 68;
    for (const line of lines.slice(0, 2)) {
      ctx.fillText(line, cardX + cardW / 2, lineY);
      lineY += 34;
    }

    // Tarikh Hijrah (24px Bold Gold)
    if (card.secondary) {
      ctx.font = '700 23px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = theme.secondaryText;
      ctx.fillText(card.secondary, cardX + cardW / 2, currentY + cardH - 26);
    }
  }

  currentY += cardH + 18;
  ctx.restore();

  // 9. Notes / Jamuan Highlight Strip (Eliminates empty wasted space)
  if (data.notes && data.notes.trim()) {
    ctx.save();
    const noteBoxW = innerW - 40;
    const noteBoxH = 68;
    const noteBoxX = (width - noteBoxW) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    roundRect(ctx, noteBoxX, currentY, noteBoxW, noteBoxH, 16);
    ctx.fill();

    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1.25;
    roundRect(ctx, noteBoxX, currentY, noteBoxW, noteBoxH, 16);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic 700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.secondaryText;

    const noteText = data.notes.length > 74 ? data.notes.slice(0, 72) + '...' : data.notes;
    ctx.fillText(`✨ "${noteText}"`, width / 2, currentY + noteBoxH / 2);
    ctx.restore();

    currentY += noteBoxH + 16;
  }

  // 10. Footer Section (Penganjur & WhatsApp Hubungi - High Impact & Prominent)
  ctx.save();
  const footerY = height - margin - 86;

  // Thin separator line above footer
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(margin + 40, footerY - 14);
  ctx.lineTo(width - margin - 40, footerY - 14);
  ctx.stroke();

  // Small central star ornament
  drawIslamicStar(ctx, width / 2, footerY - 14, 11, theme.accentGold);

  // Organizer Name (23px bold)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '700 23px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.primaryText;
  const organizerText = data.organizer ? data.organizer.toUpperCase() : 'BIRO DAKWAH MASJID AL-FALAH';
  ctx.fillText(`ANJURAN: ${organizerText}`, width / 2, footerY);

  // Contact Info (Prominent High-Contrast 26px Bold Gold Spotlight Box)
  const contactText = data.contactNumber || 'Haji Razak (019-2345678)';
  ctx.font = '800 25px "Plus Jakarta Sans", sans-serif';
  const contactW = ctx.measureText(`📞 HUBUNGI / WHATSAPP: ${contactText}`).width + 48;
  const contactH = 44;
  const contactX = (width - contactW) / 2;
  const contactY = footerY + 34;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  roundRect(ctx, contactX, contactY, contactW, contactH, 22);
  ctx.fill();

  ctx.strokeStyle = theme.accentGold;
  ctx.lineWidth = 1.5;
  roundRect(ctx, contactX, contactY, contactW, contactH, 22);
  ctx.stroke();

  ctx.fillStyle = theme.accentGold;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`📞 HUBUNGI / WHATSAPP: ${contactText}`, width / 2, contactY + contactH / 2);

  ctx.restore();
}

// Convert canvas to a downloadable PNG file
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Convert canvas to a blob
export function getCanvasBlob(canvas: HTMLCanvasElement, quality = 0.95): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', quality);
  });
}

// Copy canvas image to system clipboard
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await getCanvasBlob(canvas);
    if (!blob) return false;
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.warn('Clipboard copy failed:', err);
    return false;
  }
}

// Format pre-filled WhatsApp message text
export function formatWhatsAppSummaryText(data: PosterData): string {
  const cred = data.speakerCredential ? ` (${data.speakerCredential})` : '';
  return `📢 *${data.title}*
${data.subCategory ? `📌 *Kategori:* ${data.subCategory}\n` : ''}${data.speaker ? `🎙️ *${data.speakerTitle || 'Penceramah Jemputan'}:* ${data.speaker}${cred}\n` : ''}📅 *Tarikh:* ${data.date} (${data.hijriDate || '24 Jamadilawal 1448H'})
⏰ *Masa:* ${data.time}
🕌 *Tempat:* ${data.venue}
${data.notes ? `\n✨ _${data.notes}_\n` : ''}
👥 *Anjuran:* ${data.organizer}
${data.contactNumber ? `📞 *Hubungi:* ${data.contactNumber}` : ''}

_Poster WhatsApp 1:1 dihasilkan melalui NurGrafik_`;
}
