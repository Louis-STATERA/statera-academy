/**
 * diplomaGenerator.ts
 * 
 * Non-blocking diploma pre-generation service.
 * - Pre-loads the logo once at import time
 * - Generates the diploma canvas in small chunks via requestIdleCallback
 *   (falls back to setTimeout if requestIdleCallback is unavailable)
 * - Caches the result as Blob (JPG) and dataURL so downloads are instant
 * - Exposes a simple API: preGenerate(), getJPGBlob(), getPDFBlob()
 */

import { type UserProgress, MODULES, getLevel } from '@/lib/moduleData';

// ─── Types ───────────────────────────────────────────────────────────
interface CachedDiploma {
  jpgBlob: Blob;
  jpgDataUrl: string;
  key: string; // hash of inputs to detect staleness
}

// ─── State ───────────────────────────────────────────────────────────
let cachedLogo: HTMLImageElement | null = null;
let logoLoading = false;
let logoLoaded = false;
let cached: CachedDiploma | null = null;
let generating = false;

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/statera-blanc_c6b8b447.webp';

// ─── Logo preload (runs once at import) ──────────────────────────────
function preloadLogo(): Promise<HTMLImageElement | null> {
  if (logoLoaded) return Promise.resolve(cachedLogo);
  if (logoLoading) {
    return new Promise(resolve => {
      const check = setInterval(() => {
        if (logoLoaded) { clearInterval(check); resolve(cachedLogo); }
      }, 50);
    });
  }
  logoLoading = true;
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { cachedLogo = img; logoLoaded = true; logoLoading = false; resolve(img); };
    img.onerror = () => { cachedLogo = null; logoLoaded = true; logoLoading = false; resolve(null); };
    img.src = LOGO_URL;
  });
}

// Start preloading immediately
preloadLogo();

// ─── Cache key ───────────────────────────────────────────────────────
function makeCacheKey(userName: string, progress: UserProgress): string {
  return `${userName}|${progress.completedModules.join(',')}|${JSON.stringify(progress.moduleScores)}|${progress.totalXP}`;
}

// ─── Certificate ID ──────────────────────────────────────────────────
function generateCertId(name: string): string {
  let hash = 0;
  const str = name + '2026';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `STA-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

// ─── Draw diploma on canvas (synchronous, ~5-15ms) ──────────────────
function drawDiploma(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  W: number,
  H: number,
  userName: string,
  progress: UserProgress,
  logoImg: HTMLImageElement | null,
  scale: number,
) {
  const s = scale;

  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(0,240,255,0.03)';
  ctx.lineWidth = 1;
  const gridSize = 40 * s;
  for (let x = 0; x <= W; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Outer border
  ctx.strokeStyle = 'rgba(0,240,255,0.2)';
  ctx.lineWidth = 1 * s;
  ctx.strokeRect(8 * s, 8 * s, W - 16 * s, H - 16 * s);

  // Corner accents
  const cLen = 40 * s, cOff = 12 * s, cW = 2 * s;
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(cOff, cOff, cLen, cW); ctx.fillRect(cOff, cOff, cW, cLen);
  ctx.fillRect(W - cOff - cLen, cOff, cLen, cW); ctx.fillRect(W - cOff - cW, cOff, cW, cLen);
  ctx.fillRect(cOff, H - cOff - cW, cLen, cW); ctx.fillRect(cOff, H - cOff - cLen, cW, cLen);
  ctx.fillRect(W - cOff - cLen, H - cOff - cW, cLen, cW); ctx.fillRect(W - cOff - cW, H - cOff - cLen, cW, cLen);

  // Helpers
  const centerText = (text: string, y: number, font: string, color: string, shadow?: string) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    if (shadow) { ctx.shadowColor = shadow; ctx.shadowBlur = 20 * s; }
    ctx.fillText(text, W / 2, y);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
  };
  const gradLine = (y: number, w: number, color: string) => {
    const g = ctx.createLinearGradient(W / 2 - w / 2, y, W / 2 + w / 2, y);
    g.addColorStop(0, 'transparent'); g.addColorStop(0.5, color); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(W / 2 - w / 2, y, w, 1 * s);
  };

  let y = 36 * s;

  // Logo
  if (logoImg) {
    const lH = 30 * s;
    const lW = (logoImg.naturalWidth / logoImg.naturalHeight) * lH;
    ctx.drawImage(logoImg, (W - lW) / 2, y, lW, lH);
    y += lH + 12 * s;
  } else { y += 10 * s; }

  centerText('CERTIFICATION DE FORMATION', y, `${10 * s}px "JetBrains Mono", monospace`, '#64748b');
  y += 22 * s;
  centerText('STATERA_Academy', y, `bold ${20 * s}px "JetBrains Mono", monospace`, '#00f0ff', 'rgba(0,240,255,0.4)');
  y += 14 * s;
  gradLine(y, 200 * s, '#00f0ff');
  y += 18 * s;
  centerText('DÉCERNE LE PRÉSENT DIPLÔME À', y, `${10 * s}px "JetBrains Mono", monospace`, '#64748b');
  y += 26 * s;
  centerText(userName || 'Agent Cyber', y, `bold ${28 * s}px "Space Grotesk", "JetBrains Mono", sans-serif`, '#e2e8f0', 'rgba(226,232,240,0.2)');
  y += 16 * s;
  gradLine(y, 300 * s, '#1e293b');
  y += 18 * s;
  centerText("Pour avoir complété avec succès l'ensemble du programme de", y, `${11 * s}px "JetBrains Mono", monospace`, '#94a3b8');
  y += 16 * s;
  centerText('Sensibilisation aux Risques Cyber en Entreprise', y, `bold ${11 * s}px "JetBrains Mono", monospace`, '#00f0ff');
  y += 16 * s;
  centerText(`composé de ${MODULES.length} modules de formation`, y, `${11 * s}px "JetBrains Mono", monospace`, '#94a3b8');
  y += 28 * s;

  // Stats
  const level = getLevel(progress.totalXP);
  const avg = progress.completedModules.length > 0
    ? Math.round(Object.values(progress.moduleScores).reduce((a, b) => a + b, 0) / progress.completedModules.length)
    : 0;

  const stats = [
    { v: `${avg}%`, l: 'SCORE MOYEN', c: '#00f0ff', b: 'rgba(0,240,255,0.15)', bg: 'rgba(0,240,255,0.03)' },
    { v: `${progress.totalXP}`, l: 'XP TOTAL', c: '#00ff88', b: 'rgba(0,255,136,0.15)', bg: 'rgba(0,255,136,0.03)' },
    { v: `Nv.${level.level}`, l: level.title.toUpperCase(), c: level.color, b: `${level.color}25`, bg: `${level.color}08` },
  ];
  const sW = 110 * s, sH = 48 * s, sG = 20 * s;
  let sx = (W - (stats.length * sW + (stats.length - 1) * sG)) / 2;
  stats.forEach(st => {
    ctx.fillStyle = st.bg; ctx.fillRect(sx, y, sW, sH);
    ctx.strokeStyle = st.b; ctx.lineWidth = 1 * s; ctx.strokeRect(sx, y, sW, sH);
    ctx.font = `bold ${18 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = st.c; ctx.textAlign = 'center';
    ctx.shadowColor = `${st.c}50`; ctx.shadowBlur = 10 * s;
    ctx.fillText(st.v, sx + sW / 2, y + 22 * s);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
    ctx.font = `${8 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#64748b'; ctx.fillText(st.l, sx + sW / 2, y + 38 * s);
    sx += sW + sG;
  });
  y += sH + 16 * s;

  // Module tags
  const mG = 6 * s, mPH = 3 * s, mPW = 8 * s, mFS = 8 * s;
  ctx.font = `${mFS}px "JetBrains Mono", monospace`;
  const mts = MODULES.map(m => ({
    t: `${m.title.toUpperCase()} — ${progress.moduleScores[m.id] ?? 0}%`,
    c: m.color,
  }));
  const mws = mts.map(mt => ctx.measureText(mt.t).width + mPW * 2);
  const totalMW = mws.reduce((a, b) => a + b, 0) + (mts.length - 1) * mG;
  const maxRW = W - 100 * s;

  const drawTag = (mt: { t: string; c: string }, tw: number, mx: number, ty: number) => {
    const th = mFS + mPH * 2 + 4 * s;
    ctx.fillStyle = `${mt.c}08`; ctx.fillRect(mx, ty, tw, th);
    ctx.strokeStyle = `${mt.c}30`; ctx.lineWidth = 1 * s; ctx.strokeRect(mx, ty, tw, th);
    ctx.font = `${mFS}px "JetBrains Mono", monospace`;
    ctx.fillStyle = mt.c; ctx.textAlign = 'center';
    ctx.fillText(mt.t, mx + tw / 2, ty + mPH + mFS);
  };

  if (totalMW > maxRW) {
    const half = Math.ceil(mts.length / 2);
    [mts.slice(0, half), mts.slice(half)].forEach((row, ri) => {
      const rws = row.map(mt => ctx.measureText(mt.t).width + mPW * 2);
      const rw = rws.reduce((a, b) => a + b, 0) + (row.length - 1) * mG;
      let mx = (W - rw) / 2;
      row.forEach((mt, i) => { drawTag(mt, rws[i], mx, y); mx += rws[i] + mG; });
      y += mFS + mPH * 2 + 4 * s + mG;
    });
  } else {
    let mx = (W - totalMW) / 2;
    mts.forEach((mt, i) => { drawTag(mt, mws[i], mx, y); mx += mws[i] + mG; });
    y += mFS + mPH * 2 + 4 * s + 10 * s;
  }
  y += 6 * s;

  // Expiration
  const now = new Date();
  const exp = new Date(now); exp.setFullYear(exp.getFullYear() + 1);
  const expT = `VALIDE JUSQU'AU ${exp.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  const renT = 'RENOUVELLEMENT REQUIS APRÈS 12 MOIS';
  ctx.font = `${9 * s}px "JetBrains Mono", monospace`;
  const eW = Math.max(ctx.measureText(expT).width, ctx.measureText(renT).width) + 28 * s;
  const eH = 32 * s, eX = (W - eW) / 2;
  ctx.fillStyle = 'rgba(245,158,11,0.04)'; ctx.fillRect(eX, y, eW, eH);
  ctx.strokeStyle = 'rgba(245,158,11,0.2)'; ctx.lineWidth = 1 * s; ctx.strokeRect(eX, y, eW, eH);
  ctx.font = `${9 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#f59e0b'; ctx.textAlign = 'center'; ctx.fillText(expT, W / 2, y + 14 * s);
  ctx.font = `${7 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#92400e'; ctx.fillText(renT, W / 2, y + 26 * s);
  y += eH + 14 * s;

  // Footer
  ctx.fillStyle = '#1e293b'; ctx.fillRect(50 * s, y, W - 100 * s, 1 * s);
  y += 14 * s;
  const today = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const cid = generateCertId(userName);
  ctx.textAlign = 'left'; ctx.font = `${8 * s}px "JetBrains Mono", monospace`; ctx.fillStyle = '#64748b';
  ctx.fillText("DATE D'OBTENTION", 50 * s, y);
  ctx.font = `${11 * s}px "JetBrains Mono", monospace`; ctx.fillStyle = '#e2e8f0';
  ctx.fillText(today, 50 * s, y + 16 * s);
  ctx.textAlign = 'center'; ctx.font = `${8 * s}px "JetBrains Mono", monospace`; ctx.fillStyle = '#64748b';
  ctx.fillText(`N° ${cid}`, W / 2, y + 8 * s);
  ctx.textAlign = 'right'; ctx.font = `${8 * s}px "JetBrains Mono", monospace`; ctx.fillStyle = '#64748b';
  ctx.fillText('VALIDÉ PAR', W - 50 * s, y);
  ctx.font = `${11 * s}px "JetBrains Mono", monospace`; ctx.fillStyle = '#00f0ff';
  ctx.fillText('RSSI — STATERA Corp.', W - 50 * s, y + 16 * s);
}

// ─── Public API ──────────────────────────────────────────────────────

/** Check if a diploma is already cached for these inputs */
export function isCached(userName: string, progress: UserProgress): boolean {
  return cached !== null && cached.key === makeCacheKey(userName, progress);
}

/** Check if generation is in progress */
export function isGenerating(): boolean {
  return generating;
}

/**
 * Pre-generate the diploma in the background.
 * Uses requestIdleCallback to avoid blocking the main thread.
 * Returns a promise that resolves when the diploma is ready.
 */
export function preGenerate(userName: string, progress: UserProgress): Promise<void> {
  const key = makeCacheKey(userName, progress);

  // Already cached with same inputs
  if (cached && cached.key === key) return Promise.resolve();

  // Already generating — return a watcher
  if (generating) {
    return new Promise(resolve => {
      const check = setInterval(() => {
        if (!generating) { clearInterval(check); resolve(); }
      }, 100);
    });
  }

  generating = true;

  return new Promise(async (resolve) => {
    // Ensure logo is loaded
    const logo = await preloadLogo();

    // Use requestIdleCallback to yield to the browser
    const idle = (cb: () => void) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(cb, { timeout: 500 });
      } else {
        setTimeout(cb, 0);
      }
    };

    idle(() => {
      try {
        const scale = 3;
        const W = 800 * scale;
        const H = 580 * scale;

        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d')!;

        // Draw everything
        drawDiploma(ctx, W, H, userName, progress, logo, scale);

        // Convert to blob (async, non-blocking)
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              cached = {
                jpgBlob: blob,
                jpgDataUrl: reader.result as string,
                key,
              };
              generating = false;
              resolve();
            };
            reader.readAsDataURL(blob);
          } else {
            // Fallback to dataURL
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            fetch(dataUrl).then(r => r.blob()).then(b => {
              cached = { jpgBlob: b, jpgDataUrl: dataUrl, key };
              generating = false;
              resolve();
            });
          }
        }, 'image/jpeg', 0.95);
      } catch (err) {
        console.error('Diploma pre-generation failed:', err);
        generating = false;
        resolve();
      }
    });
  });
}

/** Get the cached JPG data URL (for preview canvas) */
export function getCachedJPGDataUrl(): string | null {
  return cached?.jpgDataUrl ?? null;
}

/** Download the diploma as JPG — instant if pre-generated */
export async function downloadJPG(userName: string, progress: UserProgress): Promise<boolean> {
  // Ensure generated
  if (!cached || cached.key !== makeCacheKey(userName, progress)) {
    await preGenerate(userName, progress);
  }
  if (!cached) return false;

  const fileName = `Diplome_STATERA_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.jpg`;
  const link = document.createElement('a');
  link.download = fileName;
  link.href = URL.createObjectURL(cached.jpgBlob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  return true;
}

/** Download the diploma as PDF — instant if pre-generated */
export async function downloadPDF(userName: string, progress: UserProgress): Promise<boolean> {
  // Ensure generated
  if (!cached || cached.key !== makeCacheKey(userName, progress)) {
    await preGenerate(userName, progress);
  }
  if (!cached) return false;

  const { jsPDF } = await import('jspdf');
  const pdfW = 297;
  const pdfH = (580 / 800) * pdfW;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [pdfW, pdfH] });
  pdf.addImage(cached.jpgDataUrl, 'JPEG', 0, 0, pdfW, pdfH);
  const fileName = `Diplome_STATERA_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
  return true;
}

/** Draw a preview-size diploma on a visible canvas (for the overlay) */
export async function drawPreview(canvas: HTMLCanvasElement, userName: string, progress: UserProgress): Promise<void> {
  const logo = await preloadLogo();
  const scale = 2;
  const W = 800 * scale;
  const H = 580 * scale;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  drawDiploma(ctx, W, H, userName, progress, logo, scale);
}
