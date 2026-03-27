/*
 * Design: Neon Terminal / Cyberpunk
 * CyberDiploma: Full-screen diploma with download as PDF or JPG
 * Uses native Canvas API for INSTANT generation (no html-to-image dependency)
 * Background forced to #0a0a0f (black)
 */
import { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type UserProgress, MODULES, getLevel } from '@/lib/moduleData';
import { toast } from 'sonner';

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/statera-blanc_c6b8b447.webp';

interface CyberDiplomaProps {
  userName: string;
  progress: UserProgress;
  onClose: () => void;
}

/** Generate a deterministic certificate ID based on the user name */
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

/** Draw the entire diploma on a Canvas — pure drawing, no DOM capture */
function drawDiploma(
  canvas: HTMLCanvasElement,
  userName: string,
  progress: UserProgress,
  logoImg: HTMLImageElement | null,
  scale: number = 2,
) {
  const W = 800 * scale;
  const H = 580 * scale;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const s = scale; // shorthand

  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  // Grid pattern
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
  const cornerLen = 40 * s;
  const cornerOff = 12 * s;
  const cornerW = 2 * s;
  ctx.fillStyle = '#00f0ff';
  // Top-left
  ctx.fillRect(cornerOff, cornerOff, cornerLen, cornerW);
  ctx.fillRect(cornerOff, cornerOff, cornerW, cornerLen);
  // Top-right
  ctx.fillRect(W - cornerOff - cornerLen, cornerOff, cornerLen, cornerW);
  ctx.fillRect(W - cornerOff - cornerW, cornerOff, cornerW, cornerLen);
  // Bottom-left
  ctx.fillRect(cornerOff, H - cornerOff - cornerW, cornerLen, cornerW);
  ctx.fillRect(cornerOff, H - cornerOff - cornerLen, cornerW, cornerLen);
  // Bottom-right
  ctx.fillRect(W - cornerOff - cornerLen, H - cornerOff - cornerW, cornerLen, cornerW);
  ctx.fillRect(W - cornerOff - cornerW, H - cornerOff - cornerLen, cornerW, cornerLen);

  // Helper: centered text
  const centerText = (text: string, y: number, font: string, color: string, shadow?: string) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    if (shadow) {
      ctx.shadowColor = shadow;
      ctx.shadowBlur = 20 * s;
    }
    ctx.fillText(text, W / 2, y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  // Helper: gradient line
  const gradientLine = (y: number, width: number, color: string) => {
    const grad = ctx.createLinearGradient(W / 2 - width / 2, y, W / 2 + width / 2, y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(W / 2 - width / 2, y, width, 1 * s);
  };

  let yPos = 36 * s;

  // Logo
  if (logoImg) {
    const logoH = 30 * s;
    const logoW = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH;
    ctx.drawImage(logoImg, (W - logoW) / 2, yPos, logoW, logoH);
    yPos += logoH + 12 * s;
  } else {
    yPos += 10 * s;
  }

  // "CERTIFICATION DE FORMATION"
  centerText('CERTIFICATION DE FORMATION', yPos, `${10 * s}px "JetBrains Mono", monospace`, '#64748b');
  yPos += 22 * s;

  // "STATERA_Academy"
  centerText('STATERA_Academy', yPos, `bold ${20 * s}px "JetBrains Mono", monospace`, '#00f0ff', 'rgba(0,240,255,0.4)');
  yPos += 14 * s;

  // Gradient line
  gradientLine(yPos, 200 * s, '#00f0ff');
  yPos += 18 * s;

  // "Décerne le présent diplôme à"
  centerText('DÉCERNE LE PRÉSENT DIPLÔME À', yPos, `${10 * s}px "JetBrains Mono", monospace`, '#64748b');
  yPos += 26 * s;

  // User name
  centerText(userName || 'Agent Cyber', yPos, `bold ${28 * s}px "Space Grotesk", "JetBrains Mono", sans-serif`, '#e2e8f0', 'rgba(226,232,240,0.2)');
  yPos += 16 * s;

  // Separator
  gradientLine(yPos, 300 * s, '#1e293b');
  yPos += 18 * s;

  // Description
  centerText('Pour avoir complété avec succès l\'ensemble du programme de', yPos, `${11 * s}px "JetBrains Mono", monospace`, '#94a3b8');
  yPos += 16 * s;
  centerText('Sensibilisation aux Risques Cyber en Entreprise', yPos, `bold ${11 * s}px "JetBrains Mono", monospace`, '#00f0ff');
  yPos += 16 * s;
  centerText(`composé de ${MODULES.length} modules de formation`, yPos, `${11 * s}px "JetBrains Mono", monospace`, '#94a3b8');
  yPos += 28 * s;

  // Stats
  const level = getLevel(progress.totalXP);
  const avgScore = progress.completedModules.length > 0
    ? Math.round(Object.values(progress.moduleScores).reduce((a, b) => a + b, 0) / progress.completedModules.length)
    : 0;

  const stats = [
    { value: `${avgScore}%`, label: 'SCORE MOYEN', color: '#00f0ff', border: 'rgba(0,240,255,0.15)', bg: 'rgba(0,240,255,0.03)' },
    { value: `${progress.totalXP}`, label: 'XP TOTAL', color: '#00ff88', border: 'rgba(0,255,136,0.15)', bg: 'rgba(0,255,136,0.03)' },
    { value: `Nv.${level.level}`, label: level.title.toUpperCase(), color: level.color, border: `${level.color}25`, bg: `${level.color}08` },
  ];

  const statW = 110 * s;
  const statH = 48 * s;
  const statGap = 20 * s;
  const totalStatW = stats.length * statW + (stats.length - 1) * statGap;
  let statX = (W - totalStatW) / 2;

  stats.forEach(st => {
    // Box
    ctx.fillStyle = st.bg;
    ctx.fillRect(statX, yPos, statW, statH);
    ctx.strokeStyle = st.border;
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(statX, yPos, statW, statH);
    // Value
    ctx.font = `bold ${18 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = st.color;
    ctx.textAlign = 'center';
    ctx.shadowColor = `${st.color}50`;
    ctx.shadowBlur = 10 * s;
    ctx.fillText(st.value, statX + statW / 2, yPos + 22 * s);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    // Label
    ctx.font = `${8 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#64748b';
    ctx.fillText(st.label, statX + statW / 2, yPos + 38 * s);
    statX += statW + statGap;
  });

  yPos += statH + 16 * s;

  // Module scores row
  const modGap = 6 * s;
  const modPadH = 3 * s;
  const modPadW = 8 * s;
  const modFontSize = 8 * s;
  ctx.font = `${modFontSize}px "JetBrains Mono", monospace`;

  // Calculate total width of all module tags
  const modTexts = MODULES.map(mod => {
    const score = progress.moduleScores[mod.id] ?? 0;
    return { text: `${mod.title.toUpperCase()} — ${score}%`, color: mod.color };
  });
  const modWidths = modTexts.map(mt => ctx.measureText(mt.text).width + modPadW * 2);
  const totalModW = modWidths.reduce((a, b) => a + b, 0) + (modTexts.length - 1) * modGap;

  // If too wide, wrap into two rows
  const maxRowW = W - 100 * s;
  if (totalModW > maxRowW) {
    const half = Math.ceil(modTexts.length / 2);
    const rows = [modTexts.slice(0, half), modTexts.slice(half)];
    const rowWidths = rows.map(row => {
      const ws = row.map(mt => ctx.measureText(mt.text).width + modPadW * 2);
      return ws.reduce((a, b) => a + b, 0) + (row.length - 1) * modGap;
    });

    rows.forEach((row, ri) => {
      let mx = (W - rowWidths[ri]) / 2;
      row.forEach(mt => {
        const tw = ctx.measureText(mt.text).width + modPadW * 2;
        const th = modFontSize + modPadH * 2 + 4 * s;
        ctx.fillStyle = `${mt.color}08`;
        ctx.fillRect(mx, yPos, tw, th);
        ctx.strokeStyle = `${mt.color}30`;
        ctx.lineWidth = 1 * s;
        ctx.strokeRect(mx, yPos, tw, th);
        ctx.font = `${modFontSize}px "JetBrains Mono", monospace`;
        ctx.fillStyle = mt.color;
        ctx.textAlign = 'center';
        ctx.fillText(mt.text, mx + tw / 2, yPos + modPadH + modFontSize);
        mx += tw + modGap;
      });
      yPos += modFontSize + modPadH * 2 + 4 * s + modGap;
    });
  } else {
    let mx = (W - totalModW) / 2;
    modTexts.forEach((mt, i) => {
      const tw = modWidths[i];
      const th = modFontSize + modPadH * 2 + 4 * s;
      ctx.fillStyle = `${mt.color}08`;
      ctx.fillRect(mx, yPos, tw, th);
      ctx.strokeStyle = `${mt.color}30`;
      ctx.lineWidth = 1 * s;
      ctx.strokeRect(mx, yPos, tw, th);
      ctx.font = `${modFontSize}px "JetBrains Mono", monospace`;
      ctx.fillStyle = mt.color;
      ctx.textAlign = 'center';
      ctx.fillText(mt.text, mx + tw / 2, yPos + modPadH + modFontSize);
      mx += tw + modGap;
    });
    yPos += modFontSize + modPadH * 2 + 4 * s + 10 * s;
  }

  yPos += 6 * s;

  // Expiration notice
  const obtentionDate = new Date();
  const expirationDate = new Date(obtentionDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  const expText = `VALIDE JUSQU'AU ${expirationDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  const renewText = 'RENOUVELLEMENT REQUIS APRÈS 12 MOIS';

  ctx.font = `${9 * s}px "JetBrains Mono", monospace`;
  const expW = Math.max(ctx.measureText(expText).width, ctx.measureText(renewText).width) + 28 * s;
  const expH = 32 * s;
  const expX = (W - expW) / 2;

  ctx.fillStyle = 'rgba(245,158,11,0.04)';
  ctx.fillRect(expX, yPos, expW, expH);
  ctx.strokeStyle = 'rgba(245,158,11,0.2)';
  ctx.lineWidth = 1 * s;
  ctx.strokeRect(expX, yPos, expW, expH);

  ctx.font = `${9 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#f59e0b';
  ctx.textAlign = 'center';
  ctx.fillText(expText, W / 2, yPos + 14 * s);

  ctx.font = `${7 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#92400e';
  ctx.fillText(renewText, W / 2, yPos + 26 * s);

  yPos += expH + 14 * s;

  // Footer separator
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(50 * s, yPos, W - 100 * s, 1 * s);
  yPos += 14 * s;

  // Footer: date, cert id, validated by
  const today = obtentionDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const certId = generateCertId(userName);

  // Left: date
  ctx.textAlign = 'left';
  ctx.font = `${8 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#64748b';
  ctx.fillText("DATE D'OBTENTION", 50 * s, yPos);
  ctx.font = `${11 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(today, 50 * s, yPos + 16 * s);

  // Center: cert id
  ctx.textAlign = 'center';
  ctx.font = `${8 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#64748b';
  ctx.fillText(`N° ${certId}`, W / 2, yPos + 8 * s);

  // Right: validated by
  ctx.textAlign = 'right';
  ctx.font = `${8 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('VALIDÉ PAR', W - 50 * s, yPos);
  ctx.font = `${11 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#00f0ff';
  ctx.fillText('RSSI — STATERA Corp.', W - 50 * s, yPos + 16 * s);
}

export default function CyberDiploma({ userName, progress, onClose }: CyberDiplomaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  const level = getLevel(progress.totalXP);
  const avgScore = progress.completedModules.length > 0
    ? Math.round(
        Object.values(progress.moduleScores).reduce((a, b) => a + b, 0) /
        progress.completedModules.length
      )
    : 0;

  const obtentionDate = new Date();
  const expirationDate = new Date(obtentionDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  const formatDateLong = (d: Date) => d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const today = formatDateLong(obtentionDate);
  const fileNameBase = `Diplome_STATERA_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

  // Preload logo image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLogoImg(img);
    };
    img.onerror = () => {
      // Continue without logo
      setLogoImg(null);
      setCanvasReady(true);
    };
    img.src = LOGO_URL;
  }, []);

  // Draw canvas when logo is loaded
  useEffect(() => {
    if (logoImg && canvasRef.current) {
      drawDiploma(canvasRef.current, userName, progress, logoImg, 2);
      setCanvasReady(true);
    } else if (logoImg === null && canvasRef.current) {
      // Logo failed, draw without it
      drawDiploma(canvasRef.current, userName, progress, null, 2);
      setCanvasReady(true);
    }
  }, [logoImg, userName, progress]);

  // Redraw at higher res for export
  const generateHighRes = useCallback((format: 'jpeg' | 'png'): string => {
    const offscreen = document.createElement('canvas');
    drawDiploma(offscreen, userName, progress, logoImg, 3);
    return offscreen.toDataURL(`image/${format}`, 0.95);
  }, [userName, progress, logoImg]);

  const handleDownloadJPG = useCallback(() => {
    setShowFormatMenu(false);
    try {
      const dataUrl = generateHighRes('jpeg');
      const link = document.createElement('a');
      link.download = `${fileNameBase}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Diplôme JPG téléchargé !');
    } catch (err) {
      console.error('JPG download failed:', err);
      toast.error('Erreur lors du téléchargement JPG');
    }
  }, [generateHighRes, fileNameBase]);

  const handleDownloadPDF = useCallback(async () => {
    setShowFormatMenu(false);
    try {
      const dataUrl = generateHighRes('jpeg');
      const { jsPDF } = await import('jspdf');
      const pdfWidth = 297;
      const pdfHeight = (580 / 800) * pdfWidth;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileNameBase}.pdf`);
      toast.success('Diplôme PDF téléchargé !');
    } catch (err) {
      console.error('PDF download failed:', err);
      toast.error('Erreur lors du téléchargement PDF');
    }
  }, [generateHighRes, fileNameBase]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Controls */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 60 }}>
        <div style={{ position: 'relative' }}>
          <Button
            onClick={() => setShowFormatMenu(!showFormatMenu)}
            className="font-mono text-xs tracking-wider gap-2"
            style={{ background: '#00f0ff', color: '#0a0a0f', fontWeight: 'bold' }}
          >
            <Download className="w-4 h-4" />
            TÉLÉCHARGER
          </Button>

          {/* Format dropdown */}
          <AnimatePresence>
            {showFormatMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: '#0f1117',
                  border: '1px solid rgba(0,240,255,0.25)',
                  minWidth: '220px',
                  zIndex: 100,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}
              >
                <button
                  onClick={handleDownloadPDF}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(0,240,255,0.08)',
                    color: '#e2e8f0',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,240,255,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <FileText style={{ width: '18px', height: '18px', color: '#ff3366', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Format PDF</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Document haute qualité</div>
                  </div>
                </button>

                <button
                  onClick={handleDownloadJPG}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#e2e8f0',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,240,255,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <ImageIcon style={{ width: '18px', height: '18px', color: '#00ff88', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Format JPG</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Image haute résolution</div>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          size="icon"
          style={{ borderColor: 'rgba(100,116,139,0.4)' }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Click outside to close format menu */}
      {showFormatMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9 }}
          onClick={() => setShowFormatMenu(false)}
        />
      )}

      {/* Canvas diploma */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        style={{ width: '100%', maxWidth: '800px' }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            background: '#0a0a0f',
          }}
        />
        {!canvasReady && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00f0ff',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '14px',
          }}>
            Chargement du diplôme...
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
