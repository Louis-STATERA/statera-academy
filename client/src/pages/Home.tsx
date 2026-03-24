/*
 * Design: Neon Terminal / Cyberpunk
 * Home page: Hero section with mission control dashboard, module grid
 * Dark bg (#0a0a0f), cyan/green/magenta neon accents
 */
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useProgress } from '@/contexts/ProgressContext';
import { MODULES, getLevel, getNextLevel, BADGES } from '@/lib/moduleData';
import NavBar from '@/components/NavBar';
import { Clock, Zap, CheckCircle2, Lock, ChevronRight, Trophy, Star } from 'lucide-react';

const HERO_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/flat-hero-SrvxAUuUvmwFDM52thodcG.webp';

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center p-4 border border-border/40 bg-dark-surface/50" style={{ borderColor: `${color}30` }}>
      <span className="font-mono text-2xl font-bold" style={{ color, textShadow: `0 0 12px ${color}50` }}>{value}</span>
      <span className="text-[11px] font-mono text-muted-foreground tracking-wider mt-1">{label}</span>
    </div>
  );
}

export default function Home() {
  const { progress, isModuleCompleted, getModuleScore } = useProgress();
  const level = getLevel(progress.totalXP);
  const nextLevel = getNextLevel(progress.totalXP);
  const completedCount = progress.completedModules.length;
  const totalModules = MODULES.length;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-14 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative z-10 container pt-16 pb-12 sm:pt-20 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 max-w-12 bg-neon-cyan/50" />
              <span className="font-mono text-[11px] tracking-[0.2em] text-neon-cyan">PROGRAMME DE FORMATION</span>
              <div className="h-px flex-1 max-w-12 bg-neon-cyan/50" />
            </div>

            <h1 className="font-mono text-3xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
              Sensibilisation aux<br />
              <span className="text-neon-cyan text-glow-cyan">Risques Cyber</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
              6 missions interactives pour devenir le maillon fort de votre entreprise.
              Apprenez à détecter les menaces, adopter les bons réflexes et protéger vos données.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              <StatCard value={`${completedCount}/${totalModules}`} label="MISSIONS" color="#00f0ff" />
              <StatCard value={progress.totalXP} label="XP TOTAL" color="#00ff88" />
              <StatCard value={`Nv.${level.level}`} label={level.title.toUpperCase()} color={level.color} />
              <StatCard value={progress.badges.length} label="BADGES" color="#f59e0b" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="container py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-neon-cyan" style={{ boxShadow: '0 0 8px rgba(0,240,255,0.5)' }} />
          <h2 className="font-mono text-lg font-bold tracking-wider text-foreground">SÉLECTIONNEZ VOTRE MISSION</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((mod, index) => {
            const completed = isModuleCompleted(mod.id);
            const score = getModuleScore(mod.id);

            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link href={`/module/${mod.id}`}>
                  <div
                    className="group relative overflow-hidden border border-border/40 bg-dark-surface/60 hover:border-opacity-100 transition-all duration-300 cursor-pointer h-full"
                    style={{ borderColor: completed ? `${mod.color}50` : undefined }}
                  >
                    {/* Module image */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={mod.image}
                        alt={mod.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent" />

                      {/* Status badge */}
                      {completed && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-background/80 border border-neon-green/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" />
                          <span className="font-mono text-[10px] text-neon-green">{score}%</span>
                        </div>
                      )}

                      {/* Difficulty badge */}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-background/80 border border-border/40">
                        <span className="font-mono text-[10px] text-muted-foreground">{mod.difficulty}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">{mod.subtitle.split('—')[0]}</span>
                      </div>

                      <h3 className="font-mono text-base font-bold text-foreground mb-2 group-hover:text-neon-cyan transition-colors">
                        {mod.title}
                      </h3>

                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                        {mod.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                            <Clock className="w-3 h-3" /> {mod.duration}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[11px]" style={{ color: mod.color }}>
                            <Zap className="w-3 h-3" /> +{mod.xpReward} XP
                          </span>
                        </div>

                        <ChevronRight
                          className="w-4 h-4 text-muted-foreground group-hover:text-neon-cyan transition-all group-hover:translate-x-1"
                        />
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 transition-opacity duration-300"
                      style={{ background: mod.color, opacity: completed ? 1 : 0, boxShadow: `0 0 8px ${mod.color}60` }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: mod.color, boxShadow: `0 0 8px ${mod.color}60` }}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Key fact banner */}
      <section className="container pb-12">
        <div className="border border-neon-magenta/20 bg-dark-surface/40 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-magenta/50 to-transparent" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center border border-neon-magenta/30 bg-neon-magenta/5">
              <span className="font-mono text-2xl font-bold text-neon-magenta text-glow-magenta">!</span>
            </div>
            <div>
              <p className="font-mono text-sm text-neon-magenta mb-1 text-glow-magenta">LE SAVIEZ-VOUS ?</p>
              <p className="text-foreground text-base leading-relaxed">
                <strong className="text-neon-cyan">95%</strong> des incidents de cybersécurité impliquent une erreur humaine.
                La formation des collaborateurs est l'investissement le plus rentable en cybersécurité.
                <span className="text-muted-foreground text-sm ml-1">(Source : IBM / Verizon DBIR 2025)</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-muted-foreground tracking-wider">
            STATERA_Academy — Formation Cybersécurité 2026
          </span>
          <span className="font-mono text-[11px] text-muted-foreground/50">
            v1.0 // Micro-Learning Interactif
          </span>
        </div>
      </footer>
    </div>
  );
}
