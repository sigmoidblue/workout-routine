import { useState, useEffect, useRef, useCallback } from 'react';
import { Category, Exercise, WorkoutLog, WorkoutExercise } from '../types';
import { useExercisePicker } from '../hooks/useExercisePicker';
import ProgressRing from '../components/ProgressRing';
import ExerciseItem from '../components/ExerciseItem';
import TimerSheet from '../components/TimerSheet';

type Props = {
  category: Category;
  exercises: Exercise[];
  existingLog?: WorkoutLog;
  onFinish: (log: WorkoutLog) => void;
  onBack: () => void;
};

const CATEGORY_LABELS: Record<Category, string> = {
  push: 'Push', pull: 'Pull', legs: 'Legs', core: 'Core',
  cardio: 'Cardio', crossfit: 'Crossfit', fullbody: 'Full Body', yoga: 'Yoga',
};

const TOAST_MESSAGES = [
  "Let's go!!",
  "Yes!! Keep it up!",
  "That's what I'm talking about!",
  "You're on fire!",
  "Don't stop now!",
  "Beast mode activated!",
  "Crushed it! Next one!",
  "Look at you go!",
  "Absolutely killing it!",
  "Keep that energy up!",
  "No stopping you now!",
  "One step closer to goals!",
  "You're a machine!",
  "That's the spirit!",
];

const todayStr = () => new Date().toISOString().slice(0, 10);

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function getMilestoneMsg(completed: number, total: number): string | null {
  if (total === 0 || completed === 0) return null;
  const pct = completed / total;
  if (completed === total) return null; // handled separately
  if (total - completed === 1) return 'ONE MORE!! Finish strong!';
  if (pct >= 0.75) return "So close!! Don't you dare stop!";
  if (pct >= 0.5) return "Halfway there, you're unstoppable!";
  if (pct >= 0.25) return "Great start! Keep that momentum!";
  return "Let's get it! You've got this!";
}

function Confetti() {
  const palette = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6', '#F97316', '#A855F7'];
  const shapes = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    width: 8 + Math.random() * 14,
    height: 8 + Math.random() * 22,
    color: palette[Math.floor(Math.random() * palette.length)],
    delay: Math.random() * 0.9,
    duration: 1.4 + Math.random() * 1.0,
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {shapes.map((s) => (
        <div
          key={s.id}
          className="confetti-piece absolute"
          style={{
            left: `${s.left}%`,
            top: '-20px',
            width: `${s.width}px`,
            height: `${s.height}px`,
            backgroundColor: s.color,
            borderRadius: s.borderRadius,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Session({ category, exercises, existingLog, onFinish, onBack }: Props) {
  const poolSize = exercises.filter((e) => e.category === category).length;
  const [count, setCount] = useState(Math.min(7, poolSize));
  const { picked, reroll } = useExercisePicker(exercises, category, count);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const handleTimerClose = useCallback(() => setShowTimer(false), []);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCompleted = useRef(0);

  useEffect(() => {
    if (existingLog) {
      setWorkoutExercises(existingLog.exercises);
      return;
    }
    setWorkoutExercises((current) => {
      const doneItems = current.filter((e) => e.done);
      const doneIds = new Set(doneItems.map((e) => e.exerciseId));
      const newItems = picked
        .filter((ex) => !doneIds.has(ex.id))
        .map((ex) => ({ exerciseId: ex.id, done: false, sets: [] }));
      return [...doneItems, ...newItems];
    });
  }, [picked, existingLog]);

  const completed = workoutExercises.filter((e) => e.done).length;
  const total = workoutExercises.length;

  useEffect(() => {
    if (completed === total && total > 0 && prevCompleted.current < total) {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 600);
    }
    prevCompleted.current = completed;
  }, [completed, total]);

  // Cleanup toast timer on unmount
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const handleExerciseChange = (i: number, updated: WorkoutExercise) => {
    const wasUnchecked = !workoutExercises[i].done && updated.done;
    setWorkoutExercises((prev) => prev.map((ex, idx) => (idx === i ? updated : ex)));

    if (wasUnchecked) {
      const msg = TOAST_MESSAGES[Math.floor(Math.random() * TOAST_MESSAGES.length)];
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ msg, key: Date.now() });
      toastTimer.current = setTimeout(() => setToast(null), 2100);
    }
  };

  const handleFinish = () => {
    setShowConfetti(true);
    const log: WorkoutLog = {
      id: existingLog?.id ?? makeId(),
      date: todayStr(),
      category,
      exercises: workoutExercises,
      completedAt: new Date().toISOString(),
    };
    setTimeout(() => {
      setShowConfetti(false);
      onFinish(log);
    }, 2400);
  };

  const getExercise = (id: string) => exercises.find((e) => e.id === id);

  const getAlternatives = (we: WorkoutExercise) => {
    const ex = getExercise(we.exerciseId);
    if (!ex?.muscle) return [];
    const inSession = new Set(workoutExercises.map((w) => w.exerciseId));
    const pool = exercises.filter((e) => e.category === ex.category && e.id !== ex.id && !inSession.has(e.id));
    return pool.sort((a, b) => {
      const aMatch = a.muscle === ex.muscle ? 0 : 1;
      const bMatch = b.muscle === ex.muscle ? 0 : 1;
      return aMatch - bMatch;
    });
  };

  const handleSwap = (index: number, newExerciseId: string) => {
    setWorkoutExercises((prev) =>
      prev.map((wx, i) => (i === index ? { exerciseId: newExerciseId, done: false, sets: [] } : wx))
    );
  };
  const milestoneMsg = getMilestoneMsg(completed, total);

  return (
    <div className="min-h-screen flex flex-col">
      {showConfetti && <Confetti />}

      {/* Toast */}
      {toast && (
        <div
          key={toast.key}
          className="toast-animate pointer-events-none fixed top-6 left-0 right-0 flex justify-center px-6 z-40"
        >
          <div className="bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg shadow-slate-900/20 whitespace-nowrap">
            {toast.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <h1 className="text-xl font-bold text-slate-900">{CATEGORY_LABELS[category]}</h1>
          </div>
          {!existingLog && (
            <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <button
                onClick={() => setCount((c) => Math.max(2, c - 1))}
                className="px-2.5 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={reroll}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {count}
              </button>
              <button
                onClick={() => setCount((c) => Math.min(poolSize, c + 1))}
                className="px-2.5 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors border-l border-slate-100"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Progress Ring + milestone message */}
        <div className="flex flex-col items-center py-4">
          <ProgressRing completed={completed} total={total} size={132} pulse={pulsing} />
          <div className="h-6 mt-3 flex items-center">
            {completed === total && total > 0 ? (
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                That's a wrap, you crushed it!!
              </p>
            ) : milestoneMsg ? (
              <p key={milestoneMsg} className="text-xs font-medium text-indigo-500 animate-slide-up">
                {milestoneMsg}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                {total > 0 ? `${total} exercises` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 mx-5" />

      {/* Exercise List */}
      <div className="flex-1 px-5 pt-4 space-y-2.5 pb-36 overflow-y-auto">
        {workoutExercises.map((we, i) => {
          const ex = getExercise(we.exerciseId);
          if (!ex) return null;
          return (
            <ExerciseItem
              key={we.exerciseId}
              exercise={ex}
              workoutEx={we}
              onChange={(updated) => handleExerciseChange(i, updated)}
              alternatives={getAlternatives(we)}
              onSwap={(newId) => handleSwap(i, newId)}
            />
          );
        })}
      </div>

      {/* Finish Button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-6 bg-gradient-to-t from-[#eef1f8] via-[#eef1f8]/90 to-transparent">
        <div className="flex gap-3">
          {/* Timer button */}
          <button
            onClick={() => setShowTimer((v) => !v)}
            className={`relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              showTimer
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 shadow-sm'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
            </svg>
            {timerRunning && !showTimer && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={handleFinish}
            disabled={completed === 0}
            className={`flex-1 py-4 rounded-2xl font-semibold text-base transition-all duration-150 ${
              completed > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {completed === total && total > 0
              ? 'Finish Workout'
              : completed > 0
              ? `Finish  ·  ${completed} of ${total} done`
              : 'Check off exercises to finish'}
          </button>
        </div>
      </div>

      <TimerSheet
        visible={showTimer}
        onClose={handleTimerClose}
        onRunningChange={setTimerRunning}
      />
    </div>
  );
}
