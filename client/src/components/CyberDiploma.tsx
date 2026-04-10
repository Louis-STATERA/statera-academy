/*
 * Design: Neon Terminal / Cyberpunk
 * CyberDiploma: Lightweight overlay that displays the pre-generated diploma.
 * All heavy generation is done by diplomaGenerator.ts in the background.
 * Downloads are instant because the image is already cached.
 * When authenticated, also creates a diploma record and uploads to S3.
 */
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileText, Image as ImageIcon, Cloud, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type UserProgress, getLevel } from '@/lib/moduleData';
import { toast } from 'sonner';
import { drawPreview, downloadJPG, downloadPDF, isCached, preGenerate, getCachedJPGDataUrl } from '@/lib/diplomaGenerator';
import { trpc } from '@/lib/trpc';
import { useProgress } from '@/contexts/ProgressContext';

interface CyberDiplomaProps {
  userName: string;
  progress: UserProgress;
  onClose: () => void;
}

export default function CyberDiploma({ userName, progress, onClose }: CyberDiplomaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savedToCloud, setSavedToCloud] = useState(false);
  const { isAuthenticated } = useProgress();

  const createDiplomaMutation = trpc.diploma.create.useMutation();
  const uploadImageMutation = trpc.diploma.uploadImage.useMutation();

  // Draw preview on mount (lightweight, scale 2x)
  useEffect(() => {
    if (!canvasRef.current) return;
    drawPreview(canvasRef.current, userName, progress).then(() => setReady(true));
  }, [userName, progress]);

  // Ensure high-res is pre-generated in background
  useEffect(() => {
    if (!isCached(userName, progress)) {
      preGenerate(userName, progress);
    }
  }, [userName, progress]);

  // Auto-save to cloud when authenticated and diploma is ready
  useEffect(() => {
    if (!isAuthenticated || savedToCloud || !ready) return;
    
    const saveToCloud = async () => {
      try {
        const level = getLevel(progress.totalXP);
        const completedCount = progress.completedModules.length;
        const avgScore = completedCount > 0
          ? Math.round(Object.values(progress.moduleScores).reduce((a, b) => a + b, 0) / completedCount)
          : 0;

        // Create diploma record in DB
        const result = await createDiplomaMutation.mutateAsync({
          userName,
          avgScore,
          totalXP: progress.totalXP,
          levelNumber: level.level,
        });

        // Upload image to S3
        if (result.diploma) {
          // Ensure the diploma image is generated
          if (!isCached(userName, progress)) {
            await preGenerate(userName, progress);
          }
          const dataUrl = getCachedJPGDataUrl();
          if (dataUrl) {
            // Extract base64 data from data URL
            const base64Data = dataUrl.split(',')[1];
            if (base64Data) {
              await uploadImageMutation.mutateAsync({
                diplomaId: result.diploma.id,
                imageData: base64Data,
                format: 'jpg',
              });
            }
          }
          setSavedToCloud(true);
        }
      } catch (err) {
        console.warn('[Diploma] Failed to save to cloud:', err);
        // Non-blocking: diploma still works locally
      }
    };

    saveToCloud();
  }, [isAuthenticated, ready, savedToCloud]);

  const handleDownloadJPG = async () => {
    setShowFormatMenu(false);
    setDownloading(true);
    try {
      const ok = await downloadJPG(userName, progress);
      if (ok) toast.success('Diplôme JPG téléchargé !');
      else toast.error('Erreur lors de la génération');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du téléchargement JPG');
    }
    setDownloading(false);
  };

  const handleDownloadPDF = async () => {
    setShowFormatMenu(false);
    setDownloading(true);
    try {
      const ok = await downloadPDF(userName, progress);
      if (ok) toast.success('Diplôme PDF téléchargé !');
      else toast.error('Erreur lors de la génération');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du téléchargement PDF');
    }
    setDownloading(false);
  };

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
        {/* Cloud save indicator */}
        {isAuthenticated && (
          <div
            className="flex items-center gap-1.5 px-3 py-2 border"
            style={{
              borderColor: savedToCloud ? 'rgba(0,255,136,0.3)' : 'rgba(0,240,255,0.2)',
              background: savedToCloud ? 'rgba(0,255,136,0.05)' : 'rgba(0,240,255,0.05)',
            }}
          >
            {savedToCloud ? (
              <>
                <Check className="w-3.5 h-3.5 text-neon-green" />
                <span className="font-mono text-[10px] text-neon-green tracking-wider">CLOUD</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
                <span className="font-mono text-[10px] text-neon-cyan tracking-wider">SAUVEGARDE...</span>
              </>
            )}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <Button
            onClick={() => setShowFormatMenu(!showFormatMenu)}
            disabled={downloading}
            className="font-mono text-xs tracking-wider gap-2"
            style={{ background: '#00f0ff', color: '#0a0a0f', fontWeight: 'bold' }}
          >
            <Download className="w-4 h-4" />
            {downloading ? 'GÉNÉRATION...' : 'TÉLÉCHARGER'}
          </Button>

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
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                    padding: '14px 16px', background: 'transparent', border: 'none',
                    borderBottom: '1px solid rgba(0,240,255,0.08)', color: '#e2e8f0',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
                    letterSpacing: '1px', cursor: 'pointer', textAlign: 'left',
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
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                    padding: '14px 16px', background: 'transparent', border: 'none',
                    color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px', letterSpacing: '1px', cursor: 'pointer', textAlign: 'left',
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
        transition={{ delay: 0.15, type: 'spring', damping: 20 }}
        style={{ width: '100%', maxWidth: '800px', position: 'relative' }}
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
        {!ready && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#00f0ff', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px',
            background: '#0a0a0f',
          }}>
            Chargement du diplôme...
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
