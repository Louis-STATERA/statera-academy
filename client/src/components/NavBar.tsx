/*
 * Design: Neon Terminal / Cyberpunk
 * NavBar: Top navigation bar with glowing cyan accents, monospace branding
 */
import { Link, useLocation } from 'wouter';
import { useProgress } from '@/contexts/ProgressContext';
import { getLevel, getNextLevel } from '@/lib/moduleData';
import { Shield, User, Home } from 'lucide-react';

export default function NavBar() {
  const [location] = useLocation();
  const { progress } = useProgress();
  const level = getLevel(progress.totalXP);
  const nextLevel = getNextLevel(progress.totalXP);
  const xpProgress = nextLevel
    ? ((progress.totalXP - level.minXP) / (nextLevel.minXP - level.minXP)) * 100
    : 100;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50" style={{ background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="container flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/statera-blanc_c6b8b447.webp"
            alt="STATERA"
            className="h-5 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 6px rgba(0,240,255,0.4))' }}
          />
          <span className="font-mono font-bold text-sm tracking-wider text-neon-cyan text-glow-cyan hidden sm:inline">
            <span className="text-foreground/60">_Academy</span>
          </span>
        </Link>

        {/* Center nav links */}
        <div className="flex items-center gap-1">
          <Link href="/">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wide transition-colors ${location === '/' ? 'text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}>
              <Home className="w-3.5 h-3.5" />
              MISSIONS
            </span>
          </Link>
          <Link href="/profile">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wide transition-colors ${location === '/profile' ? 'text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}>
              <User className="w-3.5 h-3.5" />
              PROFIL
            </span>
          </Link>
        </div>

        {/* XP bar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className="font-mono text-[10px] tracking-wider" style={{ color: level.color }}>
              Nv.{level.level} {level.title}
            </span>
            <div className="w-24 h-1.5 bg-dark-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${xpProgress}%`, background: level.color, boxShadow: `0 0 8px ${level.color}60` }}
              />
            </div>
          </div>
          <div className="font-mono text-xs font-bold text-neon-green text-glow-green">
            {progress.totalXP} XP
          </div>
        </div>
      </div>
    </nav>
  );
}
