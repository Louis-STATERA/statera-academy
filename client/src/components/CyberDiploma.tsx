/*
 * Design: Neon Terminal / Cyberpunk
 * CyberDiploma: Full-screen diploma with download as PDF or JPG
 * Uses html-to-image (supports modern CSS) instead of html2canvas
 * All colors are explicit hex/rgb — no oklch dependency
 * Background forced to #0a0a0f (black)
 */
import { useRef, useCallback, useState } from 'react';
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

export default function CyberDiploma({ userName, progress, onClose }: CyberDiplomaProps) {
  const diplomaRef = useRef<HTMLDivElement>(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingFormat, setGeneratingFormat] = useState<'pdf' | 'jpg' | null>(null);

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

  const captureImage = useCallback(async (format: 'jpeg' | 'png') => {
    const el = diplomaRef.current;
    if (!el) return null;
    const { toJpeg, toPng } = await import('html-to-image');
    const fn = format === 'jpeg' ? toJpeg : toPng;
    // Wait a tick for fonts/images to settle
    await new Promise(r => setTimeout(r, 300));
    const dataUrl = await fn(el, {
      quality: 0.95,
      pixelRatio: 3,
      backgroundColor: '#0a0a0f',
      cacheBust: true,
      fetchRequestInit: { mode: 'cors' },
      filter: (node: HTMLElement) => {
        // Exclude any node that might have oklch issues
        return true;
      },
    });
    return dataUrl;
  }, []);

  const triggerDownload = useCallback((dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDownloadJPG = useCallback(async () => {
    setIsGenerating(true);
    setGeneratingFormat('jpg');
    setShowFormatMenu(false);
    try {
      toast.info('Génération du JPG en cours...');
      const dataUrl = await captureImage('jpeg');
      if (!dataUrl) {
        toast.error('Erreur lors de la capture du diplôme');
        return;
      }
      triggerDownload(dataUrl, `${fileNameBase}.jpg`);
      toast.success('Diplôme JPG téléchargé !');
    } catch (err) {
      console.error('JPG download failed:', err);
      toast.error('Erreur lors du téléchargement JPG');
    } finally {
      setIsGenerating(false);
      setGeneratingFormat(null);
    }
  }, [captureImage, triggerDownload, fileNameBase]);

  const handleDownloadPDF = useCallback(async () => {
    setIsGenerating(true);
    setGeneratingFormat('pdf');
    setShowFormatMenu(false);
    try {
      toast.info('Génération du PDF en cours...');
      const dataUrl = await captureImage('jpeg');
      if (!dataUrl) {
        toast.error('Erreur lors de la capture du diplôme');
        return;
      }
      const { jsPDF } = await import('jspdf');
      // Create a temp image to get dimensions
      const img = new window.Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });
      const pdfWidth = 297; // mm A4 landscape
      const pdfHeight = (img.height / img.width) * pdfWidth;
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
    } finally {
      setIsGenerating(false);
      setGeneratingFormat(null);
    }
  }, [captureImage, fileNameBase]);

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
            disabled={isGenerating}
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'GÉNÉRATION...' : 'TÉLÉCHARGER'}
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
                  disabled={isGenerating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 16px',
                    background: generatingFormat === 'pdf' ? 'rgba(0,240,255,0.1)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(0,240,255,0.08)',
                    color: '#e2e8f0',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    letterSpacing: '1px',
                    cursor: isGenerating ? 'wait' : 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { if (!isGenerating) e.currentTarget.style.background = 'rgba(0,240,255,0.08)'; }}
                  onMouseLeave={(e) => { if (!isGenerating) e.currentTarget.style.background = 'transparent'; }}
                >
                  <FileText style={{ width: '18px', height: '18px', color: '#ff3366', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {generatingFormat === 'pdf' ? 'Génération...' : 'Format PDF'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                      Document haute qualité
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleDownloadJPG}
                  disabled={isGenerating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 16px',
                    background: generatingFormat === 'jpg' ? 'rgba(0,240,255,0.1)' : 'transparent',
                    border: 'none',
                    color: '#e2e8f0',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    letterSpacing: '1px',
                    cursor: isGenerating ? 'wait' : 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { if (!isGenerating) e.currentTarget.style.background = 'rgba(0,240,255,0.08)'; }}
                  onMouseLeave={(e) => { if (!isGenerating) e.currentTarget.style.background = 'transparent'; }}
                >
                  <ImageIcon style={{ width: '18px', height: '18px', color: '#00ff88', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {generatingFormat === 'jpg' ? 'Génération...' : 'Format JPG'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                      Image haute résolution
                    </div>
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

      {/* Diploma card — ALL inline styles, no Tailwind classes, to avoid oklch */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        style={{ width: '100%', maxWidth: '800px' }}
      >
        <div
          ref={diplomaRef}
          style={{
            width: '800px',
            minHeight: '580px',
            background: '#0a0a0f',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            color: '#e2e8f0',
          }}
        >
          {/* Background grid pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              pointerEvents: 'none',
            }}
          />

          {/* Corner accents */}
          {/* Top-left */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', width: '40px', height: '2px', background: '#00f0ff' }} />
          <div style={{ position: 'absolute', top: '12px', left: '12px', width: '2px', height: '40px', background: '#00f0ff' }} />
          {/* Top-right */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', width: '40px', height: '2px', background: '#00f0ff' }} />
          <div style={{ position: 'absolute', top: '12px', right: '12px', width: '2px', height: '40px', background: '#00f0ff' }} />
          {/* Bottom-left */}
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '40px', height: '2px', background: '#00f0ff' }} />
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '2px', height: '40px', background: '#00f0ff' }} />
          {/* Bottom-right */}
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '40px', height: '2px', background: '#00f0ff' }} />
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '2px', height: '40px', background: '#00f0ff' }} />

          {/* Outer border */}
          <div
            style={{
              position: 'absolute',
              top: '8px', left: '8px', right: '8px', bottom: '8px',
              border: '1px solid rgba(0,240,255,0.2)',
              pointerEvents: 'none',
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, padding: '36px 50px', textAlign: 'center' }}>
            {/* Logo STATERA */}
            <div style={{ marginBottom: '10px' }}>
              <img
                src={LOGO_URL}
                alt="STATERA"
                crossOrigin="anonymous"
                style={{
                  height: '30px',
                  width: 'auto',
                  margin: '0 auto',
                  display: 'block',
                  filter: 'drop-shadow(0 0 10px rgba(0,240,255,0.3))',
                }}
              />
            </div>

            {/* Header */}
            <div style={{ marginBottom: '4px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '6px',
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                Certification de Formation
              </div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  letterSpacing: '4px',
                  color: '#00f0ff',
                  textShadow: '0 0 20px rgba(0,240,255,0.4)',
                }}>STATERA</span>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  letterSpacing: '4px',
                  color: '#64748b',
                }}>_</span>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  letterSpacing: '4px',
                  color: '#00f0ff',
                  textShadow: '0 0 20px rgba(0,240,255,0.4)',
                }}>Academy</span>
              </div>
              <div style={{
                width: '200px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
                margin: '8px auto',
              }} />
            </div>

            {/* Diploma text */}
            <div style={{ marginBottom: '4px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '3px',
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                Décerne le présent diplôme à
              </div>

              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#e2e8f0',
                textShadow: '0 0 10px rgba(226,232,240,0.2)',
                marginBottom: '10px',
                fontFamily: "'Space Grotesk', 'JetBrains Mono', sans-serif",
                lineHeight: 1.2,
              }}>
                {userName || 'Agent Cyber'}
              </div>

              <div style={{
                width: '300px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #1e293b, transparent)',
                margin: '0 auto 10px',
              }} />

              <div style={{
                fontSize: '11px',
                color: '#94a3b8',
                lineHeight: 1.7,
                maxWidth: '500px',
                margin: '0 auto 14px',
              }}>
                Pour avoir complété avec succès l'ensemble du programme de<br />
                <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>Sensibilisation aux Risques Cyber en Entreprise</span><br />
                composé de {MODULES.length} modules de formation
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginBottom: '16px',
            }}>
              <div style={{
                border: '1px solid rgba(0,240,255,0.15)',
                padding: '8px 18px',
                minWidth: '110px',
                background: 'rgba(0,240,255,0.03)',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00f0ff', textShadow: '0 0 10px rgba(0,240,255,0.3)' }}>
                  {avgScore}%
                </div>
                <div style={{ fontSize: '8px', letterSpacing: '2px', color: '#64748b', marginTop: '3px' }}>
                  SCORE MOYEN
                </div>
              </div>
              <div style={{
                border: '1px solid rgba(0,255,136,0.15)',
                padding: '8px 18px',
                minWidth: '110px',
                background: 'rgba(0,255,136,0.03)',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.3)' }}>
                  {progress.totalXP}
                </div>
                <div style={{ fontSize: '8px', letterSpacing: '2px', color: '#64748b', marginTop: '3px' }}>
                  XP TOTAL
                </div>
              </div>
              <div style={{
                border: `1px solid ${level.color}25`,
                padding: '8px 18px',
                minWidth: '110px',
                background: `${level.color}08`,
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: level.color, textShadow: `0 0 10px ${level.color}50` }}>
                  Nv.{level.level}
                </div>
                <div style={{ fontSize: '8px', letterSpacing: '2px', color: '#64748b', marginTop: '3px' }}>
                  {level.title.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Modules completed */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}>
              {MODULES.map(mod => {
                const score = progress.moduleScores[mod.id];
                return (
                  <div
                    key={mod.id}
                    style={{
                      fontSize: '8px',
                      letterSpacing: '1px',
                      padding: '3px 8px',
                      border: `1px solid ${mod.color}30`,
                      color: mod.color,
                      background: `${mod.color}08`,
                    }}
                  >
                    {mod.title.toUpperCase()} — {score ?? 0}%
                  </div>
                );
              })}
            </div>

            {/* Expiration notice */}
            <div style={{
              marginBottom: '14px',
              padding: '6px 14px',
              border: '1px solid rgba(245,158,11,0.2)',
              background: 'rgba(245,158,11,0.04)',
              display: 'inline-block',
            }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#f59e0b' }}>
                VALIDE JUSQU'AU {expirationDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).toUpperCase()}
              </div>
              <div style={{ fontSize: '7px', color: '#92400e', marginTop: '2px', letterSpacing: '1px' }}>
                RENOUVELLEMENT REQUIS APRÈS 12 MOIS
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid #1e293b',
              paddingTop: '12px',
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '8px', color: '#64748b', letterSpacing: '1px' }}>DATE D'OBTENTION</div>
                <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '3px' }}>{today}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '8px',
                  color: '#64748b',
                  letterSpacing: '2px',
                }}>
                  N° {generateCertId(userName)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '8px', color: '#64748b', letterSpacing: '1px' }}>VALIDÉ PAR</div>
                <div style={{ fontSize: '11px', color: '#00f0ff', marginTop: '3px' }}>RSSI — STATERA Corp.</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
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
