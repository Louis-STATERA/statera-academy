import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { type UserProgress, getLevel, MODULES } from '@/lib/moduleData';
import { trpc } from '@/lib/trpc';

interface ProgressContextType {
  progress: UserProgress;
  completeModule: (moduleId: string, score: number, xpEarned: number) => void;
  resetProgress: () => void;
  getModuleScore: (moduleId: string) => number | null;
  isModuleCompleted: (moduleId: string) => boolean;
  isSyncing: boolean;
  isAuthenticated: boolean;
  userName: string | null;
}

const defaultProgress: UserProgress = {
  completedModules: [],
  moduleScores: {},
  totalXP: 0,
  currentLevel: 1,
  badges: [],
};

const STORAGE_KEY = 'statera-progress';

function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultProgress;
}

function saveProgressLocal(progress: UserProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // tRPC hooks
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const isAuthenticated = Boolean(meQuery.data);
  const userName = meQuery.data?.name ?? null;

  const serverProgress = trpc.progress.get.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const saveMutation = trpc.progress.save.useMutation();

  // Load from server on first auth
  const hasLoadedFromServer = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || hasLoadedFromServer.current) return;
    if (serverProgress.isLoading) return;

    hasLoadedFromServer.current = true;

    if (serverProgress.data) {
      const serverData = serverProgress.data as UserProgress;
      const localData = loadProgress();

      // Merge: take the one with more completed modules, or server if equal
      if (localData.completedModules.length > serverData.completedModules.length) {
        // Local has more progress, push to server
        setProgress(localData);
        debouncedSaveToServer(localData);
      } else {
        // Server has more or equal, use server
        setProgress(serverData);
        saveProgressLocal(serverData);
      }
    } else {
      // No server data, push local to server if there's progress
      const localData = loadProgress();
      if (localData.completedModules.length > 0) {
        debouncedSaveToServer(localData);
      }
    }
  }, [isAuthenticated, serverProgress.isLoading, serverProgress.data]);

  // Debounced save to server
  const debouncedSaveToServer = useCallback((data: UserProgress) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSyncing(true);
        await saveMutation.mutateAsync({
          completedModules: data.completedModules,
          moduleScores: data.moduleScores,
          totalXP: data.totalXP,
          badges: data.badges,
        });
      } catch (err) {
        console.warn('[Progress] Failed to sync to server:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 1000);
  }, [saveMutation]);

  // Save locally on every change
  useEffect(() => {
    saveProgressLocal(progress);
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
        'rgpd': 'rgpd-guardian',
      };
      if (moduleBadgeMap[moduleId] && !newBadges.includes(moduleBadgeMap[moduleId])) {
        newBadges.push(moduleBadgeMap[moduleId]);
      }
      const allModuleIds = MODULES.map(m => m.id);
      const allCompleted = allModuleIds.every(id => newCompleted.includes(id));
      const allAbove80 = allModuleIds.every(id => (newScores[id] || 0) >= 80);
      if (!newBadges.includes('cyber-sentinel') && allCompleted && allAbove80) {
        newBadges.push('cyber-sentinel');
      }

      const newProgress: UserProgress = {
        completedModules: newCompleted,
        moduleScores: newScores,
        totalXP: newXP,
        currentLevel: newLevel,
        badges: newBadges,
      };

      // Sync to server if authenticated
      if (isAuthenticated) {
        debouncedSaveToServer(newProgress);
      }

      return newProgress;
    });
  }, [isAuthenticated, debouncedSaveToServer]);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
    if (isAuthenticated) {
      debouncedSaveToServer(defaultProgress);
    }
  }, [isAuthenticated, debouncedSaveToServer]);

  const getModuleScore = useCallback((moduleId: string) => {
    return progress.moduleScores[moduleId] ?? null;
  }, [progress.moduleScores]);

  const isModuleCompleted = useCallback((moduleId: string) => {
    return progress.completedModules.includes(moduleId);
  }, [progress.completedModules]);

  return (
    <ProgressContext.Provider value={{
      progress,
      completeModule,
      resetProgress,
      getModuleScore,
      isModuleCompleted,
      isSyncing,
      isAuthenticated,
      userName,
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
}
