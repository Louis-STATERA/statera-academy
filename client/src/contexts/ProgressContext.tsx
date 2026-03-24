import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { type UserProgress, getLevel, BADGES, MODULES } from '@/lib/moduleData';

interface ProgressContextType {
  progress: UserProgress;
  completeModule: (moduleId: string, score: number, xpEarned: number) => void;
  resetProgress: () => void;
  getModuleScore: (moduleId: string) => number | null;
  isModuleCompleted: (moduleId: string) => boolean;
}

const defaultProgress: UserProgress = {
  completedModules: [],
  moduleScores: {},
  totalXP: 0,
  currentLevel: 1,
  badges: [],
};

const STORAGE_KEY = 'cybersafe-progress';

function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultProgress;
}

function saveProgress(progress: UserProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const completeModule = useCallback((moduleId: string, score: number, xpEarned: number) => {
    setProgress(prev => {
      const newCompleted = prev.completedModules.includes(moduleId)
        ? prev.completedModules
        : [...prev.completedModules, moduleId];
      
      const newScores = { ...prev.moduleScores, [moduleId]: Math.max(score, prev.moduleScores[moduleId] || 0) };
      const newXP = prev.totalXP + xpEarned;
      const newLevel = getLevel(newXP).level;

      // Calculate badges
      const newBadges = [...prev.badges];
      if (!newBadges.includes('first-mission') && newCompleted.length >= 1) {
        newBadges.push('first-mission');
      }
      if (!newBadges.includes('perfect-score') && score === 100) {
        newBadges.push('perfect-score');
      }
      const moduleBadgeMap: Record<string, string> = {
        'phishing': 'phishing-expert',
        'passwords': 'password-master',
        'ransomware': 'ransomware-ready',
        'shadow-ai': 'ai-aware',
        'remote-work': 'road-warrior',
      };
      if (moduleBadgeMap[moduleId] && !newBadges.includes(moduleBadgeMap[moduleId])) {
        newBadges.push(moduleBadgeMap[moduleId]);
      }
      // Cyber sentinel: all modules completed with 80%+
      const allModuleIds = MODULES.map(m => m.id);
      const allCompleted = allModuleIds.every(id => newCompleted.includes(id));
      const allAbove80 = allModuleIds.every(id => (newScores[id] || 0) >= 80);
      if (!newBadges.includes('cyber-sentinel') && allCompleted && allAbove80) {
        newBadges.push('cyber-sentinel');
      }

      return {
        completedModules: newCompleted,
        moduleScores: newScores,
        totalXP: newXP,
        currentLevel: newLevel,
        badges: newBadges,
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getModuleScore = useCallback((moduleId: string) => {
    return progress.moduleScores[moduleId] ?? null;
  }, [progress.moduleScores]);

  const isModuleCompleted = useCallback((moduleId: string) => {
    return progress.completedModules.includes(moduleId);
  }, [progress.completedModules]);

  return (
    <ProgressContext.Provider value={{ progress, completeModule, resetProgress, getModuleScore, isModuleCompleted }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
}
