/*
 * Design: Neon Terminal / Cyberpunk
 * Module page: Learning content + interactive quiz with immediate feedback
 * Phases: Briefing → Learning → Quiz → Debrief (+ Diploma if all completed)
 */
import { useState, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@/contexts/ProgressContext';
import { MODULES, type QuizQuestion } from '@/lib/moduleData';
import NavBar from '@/components/NavBar';
import CyberDiploma from '@/components/CyberDiploma';
import { ArrowLeft, ChevronRight, CheckCircle2, XCircle, Zap, Target, BookOpen, Award, RotateCcw, Home, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type Phase = 'briefing' | 'learning' | 'quiz' | 'debrief';

export default function ModulePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { progress, completeModule, getModuleScore } = useProgress();

  const mod = useMemo(() => MODULES.find(m => m.id === id), [id]);

  const [phase, setPhase] = useState<Phase>('briefing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showDiploma, setShowDiploma] = useState(false);

  // Get user name from localStorage
  const userName = (() => {
    try { return localStorage.getItem('statera-username') || ''; } catch { return ''; }
  })();

  if (!mod) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <NavBar />
        <div className="text-center pt-14">
          <p className="font-mono text-neon-magenta text-glow-magenta text-lg mb-4">MODULE INTROUVABLE</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" /> Retour aux missions
          </Button>
        </div>
      </div>
    );
  }

  const question = mod.questions[currentQuestion];
  const totalQuestions = mod.questions.length;
  const correctCount = Object.values(answers).filter(Boolean).length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const previousBest = getModuleScore(mod.id);

  // Check if all modules will be completed after this one
  const allModuleIds = MODULES.map(m => m.id);
  const willCompleteAll = allModuleIds.every(
    mId => mId === mod.id || progress.completedModules.includes(mId)
  );

  function handleSelectAnswer(optionId: string) {
    if (showExplanation) return;
    setSelectedAnswer(optionId);
  }

  function handleConfirm() {
    if (!selectedAnswer || !question) return;
    const isCorrect = question.options.find(o => o.id === selectedAnswer)?.isCorrect || false;
    setAnswers(prev => ({ ...prev, [question.id]: isCorrect }));
    setShowExplanation(true);
  }

  function handleNext() {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz complete
      const finalCorrect = Object.values({ ...answers }).filter(Boolean).length;
      const finalScore = Math.round((finalCorrect / totalQuestions) * 100);
      const xpEarned = Math.round((mod?.xpReward ?? 0) * (finalScore / 100));
      completeModule(mod?.id ?? '', finalScore, xpEarned);
      setPhase('debrief');
    }
  }

  function handleRetry() {
    setPhase('quiz');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers({});
  }

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

      <div className="pt-14">
        {/* Top bar with module info */}
        <div className="border-b border-border/30 bg-dark-surface/40">
          <div className="container flex items-center gap-3 py-3">
            <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border/40" />
            <span className="font-mono text-[11px] tracking-wider text-muted-foreground">{mod.subtitle}</span>
            <div className="flex-1" />
            {phase === 'quiz' && (
              <span className="font-mono text-[11px] text-neon-cyan">
                Question {currentQuestion + 1}/{totalQuestions}
              </span>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ============ BRIEFING PHASE ============ */}
          {phase === 'briefing' && (
            <motion.div
              key="briefing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container py-8 sm:py-12"
            >
              <div className="max-w-3xl mx-auto">
                {/* Hero image */}
                <div className="relative h-48 sm:h-64 mb-8 overflow-hidden border border-border/30">
                  <img src={mod.image} alt={mod.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h1 className="font-mono text-2xl sm:text-3xl font-bold text-foreground mb-1">{mod.title}</h1>
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                  </div>
                </div>

                {/* Key fact */}
                <div className="border border-neon-cyan/20 bg-neon-cyan/5 p-5 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 font-mono text-3xl font-bold text-neon-cyan text-glow-cyan">
                      {mod.keyFact.stat}
                    </div>
                    <p className="text-foreground text-sm leading-relaxed pt-1">{mod.keyFact.description}</p>
                  </div>
                </div>

                {/* Module info */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="flex items-center gap-2 p-3 border border-border/30 bg-dark-surface/40">
                    <BookOpen className="w-4 h-4 text-neon-cyan" />
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground">DURÉE</div>
                      <div className="font-mono text-sm text-foreground">{mod.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border border-border/30 bg-dark-surface/40">
                    <Target className="w-4 h-4 text-neon-green" />
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground">QUESTIONS</div>
                      <div className="font-mono text-sm text-foreground">{totalQuestions}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border border-border/30 bg-dark-surface/40">
                    <Zap className="w-4 h-4 text-neon-magenta" />
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground">RÉCOMPENSE</div>
                      <div className="font-mono text-sm text-foreground">+{mod.xpReward} XP</div>
                    </div>
                  </div>
                </div>

                {previousBest !== null && (
                  <div className="mb-6 p-3 border border-neon-green/20 bg-neon-green/5">
                    <span className="font-mono text-sm text-neon-green">
                      Meilleur score précédent : {previousBest}%
                    </span>
                  </div>
                )}

                <Button
                  onClick={() => setPhase('learning')}
                  className="w-full font-mono tracking-wider py-6 text-base"
                  style={{ background: mod.color, color: '#0a0a0f', boxShadow: `0 0 20px ${mod.color}40` }}
                >
                  COMMENCER LE BRIEFING <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ============ LEARNING PHASE ============ */}
          {phase === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="container py-8 sm:py-12"
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-5 h-5 text-neon-cyan" />
                  <h2 className="font-mono text-lg font-bold text-foreground tracking-wider">BRIEFING DE MISSION</h2>
                </div>

                <div className="space-y-4 mb-10">
                  {mod.learningPoints.map((point, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="border border-border/30 bg-dark-surface/40 p-5 hover:border-neon-cyan/20 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-2xl flex-shrink-0 mt-0.5">{point.icon}</span>
                        <div>
                          <h3 className="font-mono text-sm font-bold text-foreground mb-1.5" style={{ color: mod.color }}>
                            {point.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button
                  onClick={() => setPhase('quiz')}
                  className="w-full font-mono tracking-wider py-6 text-base"
                  style={{ background: mod.color, color: '#0a0a0f', boxShadow: `0 0 20px ${mod.color}40` }}
                >
                  LANCER L'ÉVALUATION <Target className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ============ QUIZ PHASE ============ */}
          {phase === 'quiz' && question && (
            <motion.div
              key={`quiz-${currentQuestion}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="container py-8 sm:py-12"
            >
              <div className="max-w-3xl mx-auto">
                {/* Progress bar */}
                <div className="mb-8">
                  <Progress
                    value={((currentQuestion) / totalQuestions) * 100}
                    className="h-1.5 bg-dark-surface"
                  />
                </div>

                {/* Difficulty badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`font-mono text-[10px] tracking-wider px-2 py-0.5 border ${
                    question.difficulty === 'easy' ? 'border-neon-green/30 text-neon-green' :
                    question.difficulty === 'medium' ? 'border-neon-amber/30 text-neon-amber' :
                    'border-neon-magenta/30 text-neon-magenta'
                  }`}>
                    {question.difficulty === 'easy' ? 'FACILE' : question.difficulty === 'medium' ? 'INTERMÉDIAIRE' : 'AVANCÉ'}
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                    {question.type === 'true-false' ? 'VRAI / FAUX' : question.type === 'scenario' ? 'SCÉNARIO' : 'QCM'}
                  </span>
                </div>

                {/* Question */}
                <h2 className="font-mono text-lg font-bold text-foreground mb-2 leading-relaxed">
                  {question.question}
                </h2>

                {question.context && (
                  <div className="border-l-2 border-neon-cyan/30 pl-4 mb-6">
                    <p className="text-sm text-muted-foreground italic leading-relaxed">{question.context}</p>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {question.options.map((option) => {
                    const isSelected = selectedAnswer === option.id;
                    const isCorrect = option.isCorrect;
                    let borderColor = 'border-border/30';
                    let bgColor = 'bg-dark-surface/40';

                    if (showExplanation) {
                      if (isCorrect) {
                        borderColor = 'border-neon-green/50';
                        bgColor = 'bg-neon-green/10';
                      } else if (isSelected && !isCorrect) {
                        borderColor = 'border-neon-magenta/50';
                        bgColor = 'bg-neon-magenta/10';
                      }
                    } else if (isSelected) {
                      borderColor = 'border-neon-cyan/50';
                      bgColor = 'bg-neon-cyan/5';
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelectAnswer(option.id)}
                        disabled={showExplanation}
                        className={`w-full text-left border ${borderColor} ${bgColor} p-4 transition-all ${!showExplanation ? 'hover:border-neon-cyan/30' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`font-mono text-sm font-bold flex-shrink-0 mt-0.5 ${
                            showExplanation && isCorrect ? 'text-neon-green' :
                            showExplanation && isSelected && !isCorrect ? 'text-neon-magenta' :
                            isSelected ? 'text-neon-cyan' : 'text-muted-foreground'
                          }`}>
                            {option.id.toUpperCase()}.
                          </span>
                          <span className="text-sm text-foreground leading-relaxed">{option.text}</span>
                          {showExplanation && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0 ml-auto" />
                          )}
                          {showExplanation && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-neon-magenta flex-shrink-0 ml-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <div className={`p-4 border ${answers[question.id] ? 'border-neon-green/30 bg-neon-green/5' : 'border-neon-magenta/30 bg-neon-magenta/5'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {answers[question.id] ? (
                            <CheckCircle2 className="w-4 h-4 text-neon-green" />
                          ) : (
                            <XCircle className="w-4 h-4 text-neon-magenta" />
                          )}
                          <span className={`font-mono text-sm font-bold ${answers[question.id] ? 'text-neon-green' : 'text-neon-magenta'}`}>
                            {answers[question.id] ? 'CORRECT !' : 'INCORRECT'}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">{question.explanation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3">
                  {!showExplanation ? (
                    <Button
                      onClick={handleConfirm}
                      disabled={!selectedAnswer}
                      className="flex-1 font-mono tracking-wider py-5"
                      style={selectedAnswer ? { background: mod.color, color: '#0a0a0f' } : {}}
                    >
                      VALIDER MA RÉPONSE
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="flex-1 font-mono tracking-wider py-5"
                      style={{ background: mod.color, color: '#0a0a0f', boxShadow: `0 0 15px ${mod.color}40` }}
                    >
                      {currentQuestion < totalQuestions - 1 ? 'QUESTION SUIVANTE' : 'VOIR MES RÉSULTATS'}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============ DEBRIEF PHASE ============ */}
          {phase === 'debrief' && (
            <motion.div
              key="debrief"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="container py-8 sm:py-12"
            >
              <div className="max-w-2xl mx-auto text-center">
                {/* Score display */}
                <div className="mb-8">
                  <div
                    className="inline-flex items-center justify-center w-32 h-32 border-2 mb-4"
                    style={{
                      borderColor: score >= 80 ? '#00ff88' : score >= 50 ? '#f59e0b' : '#ff0066',
                      boxShadow: `0 0 30px ${score >= 80 ? '#00ff8840' : score >= 50 ? '#f59e0b40' : '#ff006640'}`,
                    }}
                  >
                    <span
                      className="font-mono text-4xl font-bold"
                      style={{
                        color: score >= 80 ? '#00ff88' : score >= 50 ? '#f59e0b' : '#ff0066',
                        textShadow: `0 0 20px ${score >= 80 ? '#00ff8850' : score >= 50 ? '#f59e0b50' : '#ff006650'}`,
                      }}
                    >
                      {score}%
                    </span>
                  </div>

                  <h2 className="font-mono text-xl font-bold text-foreground mb-2">
                    {score >= 80 ? 'MISSION ACCOMPLIE !' : score >= 50 ? 'MISSION PARTIELLEMENT RÉUSSIE' : 'MISSION ÉCHOUÉE'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {correctCount} réponse{correctCount > 1 ? 's' : ''} correcte{correctCount > 1 ? 's' : ''} sur {totalQuestions}
                  </p>
                </div>

                {/* XP earned */}
                <div className="border border-neon-green/20 bg-neon-green/5 p-4 mb-6 inline-flex items-center gap-3">
                  <Zap className="w-5 h-5 text-neon-green" />
                  <span className="font-mono text-lg font-bold text-neon-green text-glow-green">
                    +{Math.round(mod.xpReward * (score / 100))} XP gagnés
                  </span>
                </div>

                {/* All modules completed banner */}
                {willCompleteAll && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                  >
                    <div
                      className="border border-neon-cyan/40 p-5"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(0,255,136,0.05) 100%)',
                        boxShadow: '0 0 30px rgba(0,240,255,0.1)',
                      }}
                    >
                      <GraduationCap className="w-8 h-8 text-neon-cyan mx-auto mb-3" style={{ filter: 'drop-shadow(0 0 10px rgba(0,240,255,0.5))' }} />
                      <h3 className="font-mono text-base font-bold text-neon-cyan text-glow-cyan mb-2 tracking-wider">
                        FORMATION COMPLÈTE !
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Vous avez terminé tous les modules de la formation STATERA_Academy.<br />
                        Votre diplôme de Sensibilisation Cyber est prêt !
                      </p>
                      <Button
                        onClick={() => setShowDiploma(true)}
                        className="font-mono tracking-wider gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #00f0ff, #00ff88)',
                          color: '#0a0a0f',
                          boxShadow: '0 0 20px rgba(0,240,255,0.3)',
                        }}
                      >
                        <Award className="w-4 h-4" /> OBTENIR MON DIPLÔME
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Question breakdown */}
                <div className="text-left mb-8">
                  <h3 className="font-mono text-sm font-bold text-foreground mb-4 tracking-wider">DÉTAIL DES RÉPONSES</h3>
                  <div className="space-y-2">
                    {mod.questions.map((q, i) => {
                      const correct = answers[q.id];
                      return (
                        <div key={q.id} className="flex items-center gap-3 p-3 border border-border/20 bg-dark-surface/30">
                          {correct ? (
                            <CheckCircle2 className="w-4 h-4 text-neon-green flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-neon-magenta flex-shrink-0" />
                          )}
                          <span className="text-sm text-foreground/80 line-clamp-1">Q{i + 1}. {q.question}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="flex-1 font-mono tracking-wider py-5 border-border/40"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> RECOMMENCER
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    className="flex-1 font-mono tracking-wider py-5"
                    style={{ background: mod.color, color: '#0a0a0f', boxShadow: `0 0 15px ${mod.color}40` }}
                  >
                    <Home className="w-4 h-4 mr-2" /> RETOUR AUX MISSIONS
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
