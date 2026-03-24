/*
 * Design: Neon Terminal / Cyberpunk
 * Profile page: User progression, badges, stats dashboard
 */
import { motion } from 'framer-motion';
import { useProgress } from '@/contexts/ProgressContext';
import { MODULES, BADGES, LEVELS, getLevel, getNextLevel } from '@/lib/moduleData';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap, Target, Shield, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';

export default function ProfilePage() {
  const { progress, resetProgress } = useProgress();
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

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

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
