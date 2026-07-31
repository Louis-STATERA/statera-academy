/*
 * Design: Neon Terminal / Cyberpunk
 * Profile page: User progression, badges, stats dashboard
 * + Save & send progress report to RSSI
 * + Backend integration: auth user name, diploma upload to S3
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@/contexts/ProgressContext';
import { MODULES, BADGES, LEVELS, getLevel, getNextLevel } from '@/lib/moduleData';
import { generateReport, downloadReport, downloadReportHTML, formatReportText } from '@/lib/progressReport';
import { exportReportAndShowInstructions, RSSI_EMAIL } from '@/lib/reportImage';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap, Target, Shield, RotateCcw, CheckCircle2, Image as ImageIcon, Download, FileText, Send, User, X, Award, GraduationCap, Cloud, CloudOff, LogIn } from 'lucide-react';
import CyberDiploma from '@/components/CyberDiploma';
import { preGenerate } from '@/lib/diplomaGenerator';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';

export default function ProfilePage() {
  const { progress, resetProgress, isAuthenticated, userName: authUserName } = useProgress();
  const [showDiploma, setShowDiploma] = useState(false);
  const [exportingReport, setExportingReport] = useState(false);

  // Use auth name if available, otherwise fall back to localStorage
  const [localName, setLocalName] = useState(() => {
    try { return localStorage.getItem('statera-username') || ''; } catch { return ''; }
  });
  const [nameInput, setNameInput] = useState(authUserName || localName);

  // Effective user name: auth name takes priority
  const userName = authUserName || localName;

  // Update nameInput when auth name loads
  useEffect(() => {
    if (authUserName && !nameInput) {
      setNameInput(authUserName);
    }
  }, [authUserName]);

  // tRPC mutations for backend integration
  const reportUploadMutation = trpc.report.upload.useMutation();

  const level = getLevel(progress.totalXP);
  const nextLevel = getNextLevel(progress.totalXP);
  const xpForNext = nextLevel ? nextLevel.minXP - progress.totalXP : 0;
  const xpProgress = nextLevel
    ? ((progress.totalXP - level.minXP) / (nextLevel.minXP - level.minXP)) * 100
    : 100;

  const completedCount = progress.completedModules.length;
  const totalModules = MODULES.length;
  const avgScore = completedCount > 0
    ? Math.round(Object.values(progress.moduleScores).reduce((a, b) => a + b, 0) / completedCount)
    : 0;

  const handleSaveName = () => {
    if (!nameInput.trim()) {
      toast.error('Veuillez entrer votre nom et prénom');
      return;
    }
    const name = nameInput.trim();
    setLocalName(name);
    try { localStorage.setItem('statera-username', name); } catch {}
    toast.success('Nom enregistré');
    // Pre-generate diploma in background (non-blocking)
    if (completedCount === totalModules) {
      preGenerate(name, progress);
    }
  };

  // Auto pre-generate when all modules are completed and name is set
  useEffect(() => {
    if (userName && completedCount === totalModules) {
      preGenerate(userName, progress);
    }
  }, [userName, completedCount, totalModules, progress]);

  /**
   * Generate the report as a JPG image, download it, then open a window
   * with instructions for emailing it to the RSSI.
   */
  const handleGenerateReportJPG = async () => {
    if (!userName) {
      toast.error('Veuillez d\'abord enregistrer votre nom');
      return;
    }

    setExportingReport(true);
    const report = generateReport(progress, userName);

    try {
      const { popupBlocked } = await exportReportAndShowInstructions(report);

      if (popupBlocked) {
        toast.warning(
          `Rapport JPG téléchargé. Autorisez les fenêtres pop-up pour voir les instructions d'envoi, ou envoyez-le à ${RSSI_EMAIL}`,
          { duration: 8000 },
        );
      } else {
        toast.success('Rapport JPG téléchargé — suivez les instructions dans le nouvel onglet');
      }
    } catch (err) {
      console.error('[Report] JPG generation failed:', err);
      toast.error('La génération du rapport JPG a échoué');
      setExportingReport(false);
      return;
    }

    // Best-effort cloud archive (never blocks the user flow)
    try {
      await reportUploadMutation.mutateAsync({
        content: formatReportText(report),
        userName,
        format: 'txt',
      });
    } catch (err) {
      console.warn('[Report] Failed to archive report in cloud:', err);
    }

    setExportingReport(false);
  };

  const handleDownloadTxt = async () => {
    if (!userName) {
      toast.error('Veuillez d\'abord enregistrer votre nom');
      return;
    }
    const report = generateReport(progress, userName);
    downloadReport(report);
    toast.success('Rapport téléchargé au format texte');

    // Also upload to S3 if authenticated
    if (isAuthenticated) {
      try {
        await reportUploadMutation.mutateAsync({
          content: formatReportText(report),
          userName,
          format: 'txt',
        });
      } catch (err) {
        console.warn('[Report] Failed to upload to cloud:', err);
      }
    }
  };

  const handleDownloadHTML = async () => {
    if (!userName) {
      toast.error('Veuillez d\'abord enregistrer votre nom');
      return;
    }
    const report = generateReport(progress, userName);
    downloadReportHTML(report);
    toast.success('Rapport téléchargé au format HTML');

    // Also upload to S3 if authenticated
    if (isAuthenticated) {
      try {
        const { formatReportHTML } = await import('@/lib/progressReport');
        const htmlContent = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Rapport STATERA_Academy — ${report.userName}</title></head><body style="margin:0;padding:20px;background:#0a0a0f;">${formatReportHTML(report)}</body></html>`;
        await reportUploadMutation.mutateAsync({
          content: htmlContent,
          userName,
          format: 'html',
        });
      } catch (err) {
        console.warn('[Report] Failed to upload HTML to cloud:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Diploma overlay */}
      <AnimatePresence>
        {showDiploma && (
          <CyberDiploma
            userName={userName}
            progress={progress}
            onClose={() => setShowDiploma(false)}
          />
        )}
      </AnimatePresence>

      <div className="container pt-20 pb-12">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-neon-cyan" style={{ boxShadow: '0 0 8px rgba(0,240,255,0.5)' }} />
              <h1 className="font-mono text-xl font-bold tracking-wider text-foreground">PROFIL AGENT</h1>
            </div>

            {/* Auth status banner */}
            {!isAuthenticated && (
              <div className="border border-amber-500/20 bg-amber-500/5 p-3 mb-4">
                <div className="flex items-center gap-3">
                  <CloudOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-mono text-xs text-amber-400">
                      Mode local — Votre progression est sauvegardée uniquement sur cet appareil.
                    </p>
                    <p className="font-mono text-[10px] text-amber-400/60 mt-1">
                      Connectez-vous pour synchroniser votre progression dans le cloud.
                    </p>
                  </div>
                  <a
                    href={getLoginUrl()}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-neon-cyan/30 text-neon-cyan font-mono text-[11px] tracking-wider hover:bg-neon-cyan/10 transition-colors flex-shrink-0"
                  >
                    <LogIn className="w-3 h-3" /> CONNEXION
                  </a>
                </div>
              </div>
            )}

            {isAuthenticated && (
              <div className="border border-neon-green/20 bg-neon-green/5 p-3 mb-4">
                <div className="flex items-center gap-3">
                  <Cloud className="w-4 h-4 text-neon-green flex-shrink-0" />
                  <p className="font-mono text-xs text-neon-green">
                    Connecté{userName ? ` — ${userName}` : ''} • Progression synchronisée dans le cloud
                  </p>
                </div>
              </div>
            )}

            {/* User name input */}
            <div className="border border-border/30 bg-dark-surface/40 p-4 mb-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
                    placeholder="Entrez votre nom et prénom..."
                    className="flex-1 bg-transparent border border-border/30 px-3 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-neon-cyan/50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveName}
                    className="font-mono text-[11px] tracking-wider border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> ENREGISTRER
                  </Button>
                </div>
              </div>
              {userName && (
                <div className="mt-2 ml-7 font-mono text-xs text-muted-foreground">
                  Identifié comme : <span className="text-neon-cyan">{userName}</span>
                </div>
              )}
            </div>

            {/* Level display */}
            <div className="border border-border/30 bg-dark-surface/40 p-6 mb-6">
              <div className="flex items-center gap-6">
                <div
                  className="w-20 h-20 flex items-center justify-center border-2 flex-shrink-0"
                  style={{ borderColor: level.color, boxShadow: `0 0 20px ${level.color}40` }}
                >
                  <div className="text-center">
                    <div className="font-mono text-2xl font-bold" style={{ color: level.color }}>{level.level}</div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-mono text-lg font-bold text-foreground mb-1">{level.title}</div>
                  <div className="font-mono text-sm text-muted-foreground mb-3">
                    {progress.totalXP} XP {nextLevel && `— ${xpForNext} XP pour le niveau suivant`}
                  </div>
                  <div className="w-full h-2 bg-dark-base rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: level.color, boxShadow: `0 0 10px ${level.color}60` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="border border-border/30 bg-dark-surface/40 p-4 text-center">
                <Target className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
                <div className="font-mono text-xl font-bold text-foreground">{completedCount}/{totalModules}</div>
                <div className="font-mono text-[10px] text-muted-foreground tracking-wider">MISSIONS</div>
              </div>
              <div className="border border-border/30 bg-dark-surface/40 p-4 text-center">
                <Zap className="w-5 h-5 text-neon-green mx-auto mb-2" />
                <div className="font-mono text-xl font-bold text-foreground">{progress.totalXP}</div>
                <div className="font-mono text-[10px] text-muted-foreground tracking-wider">XP TOTAL</div>
              </div>
              <div className="border border-border/30 bg-dark-surface/40 p-4 text-center">
                <Trophy className="w-5 h-5 text-neon-amber mx-auto mb-2" style={{ color: '#f59e0b' }} />
                <div className="font-mono text-xl font-bold text-foreground">{avgScore}%</div>
                <div className="font-mono text-[10px] text-muted-foreground tracking-wider">SCORE MOYEN</div>
              </div>
              <div className="border border-border/30 bg-dark-surface/40 p-4 text-center">
                <Shield className="w-5 h-5 text-neon-magenta mx-auto mb-2" />
                <div className="font-mono text-xl font-bold text-foreground">{progress.badges.length}</div>
                <div className="font-mono text-[10px] text-muted-foreground tracking-wider">BADGES</div>
              </div>
            </div>
          </motion.div>

          {/* Send / Save Progress Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-10"
          >
            <div className="border border-neon-cyan/30 bg-dark-surface/40 p-5" style={{ boxShadow: '0 0 15px rgba(0,240,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-4 h-4 text-neon-cyan" />
                <h2 className="font-mono text-sm font-bold tracking-wider text-foreground">SAUVEGARDER & ENVOYER MA PROGRESSION</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Générez votre rapport de progression en image (JPG) à transmettre au RSSI (<span className="text-neon-cyan font-mono text-xs">{RSSI_EMAIL}</span>) pour attester de votre formation, ou téléchargez-le en texte/HTML pour vos archives personnelles.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Generate JPG report + send instructions */}
                <button
                  onClick={handleGenerateReportJPG}
                  disabled={exportingReport}
                  className="flex items-center gap-3 p-4 border border-neon-cyan/20 bg-neon-cyan/5 hover:bg-neon-cyan/10 hover:border-neon-cyan/40 transition-all group cursor-pointer disabled:opacity-50"
                >
                  <div className="w-10 h-10 flex items-center justify-center border border-neon-cyan/30 flex-shrink-0" style={{ boxShadow: '0 0 10px rgba(0,240,255,0.15)' }}>
                    <ImageIcon className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div className="text-left">
                    <div className="font-mono text-xs font-bold text-foreground tracking-wider group-hover:text-neon-cyan transition-colors">
                      {exportingReport ? 'GÉNÉRATION...' : 'RAPPORT JPG + ENVOI'}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Image + instructions RSSI
                    </div>
                  </div>
                </button>

                {/* Download TXT */}
                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-3 p-4 border border-neon-green/20 bg-neon-green/5 hover:bg-neon-green/10 hover:border-neon-green/40 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 flex items-center justify-center border border-neon-green/30 flex-shrink-0" style={{ boxShadow: '0 0 10px rgba(0,255,136,0.15)' }}>
                    <FileText className="w-5 h-5 text-neon-green" />
                  </div>
                  <div className="text-left">
                    <div className="font-mono text-xs font-bold text-foreground tracking-wider group-hover:text-neon-green transition-colors">RAPPORT TEXTE</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Télécharger .txt</div>
                  </div>
                </button>

                {/* Download HTML */}
                <button
                  onClick={handleDownloadHTML}
                  className="flex items-center gap-3 p-4 border border-neon-magenta/20 bg-neon-magenta/5 hover:bg-neon-magenta/10 hover:border-neon-magenta/40 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 flex items-center justify-center border border-neon-magenta/30 flex-shrink-0" style={{ boxShadow: '0 0 10px rgba(255,0,102,0.15)' }}>
                    <Download className="w-5 h-5 text-neon-magenta" />
                  </div>
                  <div className="text-left">
                    <div className="font-mono text-xs font-bold text-foreground tracking-wider group-hover:text-neon-magenta transition-colors">RAPPORT HTML</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Télécharger .html</div>
                  </div>
                </button>
              </div>

              {!userName && (
                <div className="mt-4 p-3 border border-amber-500/30 bg-amber-500/5">
                  <p className="font-mono text-xs text-amber-400">
                    &#9888; Veuillez d'abord enregistrer votre nom en haut de la page pour générer votre rapport.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Diploma section - visible when all modules completed */}
          {completedCount === totalModules && completedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-10"
            >
              <div
                className="border border-neon-cyan/40 p-6 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.06) 0%, rgba(0,255,136,0.04) 50%, rgba(255,0,102,0.04) 100%)',
                  boxShadow: '0 0 30px rgba(0,240,255,0.08)',
                }}
              >
                <GraduationCap className="w-10 h-10 text-neon-cyan mx-auto mb-3" style={{ filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.5))' }} />
                <h2 className="font-mono text-lg font-bold text-neon-cyan text-glow-cyan mb-2 tracking-wider">
                  FORMATION COMPLÈTE !
                </h2>
                <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                  Félicitations ! Vous avez terminé l'ensemble du programme de sensibilisation cyber STATERA_Academy.
                  Téléchargez votre diplôme officiel ci-dessous.
                </p>
                <Button
                  onClick={() => setShowDiploma(true)}
                  className="font-mono tracking-wider gap-2 px-8 py-5 text-base"
                  style={{
                    background: 'linear-gradient(135deg, #00f0ff, #00ff88)',
                    color: '#0a0a0f',
                    boxShadow: '0 0 25px rgba(0,240,255,0.3)',
                  }}
                >
                  <Award className="w-5 h-5" /> OBTENIR MON DIPLÔME
                </Button>
              </div>
            </motion.div>
          )}

          {/* Modules progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="font-mono text-sm font-bold tracking-wider text-foreground mb-4">PROGRESSION DES MISSIONS</h2>
            <div className="space-y-2">
              {MODULES.map(mod => {
                const score = progress.moduleScores[mod.id];
                const completed = progress.completedModules.includes(mod.id);
                return (
                  <Link key={mod.id} href={`/module/${mod.id}`}>
                    <div className="flex items-center gap-4 p-3 border border-border/20 bg-dark-surface/30 hover:border-border/40 transition-colors cursor-pointer">
                      <img src={mod.image} alt="" className="w-10 h-10 object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-foreground truncate">{mod.title}</span>
                          {completed && <CheckCircle2 className="w-3.5 h-3.5 text-neon-green flex-shrink-0" />}
                        </div>
                        <div className="w-full h-1 bg-dark-base rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: completed ? '100%' : '0%',
                              background: mod.color,
                              boxShadow: `0 0 6px ${mod.color}40`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold flex-shrink-0" style={{ color: completed ? mod.color : '#64748b' }}>
                        {score !== undefined ? `${score}%` : '—'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="font-mono text-sm font-bold tracking-wider text-foreground mb-4">BADGES COLLECTÉS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BADGES.map(badge => {
                const earned = progress.badges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`border p-4 text-center transition-all ${earned ? 'border-neon-cyan/30 bg-neon-cyan/5' : 'border-border/20 bg-dark-surface/20 opacity-40'}`}
                  >
                    <span className="text-2xl block mb-2">{badge.icon}</span>
                    <div className="font-mono text-xs font-bold text-foreground mb-1">{badge.title}</div>
                    <div className="text-[11px] text-muted-foreground">{badge.description}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Level roadmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <h2 className="font-mono text-sm font-bold tracking-wider text-foreground mb-4">GRADES</h2>
            <div className="flex flex-wrap gap-3">
              {LEVELS.map(l => {
                const isActive = level.level >= l.level;
                return (
                  <div
                    key={l.level}
                    className={`flex items-center gap-2 px-4 py-2 border ${isActive ? '' : 'opacity-30'}`}
                    style={{ borderColor: isActive ? l.color : undefined }}
                  >
                    <span className="font-mono text-lg font-bold" style={{ color: l.color }}>{l.level}</span>
                    <div>
                      <div className="font-mono text-xs font-bold" style={{ color: isActive ? l.color : undefined }}>{l.title}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{l.minXP} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Reset */}
          <div className="border-t border-border/20 pt-6">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir réinitialiser toute votre progression ?')) {
                  resetProgress();
                }
              }}
              className="font-mono text-xs tracking-wider text-muted-foreground border-border/30"
            >
              <RotateCcw className="w-3 h-3 mr-2" /> RÉINITIALISER LA PROGRESSION
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
