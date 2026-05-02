import { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { WorkoutLog, Exercise, Category } from '../types';
import { phaseExerciseMap } from '../data/warmupCooldown';

type Props = {
  workouts: WorkoutLog[];
  exercises: Exercise[];
  onBack: () => void;
};

const CAT_LABEL: Record<Category, string> = {
  push: 'Push', pull: 'Pull', legs: 'Legs', core: 'Core',
  cardio: 'Cardio', crossfit: 'Crossfit', fullbody: 'Full Body', yoga: 'Yoga', custom: 'Custom',
};

const CAT_BG: Record<Category, string> = {
  push: 'bg-indigo-400', pull: 'bg-violet-400', legs: 'bg-cyan-400',
  core: 'bg-emerald-400', cardio: 'bg-rose-400', crossfit: 'bg-amber-400',
  fullbody: 'bg-sky-400', yoga: 'bg-pink-400', custom: 'bg-orange-400',
};

// const CAT_TEXT: Record<Category, string> = {
//   push: 'text-indigo-600', pull: 'text-violet-600', legs: 'text-cyan-700',
//   core: 'text-emerald-700', cardio: 'text-rose-600', crossfit: 'text-amber-600',
//   fullbody: 'text-sky-600', yoga: 'text-pink-600',
// };

// const CAT_LIGHT: Record<Category, string> = {
//   push: 'bg-indigo-50', pull: 'bg-violet-50', legs: 'bg-cyan-50',
//   core: 'bg-emerald-50', cardio: 'bg-rose-50', crossfit: 'bg-amber-50',
//   fullbody: 'bg-sky-50', yoga: 'bg-pink-50',
// };

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekStart(offset: number): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day) + offset * 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function getWeekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart + 'T12:00:00');
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart + 'T12:00:00');
  const end = new Date(weekStart + 'T12:00:00');
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}

function formatTonnage(kg: number): string {
  if (kg === 0) return '—';
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k kg`;
  return `${kg} kg`;
}

export default function Progress({ workouts, exercises, onBack }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const weekStart = getWeekStart(weekOffset);
  const weekDays = getWeekDays(weekStart);

  const weekWorkouts = useMemo(
    () => workouts.filter((w) => w.date >= weekDays[0] && w.date <= weekDays[6]),
    [workouts, weekDays] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // date → first workout that day
  const dayMap = useMemo(() => {
    const m = new Map<string, WorkoutLog>();
    for (const w of weekWorkouts) {
      if (!m.has(w.date)) m.set(w.date, w);
    }
    return m;
  }, [weekWorkouts]);

  const stats = useMemo(() => {
    let sets = 0, reps = 0, tonnage = 0;
    for (const w of weekWorkouts) {
      for (const we of w.exercises) {
        if (!we.done || we.phase) continue;
        for (const s of we.sets ?? []) {
          if (s.reps > 0) {
            sets++;
            reps += s.reps;
            tonnage += s.reps * (s.weight ?? 0);
          }
        }
      }
    }
    const uniqueDays = new Set(weekWorkouts.map((w) => w.date)).size;
    return { days: uniqueDays, sets, reps, tonnage };
  }, [weekWorkouts]);

  const catsThisWeek = useMemo(() => {
    const seen = new Set<Category>();
    const result: Category[] = [];
    for (const w of weekWorkouts) {
      if (!seen.has(w.category)) {
        seen.add(w.category);
        result.push(w.category);
      }
    }
    return result;
  }, [weekWorkouts]);

  // Per-exercise bests (only logged sets)
  const topExercises = useMemo(() => {
    const map = new Map<string, { name: string; sets: number; maxWeight: number }>();
    for (const w of weekWorkouts) {
      for (const we of w.exercises) {
        if (!we.done || we.phase) continue;
        const ex =
          exercises.find((e) => e.id === we.exerciseId) ??
          phaseExerciseMap.get(we.exerciseId);
        if (!ex) continue;
        const curr = map.get(we.exerciseId) ?? { name: ex.name, sets: 0, maxWeight: 0 };
        for (const s of we.sets ?? []) {
          if (s.reps > 0) {
            curr.sets++;
            if ((s.weight ?? 0) > curr.maxWeight) curr.maxWeight = s.weight ?? 0;
          }
        }
        map.set(we.exerciseId, curr);
      }
    }
    return Array.from(map.values())
      .filter((e) => e.sets > 0)
      .sort((a, b) => b.maxWeight - a.maxWeight)
      .slice(0, 8);
  }, [weekWorkouts, exercises]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f1f5f9',
        logging: false,
      });
      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), 'image/png')
      );
      const file = new File([blob], `week-${weekStart}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Weekly Workout Summary' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `week-${weekStart}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // user cancelled or share failed
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Progress</p>
          <p className="text-slate-800 font-semibold text-sm mt-0.5">{formatWeekLabel(weekStart)}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setWeekOffset((v) => v - 1); setSelectedDay(null); }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => { setWeekOffset((v) => Math.min(v + 1, 0)); setSelectedDay(null); }}
            disabled={weekOffset === 0}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-10 space-y-3">
        {/* Capture target */}
        <div ref={cardRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

            {/* 7-day strip */}
            <div className="px-6 pt-5 pb-4">
              <div className="flex justify-between">
                {weekDays.map((dateStr, i) => {
                  const workout = dayMap.get(dateStr);
                  const isToday = dateStr === todayStr;
                  const isFuture = dateStr > todayStr;
                  const isSelected = selectedDay === dateStr;
                  return (
                    <button
                      key={i}
                      onClick={() => workout && setSelectedDay(isSelected ? null : dateStr)}
                      className={`flex flex-col items-center gap-1.5 ${workout ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <p className={`text-[10px] font-semibold ${isToday ? 'text-indigo-500' : 'text-slate-400'}`}>
                        {DAYS[i]}
                      </p>
                      <div className={`w-5 h-5 rounded-full transition-all ${
                        workout
                          ? CAT_BG[workout.category]
                          : isFuture
                            ? 'bg-slate-100 border border-dashed border-slate-200'
                            : 'bg-slate-200'
                      } ${isToday ? 'ring-2 ring-offset-2 ring-indigo-300' : ''} ${isSelected ? 'ring-2 ring-offset-2 ring-slate-400 scale-125' : ''}`}>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day detail */}
            {selectedDay && dayMap.get(selectedDay) && (() => {
              const dayWorkouts = weekWorkouts.filter(w => w.date === selectedDay);
              const dayDate = new Date(selectedDay + 'T12:00:00');
              const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
              return (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-600">{dayLabel}</p>
                    <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {dayWorkouts.map(w => (
                    <div key={w.id} className="mb-3 last:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${CAT_BG[w.category]}`} />
                        <p className="text-xs font-semibold text-slate-700">{CAT_LABEL[w.category]}</p>
                      </div>
                      <div className="space-y-1.5">
                        {w.exercises.filter(we => we.done && !we.phase).map(we => {
                          const ex = exercises.find(e => e.id === we.exerciseId) ?? phaseExerciseMap.get(we.exerciseId);
                          const setsSummary = (we.sets ?? []).filter(s => s.reps > 0);
                          return (
                            <div key={we.exerciseId} className="flex items-center justify-between py-1">
                              <p className="text-sm text-slate-700">{ex?.name ?? 'Unknown'}</p>
                              {setsSummary.length > 0 && (
                                <p className="text-xs text-slate-400 tabular-nums">
                                  {setsSummary.map((s, i) => (
                                    <span key={i}>
                                      {i > 0 && <span className="mx-0.5 text-slate-200">/</span>}
                                      {s.reps}{s.weight ? `×${s.weight}` : ''}
                                    </span>
                                  ))}
                                </p>
                              )}
                            </div>
                          );
                        })}
                        {w.exercises.filter(we => we.done && !we.phase).length === 0 && (
                          <p className="text-xs text-slate-400">No exercises logged</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Stats row */}
            <div className="px-6 py-4 border-t border-slate-50">
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Days', value: String(stats.days || '—') },
                  { label: 'Sets', value: String(stats.sets || '—') },
                  { label: 'Reps', value: String(stats.reps || '—') },
                  { label: 'Volume', value: formatTonnage(stats.tonnage) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-lg font-bold text-slate-800">{value}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories trained */}
            {catsThisWeek.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-50">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                  Trained this week
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {catsThisWeek.map((cat) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${CAT_BG[cat]}`} />
                      <p className="text-xs font-medium text-slate-600">
                        {CAT_LABEL[cat]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top exercises */}
            {topExercises.length > 0 && (
              <div className="px-6 py-2 border-t border-slate-50">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 pt-2">
                  Exercises logged
                </p>
                <div className="divide-y divide-slate-50">
                  {topExercises.map((ex) => (
                    <div key={ex.name} className="flex items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{ex.name}</p>
                      </div>
                      <p className="text-xs text-slate-400 flex-shrink-0">
                        {ex.sets} {ex.sets === 1 ? 'set' : 'sets'}
                        {ex.maxWeight > 0 && (
                          <>
                            <span className="mx-1 text-slate-200">·</span>
                            <span className="font-semibold text-slate-600">{ex.maxWeight} kg</span>
                          </>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {weekWorkouts.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="text-slate-400 text-sm font-medium">No workouts this week</p>
                <p className="text-slate-300 text-xs mt-1">Get moving!</p>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 text-center font-medium">
                {formatWeekLabel(weekStart)}
              </p>
            </div>

        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          disabled={capturing || weekWorkouts.length === 0}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {capturing ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share this week
            </>
          )}
        </button>
      </div>
    </div>
  );
}
