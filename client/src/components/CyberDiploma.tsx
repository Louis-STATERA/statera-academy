/*
 * Design: Neon Terminal / Cyberpunk
 * CyberDiploma: Full-screen diploma rendered via HTML/CSS with download as image
 * Triggered when all modules are completed
 * Includes STATERA logo and 12-month expiration date
 */
import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type UserProgress, MODULES, getLevel } from '@/lib/moduleData';

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/statera-blanc_c6b8b447.webp';

interface CyberDiplomaProps {
  userName: string;
  progress: UserProgress;
  onClose: () => void;
}

export default function CyberDiploma({ userName, progress, onClose }: CyberDiplomaProps) {
  const diplomaRef = useRef<HTMLDivElement>(null);

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

  const formatDate = (d: Date) => d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const today = formatDate(obtentionDate);
  const expiry = formatDate(expirationDate);

  const handleDownload = useCallback(async () => {
    const el = diplomaRef.current;
    if (!el) return;

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `Diplome_STATERA_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      window.print();
    }
  }, [userName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          onClick={handleDownload}
          className="font-mono text-xs tracking-wider gap-2"
          style={{ background: '#00f0ff', color: '#0a0a0f' }}
        >
          <Download className="w-4 h-4" /> TÉLÉCHARGER
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          size="icon"
          className="border-border/40"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Diploma card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        className="w-full max-w-[800px]"
      >
        <div
          ref={diplomaRef}
          style={{
            width: '800px',
            minHeight: '600px',
            background: '#0a0a0f',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
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
          <div style={{ position: 'absolute', top: 0, left: 0, width: '80px', height: '80px' }}>
            <div style={{ position: 'absolute', top: '12px', left: '12px', width: '40px', height: '2px', background: '#00f0ff' }} />
            <div style={{ position: 'absolute', top: '12px', left: '12px', width: '2px', height: '40px', background: '#00f0ff' }} />
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px' }}>
            <div style={{ position: 'absolute', top: '12px', right: '12px', width: '40px', height: '2px', background: '#00f0ff' }} />
            <div style={{ position: 'absolute', top: '12px', right: '12px', width: '2px', height: '40px', background: '#00f0ff' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '80px', height: '80px' }}>
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '40px', height: '2px', background: '#00f0ff' }} />
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '2px', height: '40px', background: '#00f0ff' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80px', height: '80px' }}>
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '40px', height: '2px', background: '#00f0ff' }} />
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '2px', height: '40px', background: '#00f0ff' }} />
          </div>

          {/* Outer border */}
          <div
            style={{
              position: 'absolute',
              inset: '8px',
              border: '1px solid rgba(0,240,255,0.2)',
              pointerEvents: 'none',
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, padding: '40px 56px', textAlign: 'center' }}>
            {/* Logo STATERA */}
            <div style={{ marginBottom: '12px' }}>
              <img
                src={LOGO_URL}
                alt="STATERA"
                crossOrigin="anonymous"
                style={{
                  height: '32px',
                  width: 'auto',
                  margin: '0 auto',
                  display: 'block',
                  filter: 'drop-shadow(0 0 10px rgba(0,240,255,0.3))',
                }}
              />
            </div>

            {/* Header */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '6px',
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                Certification de Formation
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                letterSpacing: '4px',
                color: '#00f0ff',
                textShadow: '0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(0,240,255,0.15)',
                marginBottom: '4px',
              }}>
                STATERA<span style={{ color: '#64748b' }}>_</span>Academy
              </div>
              <div style={{
                width: '200px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
                margin: '10px auto',
              }} />
            </div>

            {/* Diploma text */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{
                fontSize: '11px',
                letterSpacing: '3px',
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}>
                Décerne le présent diplôme à
              </div>

              <div style={{
                fontSize: '30px',
                fontWeight: 'bold',
                color: '#e2e8f0',
                textShadow: '0 0 10px rgba(226,232,240,0.2)',
                marginBottom: '14px',
                fontFamily: "'Space Grotesk', 'JetBrains Mono', sans-serif",
                lineHeight: 1.2,
              }}>
                {userName || 'Agent Cyber'}
              </div>

              <div style={{
                width: '300px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #1e293b, transparent)',
                margin: '0 auto 14px',
              }} />

              <div style={{
                fontSize: '11px',
                color: '#94a3b8',
                lineHeight: 1.7,
                maxWidth: '500px',
                margin: '0 auto 18px',
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
              gap: '24px',
              marginBottom: '20px',
            }}>
              <div style={{
                border: '1px solid rgba(0,240,255,0.15)',
                padding: '10px 20px',
                minWidth: '120px',
                background: 'rgba(0,240,255,0.03)',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00f0ff', textShadow: '0 0 10px rgba(0,240,255,0.3)' }}>
                  {avgScore}%
                </div>
                <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#64748b', marginTop: '4px' }}>
                  SCORE MOYEN
                </div>
              </div>
              <div style={{
                border: '1px solid rgba(0,255,136,0.15)',
                padding: '10px 20px',
                minWidth: '120px',
                background: 'rgba(0,255,136,0.03)',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.3)' }}>
                  {progress.totalXP}
                </div>
                <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#64748b', marginTop: '4px' }}>
                  XP TOTAL
                </div>
              </div>
              <div style={{
                border: `1px solid ${level.color}25`,
                padding: '10px 20px',
                minWidth: '120px',
                background: `${level.color}08`,
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: level.color, textShadow: `0 0 10px ${level.color}50` }}>
                  Nv.{level.level}
                </div>
                <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#64748b', marginTop: '4px' }}>
                  {level.title.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Modules completed list */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '20px',
            }}>
              {MODULES.map(mod => {
                const score = progress.moduleScores[mod.id];
                return (
                  <div
                    key={mod.id}
                    style={{
                      fontSize: '9px',
                      letterSpacing: '1px',
                      padding: '4px 10px',
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
              marginBottom: '16px',
              padding: '8px 16px',
              border: '1px solid rgba(245,158,11,0.2)',
              background: 'rgba(245,158,11,0.04)',
              display: 'inline-block',
            }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#f59e0b' }}>
                VALIDE JUSQU'AU {expirationDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).toUpperCase()}
              </div>
              <div style={{ fontSize: '8px', color: '#92400e', marginTop: '2px', letterSpacing: '1px' }}>
                RENOUVELLEMENT REQUIS APRÈS 12 MOIS
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid #1e293b',
              paddingTop: '14px',
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '1px' }}>DATE D'OBTENTION</div>
                <div style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '4px' }}>{today}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '9px',
                  color: '#64748b',
                  letterSpacing: '2px',
                }}>
                  N° {generateCertId(userName)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '1px' }}>VALIDÉ PAR</div>
                <div style={{ fontSize: '12px', color: '#00f0ff', marginTop: '4px' }}>RSSI — STATERA Corp.</div>
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
