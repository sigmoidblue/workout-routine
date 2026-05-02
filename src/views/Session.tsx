import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Category, Exercise, WorkoutLog, WorkoutExercise, WorkoutFilters } from '../types';
import { useExercisePicker } from '../hooks/useExercisePicker';
import { defaultExercises } from '../data/defaultExercises';
import { supersets } from '../data/supersetLibrary';
import type { Goal, Equipment, Experience } from '../data/supersetLibrary';
import { warmupCooldown, phaseExerciseMap } from '../data/warmupCooldown';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Always use the bundled default data to determine barbell status — avoids
// depending on the localStorage migration having already run.
const barbellIds = new Set(defaultExercises.filter((e) => e.barbell).map((e) => e.id));
import ProgressRing from '../components/ProgressRing';
import ExerciseItem from '../components/ExerciseItem';
import SupersetCard from '../components/SupersetCard';
import TimerSheet from '../components/TimerSheet';

type Props = {
  category: Category;
  exercises: Exercise[];
  existingLog?: WorkoutLog;
  filters: WorkoutFilters;
  onFinish: (log: WorkoutLog) => void;
  onSave?: (log: WorkoutLog) => void;
  onBack: () => void;
  customPool?: Exercise[];
  customName?: string;
};

const CATEGORY_LABELS: Record<Category, string> = {
  push: 'Push', pull: 'Pull', legs: 'Legs', core: 'Core',
  cardio: 'Cardio', crossfit: 'Crossfit', fullbody: 'Full Body', yoga: 'Yoga', custom: 'Custom Workout',
};

const todayStr = () => new Date().toISOString().slice(0, 10);

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function buildSupersets(
  wes: WorkoutExercise[],
  allExercises: Exercise[],
  filters: WorkoutFilters,
): WorkoutExercise[] {
  // Determine which library buckets to draw from (union for null/unset filters)
  const goals = (filters.goal
    ? [filters.goal]
    : ['strength', 'muscle', 'athletic']) as Goal[];
  const equipments = (filters.equipment
    ? [filters.equipment]
    : ['gym', 'dumbbells', 'home']) as Equipment[];
  const experiences = (filters.experience
    ? [filters.experience]
    : ['beginner', 'intermediate']) as Experience[];

  // Collect deduplicated name-pairs from matching library buckets
  const pairsSeen = new Set<string>();
  const namePairs: [string, string][] = [];
  for (const g of goals) {
    for (const eq of equipments) {
      for (const exp of experiences) {
        for (const ss of supersets[g][eq][exp]) {
          const key = [ss.exercises[0].name, ss.exercises[1].name]
            .map((n) => n.toLowerCase())
            .sort()
            .join('||');
          if (!pairsSeen.has(key)) {
            pairsSeen.add(key);
            namePairs.push([
              ss.exercises[0].name.toLowerCase(),
              ss.exercises[1].name.toLowerCase(),
            ]);
          }
        }
      }
    }
  }

  // Shuffle library pairs for variety each time
  for (let i = namePairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [namePairs[i], namePairs[j]] = [namePairs[j], namePairs[i]];
  }

  // Build name → index lookup, skipping barbell exercises (they go in a separate section)
  const nameToIdx = new Map<string, number>();
  wes.forEach((we, i) => {
    const ex = allExercises.find((e) => e.id === we.exerciseId);
    if (ex && !barbellIds.has(we.exerciseId) && !we.phase) nameToIdx.set(ex.name.toLowerCase(), i);
  });

  // Apply library pairs first
  const result: WorkoutExercise[] = wes.map((we) => ({ ...we, supersetGroup: undefined }));
  const pairedIdxs = new Set<number>();

  for (const [nA, nB] of namePairs) {
    const idxA = nameToIdx.get(nA);
    const idxB = nameToIdx.get(nB);
    if (
      idxA !== undefined && idxB !== undefined &&
      !pairedIdxs.has(idxA) && !pairedIdxs.has(idxB)
    ) {
      const groupId = makeId();
      result[idxA] = { ...result[idxA], supersetGroup: groupId };
      result[idxB] = { ...result[idxB], supersetGroup: groupId };
      pairedIdxs.add(idxA);
      pairedIdxs.add(idxB);
    }
  }

  // Fallback: randomly pair remaining unpaired non-barbell exercises (prefer different muscle)
  const getEx = (id: string) => allExercises.find((e) => e.id === id);
  const unpaired = result
    .map((_, i) => i)
    .filter((i) => !pairedIdxs.has(i) && !barbellIds.has(result[i].exerciseId) && !result[i].phase);

  while (unpaired.length >= 2) {
    const firstIdx = unpaired.splice(0, 1)[0];
    const firstEx = getEx(result[firstIdx].exerciseId);
    let partnerPos = unpaired.findIndex(
      (i) => getEx(result[i].exerciseId)?.muscle !== firstEx?.muscle
    );
    if (partnerPos === -1) partnerPos = 0;
    const [partnerIdx] = unpaired.splice(partnerPos, 1);
    const groupId = makeId();
    result[firstIdx] = { ...result[firstIdx], supersetGroup: groupId };
    result[partnerIdx] = { ...result[partnerIdx], supersetGroup: groupId };
  }

  return result;
}

type DisplayItem =
  | { kind: 'single'; id: string; idx: number }
  | { kind: 'superset'; id: string; idxA: number; idxB: number };

function computeDisplayItems(wes: WorkoutExercise[], primaryIdx: number): DisplayItem[] {
  const seen = new Set<string>();
  const items: DisplayItem[] = [];
  wes.forEach((we, i) => {
    if (we.phase) return;
    if (i === primaryIdx) return;
    if (seen.has(we.exerciseId)) return;
    seen.add(we.exerciseId);
    if (we.supersetGroup) {
      const partnerIdx = wes.findIndex(
        (w, j) => j !== i && w.supersetGroup === we.supersetGroup && !seen.has(w.exerciseId)
      );
      if (partnerIdx !== -1) {
        seen.add(wes[partnerIdx].exerciseId);
        items.push({ kind: 'superset', id: we.supersetGroup, idxA: i, idxB: partnerIdx });
        return;
      }
    }
    items.push({ kind: 'single', id: we.exerciseId, idx: i });
  });
  return items;
}

function SortableItem({ id, children }: {
  id: string;
  children: (handleProps: React.HTMLAttributes<HTMLDivElement>) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 }}
    >
      {children({ ...attributes, ...listeners } as React.HTMLAttributes<HTMLDivElement>)}
    </div>
  );
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

export default function Session({ category, exercises, existingLog, filters, onFinish, onSave, onBack, customPool, customName }: Props) {
  const poolSize = (customPool ?? exercises).filter((e) => {
    if (!customPool && e.category !== category) return false;
    if (!filters.equipment) return true;
    const req = e.equipment ?? 'gym';
    if (filters.equipment === 'gym') return true;
    if (filters.equipment === 'dumbbells') return req === 'dumbbells' || req === 'home';
    return req === 'home';
  }).length;
  const defaultCount = filters.duration === 30 ? 5 : filters.duration === 45 ? 6 : filters.duration === 60 ? 8 : 7;
  const [count, setCount] = useState(() => Math.min(defaultCount, poolSize));
  useEffect(() => { setCount(Math.min(defaultCount, poolSize)); }, [defaultCount, poolSize]);
  const { picked, reroll } = useExercisePicker(exercises, category, count, filters.equipment, customPool);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [toast] = useState<{ msg: string; key: number } | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [ssEnabled, setSsEnabled] = useState(false);
  const [wucdEnabled, setWucdEnabled] = useState(false);
  const handleTimerClose = useCallback(() => setShowTimer(false), []);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCompleted = useRef(0);

  useEffect(() => {
    if (existingLog) {
      setWorkoutExercises(existingLog.exercises);
      return;
    }
    setWorkoutExercises((current) => {
      const warmupItems = current.filter((e) => e.phase === 'warmup');
      const cooldownItems = current.filter((e) => e.phase === 'cooldown');
      const doneItems = current.filter((e) => e.done && !e.phase);
      const doneIds = new Set(doneItems.map((e) => e.exerciseId));
      const newItems = picked
        .filter((ex) => !doneIds.has(ex.id))
        .map((ex) => ({ exerciseId: ex.id, done: false, sets: [] }));
      const mainItems = [...doneItems, ...newItems];
      const combined = [...warmupItems, ...mainItems, ...cooldownItems];
      // Re-apply superset pairing if SS is currently enabled
      return ssEnabled ? buildSupersets(combined, exercises, filters) : combined;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, existingLog]);

  // Auto-save changes when resuming an existing log
  useEffect(() => {
    if (!existingLog || !onSave || workoutExercises.length === 0) return;
    const t = setTimeout(() => {
      onSave({
        id: existingLog.id,
        date: existingLog.date,
        category,
        exercises: workoutExercises,
        completedAt: existingLog.completedAt,
      });
    }, 600);
    return () => clearTimeout(t);
  }, [workoutExercises]); // eslint-disable-line react-hooks/exhaustive-deps

  const completed = workoutExercises.filter((e) => e.done && !e.phase).length;
  const total = workoutExercises.filter((e) => !e.phase).length;

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
    const wasUnchecked = !workoutExercises[i].done && updated.done && !workoutExercises[i].phase;
    setWorkoutExercises((prev) => prev.map((ex, idx) => (idx === i ? updated : ex)));

    // motivational toasts removed — redundant with progress ring
    void wasUnchecked;
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

  const getExercise = (id: string) =>
    exercises.find((e) => e.id === id) ?? phaseExerciseMap.get(id);

  const toggleWUCD = () => {
    if (!wucdEnabled) {
      const wuItems = warmupCooldown[category].warmup.map((ex) => ({
        exerciseId: ex.id, done: false, phase: 'warmup' as const,
      }));
      const cdItems = warmupCooldown[category].cooldown.map((ex) => ({
        exerciseId: ex.id, done: false, phase: 'cooldown' as const,
      }));
      setWorkoutExercises((prev) => [...wuItems, ...prev, ...cdItems]);
    } else {
      setWorkoutExercises((prev) => prev.filter((we) => !we.phase));
    }
    setWucdEnabled((v) => !v);
  };

  const getAlternatives = (we: WorkoutExercise) => {
    const ex = getExercise(we.exerciseId);
    if (!ex) return [];
    const inSession = new Set(workoutExercises.map((w) => w.exerciseId));
    if (barbellIds.has(we.exerciseId)) {
      const altSource = customPool ?? exercises;
      return altSource.filter(
        (e) => e.category === ex.category && e.id !== ex.id && !inSession.has(e.id) && barbellIds.has(e.id)
      );
    }
    if (!ex.muscle) return [];
    const altSource = customPool ?? exercises;
    const pool = customPool
      ? altSource.filter((e) => e.id !== ex.id && !inSession.has(e.id))
      : altSource.filter((e) => e.category === ex.category && e.id !== ex.id && !inSession.has(e.id));
    return pool.sort((a, b) => (a.muscle === ex.muscle ? 0 : 1) - (b.muscle === ex.muscle ? 0 : 1));
  };

  const handleSwap = (index: number, newExerciseId: string) => {
    setWorkoutExercises((prev) =>
      prev.map((wx, i) => (i === index ? { ...wx, exerciseId: newExerciseId, done: false, sets: [] } : wx))
    );
  };

  const toggleSS = () => {
    if (!ssEnabled) {
      setWorkoutExercises((prev) => buildSupersets(prev, exercises, filters));
    } else {
      setWorkoutExercises((prev) => prev.map((we) => ({ ...we, supersetGroup: undefined })));
    }
    setSsEnabled((v) => !v);
  };

  const handleUnlink = (groupId: string) => {
    setWorkoutExercises((prev) =>
      prev.map((we) => we.supersetGroup === groupId ? { ...we, supersetGroup: undefined } : we)
    );
  };

  const handleLink = (exerciseId: string, partnerId: string) => {
    const groupId = makeId();
    setWorkoutExercises((prev) =>
      prev.map((we) =>
        we.exerciseId === exerciseId || we.exerciseId === partnerId
          ? { ...we, supersetGroup: groupId }
          : we
      )
    );
  };

  const getLinkable = (exerciseId: string): Exercise[] => {
    const unpairedIds = workoutExercises
      .filter((we) => !we.supersetGroup && we.exerciseId !== exerciseId)
      .map((we) => we.exerciseId);
    return unpairedIds.map((id) => getExercise(id)!).filter(Boolean);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const primaryIdx = workoutExercises.findIndex((we) => barbellIds.has(we.exerciseId));
  const displayItems = computeDisplayItems(workoutExercises, primaryIdx);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveDragId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    setWorkoutExercises((prev) => {
      const pIdx = prev.findIndex((we) => barbellIds.has(we.exerciseId));
      const items = computeDisplayItems(prev, pIdx);
      const oldPos = items.findIndex((item) => item.id === active.id);
      const newPos = items.findIndex((item) => item.id === over.id);
      if (oldPos === -1 || newPos === -1) return prev;
      const reordered = arrayMove(items, oldPos, newPos);
      const result: WorkoutExercise[] = [];
      if (pIdx !== -1) result.push(prev[pIdx]);
      for (const item of reordered) {
        if (item.kind === 'single') result.push(prev[item.idx]);
        else { result.push(prev[item.idxA]); result.push(prev[item.idxB]); }
      }
      return result;
    });
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
            <h1 className="text-xl font-bold text-slate-900">{customName ?? CATEGORY_LABELS[category]}</h1>
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

      {/* Toggles */}
      {!existingLog && (
        <div className="flex justify-center gap-2.5 pb-4 flex-wrap px-5">
          {(['Warm-up & Cool-down', 'Supersets'] as const).map((label) => {
            const active = label === 'Supersets' ? ssEnabled : wucdEnabled;
            const onToggle = label === 'Supersets' ? toggleSS : toggleWUCD;
            return (
              <button
                key={label}
                onClick={onToggle}
                className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {label}
                <div className={`relative w-7 h-4 rounded-full transition-colors ${active ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-slate-100 mx-5" />

      {/* Exercise List */}
      <div className="flex-1 px-5 pt-4 pb-36 overflow-y-auto">

        {/* Warm-up section */}
        {wucdEnabled && (() => {
          const items = workoutExercises.map((we, i) => ({ we, i })).filter(({ we }) => we.phase === 'warmup');
          if (!items.length) return null;
          return (
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">Warm-up</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="space-y-2.5">
                {items.map(({ we, i }) => {
                  const ex = getExercise(we.exerciseId);
                  if (!ex) return null;
                  return (
                    <ExerciseItem
                      key={we.exerciseId}
                      exercise={ex}
                      workoutEx={we}
                      onChange={(u) => handleExerciseChange(i, u)}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-4 mb-1">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">Workout</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
            </div>
          );
        })()}

        {/* Primary / main lift section */}
        {(() => {
          const primaryIdx = workoutExercises.findIndex((we) => barbellIds.has(we.exerciseId));
          if (primaryIdx === -1) return null;
          const we = workoutExercises[primaryIdx];
          const ex = getExercise(we.exerciseId)!;
          return (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="12" x2="18" y2="12" />
                  <circle cx="3" cy="12" r="2" />
                  <circle cx="21" cy="12" r="2" />
                  <line x1="3" y1="8" x2="3" y2="16" />
                  <line x1="21" y1="8" x2="21" y2="16" />
                </svg>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Lift</span>
              </div>
              <ExerciseItem
                exercise={ex}
                workoutEx={we}
                onChange={(u) => handleExerciseChange(primaryIdx, u)}
                alternatives={getAlternatives(we)}
                onSwap={(id) => handleSwap(primaryIdx, id)}
              />
              <div className="flex items-center gap-3 mt-4 mb-1">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">Work Sets</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
            </div>
          );
        })()}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={displayItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {displayItems.map((item) => {
                if (item.kind === 'superset') {
                  const we = workoutExercises[item.idxA];
                  const partnerWe = workoutExercises[item.idxB];
                  const ex = getExercise(we.exerciseId);
                  const partnerEx = getExercise(partnerWe.exerciseId);
                  if (!ex || !partnerEx) return null;
                  return (
                    <SortableItem key={item.id} id={item.id}>
                      {(hp) => (
                        <SupersetCard
                          slotA={{ exercise: ex, workoutEx: we, onChange: (u) => handleExerciseChange(item.idxA, u), alternatives: getAlternatives(we), onSwap: (id) => handleSwap(item.idxA, id) }}
                          slotB={{ exercise: partnerEx, workoutEx: partnerWe, onChange: (u) => handleExerciseChange(item.idxB, u), alternatives: getAlternatives(partnerWe), onSwap: (id) => handleSwap(item.idxB, id) }}
                          onUnlink={() => handleUnlink(we.supersetGroup!)}
                          dragHandleProps={!existingLog ? hp : undefined}
                        />
                      )}
                    </SortableItem>
                  );
                }
                const we = workoutExercises[item.idx];
                const ex = getExercise(we.exerciseId);
                if (!ex) return null;
                return (
                  <SortableItem key={item.id} id={item.id}>
                    {(hp) => (
                      <ExerciseItem
                        exercise={ex}
                        workoutEx={we}
                        onChange={(u) => handleExerciseChange(item.idx, u)}
                        alternatives={getAlternatives(we)}
                        onSwap={(newId) => handleSwap(item.idx, newId)}
                        ssEnabled={ssEnabled}
                        linkable={ssEnabled ? getLinkable(we.exerciseId) : undefined}
                        onLink={(partnerId) => handleLink(we.exerciseId, partnerId)}
                        dragHandleProps={!existingLog ? hp : undefined}
                      />
                    )}
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
          <DragOverlay>
            {(() => {
              if (!activeDragId) return null;
              const item = displayItems.find((d) => d.id === activeDragId);
              if (!item) return null;
              if (item.kind === 'superset') {
                const we = workoutExercises[item.idxA];
                const partnerWe = workoutExercises[item.idxB];
                const ex = getExercise(we.exerciseId);
                const partnerEx = getExercise(partnerWe.exerciseId);
                if (!ex || !partnerEx) return null;
                return (
                  <SupersetCard
                    slotA={{ exercise: ex, workoutEx: we, onChange: () => {}, alternatives: [], onSwap: () => {} }}
                    slotB={{ exercise: partnerEx, workoutEx: partnerWe, onChange: () => {}, alternatives: [], onSwap: () => {} }}
                    onUnlink={() => {}}
                  />
                );
              }
              const we = workoutExercises[item.idx];
              const ex = getExercise(we.exerciseId);
              if (!ex) return null;
              return (
                <ExerciseItem
                  exercise={ex}
                  workoutEx={we}
                  onChange={() => {}}
                  onSwap={() => {}}
                  dragHandleProps={{}}
                />
              );
            })()}
          </DragOverlay>
        </DndContext>

        {/* Cool-down section */}
        {wucdEnabled && (() => {
          const items = workoutExercises.map((we, i) => ({ we, i })).filter(({ we }) => we.phase === 'cooldown');
          if (!items.length) return null;
          return (
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest">Cool-down</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="space-y-2.5">
                {items.map(({ we, i }) => {
                  const ex = getExercise(we.exerciseId);
                  if (!ex) return null;
                  return (
                    <ExerciseItem
                      key={we.exerciseId}
                      exercise={ex}
                      workoutEx={we}
                      onChange={(u) => handleExerciseChange(i, u)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })()}
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
