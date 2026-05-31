import { useState, useMemo } from 'react';
import { Category, CustomPreset, WorkoutLog, WorkoutFilters, WorkoutGoal, WorkoutEquipment, WorkoutDuration } from '../types';
import CategoryCard from '../components/CategoryCard';
import StreakBadge from '../components/StreakBadge';
import { useStreak } from '../hooks/useStreak';

const CAT_BG: Record<Category, string> = {
  push: 'bg-indigo-400', pull: 'bg-violet-400', legs: 'bg-cyan-400',
  core: 'bg-emerald-400', cardio: 'bg-rose-400', crossfit: 'bg-amber-400',
  fullbody: 'bg-sky-400', yoga: 'bg-pink-400', custom: 'bg-orange-400',
};

const CAT_LABEL: Record<Category, string> = {
  push: 'Push', pull: 'Pull', legs: 'Legs', core: 'Core',
  cardio: 'Cardio', crossfit: 'Crossfit', fullbody: 'Full Body', yoga: 'Yoga', custom: 'Custom',
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDays(today: string): string[] {
  const d = new Date(today + 'T12:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    return dd.toISOString().slice(0, 10);
  });
}

const CATEGORIES: Category[] = ['push', 'pull', 'legs', 'core', 'cardio', 'crossfit', 'fullbody', 'yoga'];

const CAT_LABEL_SHORT: Record<Category, string> = {
  push: 'Push', pull: 'Pull', legs: 'Legs', core: 'Core',
  cardio: 'Cardio', crossfit: 'Crossfit', fullbody: 'Full Body', yoga: 'Yoga', custom: 'Custom',
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Props = {
  onStart: (category: Category) => void;
  onLibrary: () => void;
  onProgress: () => void;
  workouts: WorkoutLog[];
  filters: WorkoutFilters;
  onFiltersChange: (f: WorkoutFilters) => void;
  presets: CustomPreset[];
  onStartPreset: (preset: CustomPreset) => void;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

function FilterPills<T extends string | number>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onSelect: (v: T | null) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(active ? null : opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Home({ onStart, onLibrary, onProgress, workouts, filters, onFiltersChange, presets, onStartPreset }: Props) {
  const { streak } = useStreak();
  const today = todayStr();
  const todayWorkout = workouts.find((w) => w.date === today && w.completedAt);
  const todayInProgress = workouts.find((w) => w.date === today && !w.completedAt);
  const [showFilters, setShowFilters] = useState(false);
  const weekDays = useMemo(() => getWeekDays(today), [today]);
  const dayMap = useMemo(() => {
    const m = new Map<string, WorkoutLog>();
    for (const w of workouts) {
      if (!m.has(w.date)) m.set(w.date, w);
    }
    return m;
  }, [workouts]);

  const hasActiveFilters =
    filters.goal !== null ||
    filters.equipment !== null ||
    // filters.experience !== null ||
    filters.duration !== null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h1>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <StreakBadge streak={streak} />
            {/* Tuner / filters button */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                hasActiveFilters || showFilters
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
                <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
                <circle cx="9" cy="18" r="2" fill="currentColor" stroke="none" />
              </svg>
            </button>
            <button
              onClick={onProgress}
              className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
              title="Weekly Progress"
            >
              <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={onLibrary}
              className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
              title="Exercise Library"
            >
              <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-5 bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm animate-slide-up space-y-4">
            <FilterPills<WorkoutGoal>
              label="Goal"
              options={[
                { value: 'strength', label: 'Strength' },
                { value: 'muscle', label: 'Muscle' },
                { value: 'athletic', label: 'Athletic' },
              ]}
              value={filters.goal}
              onSelect={(v) => onFiltersChange({ ...filters, goal: v })}
            />
            <FilterPills<WorkoutEquipment>
              label="Equipment"
              options={[
                { value: 'gym', label: 'Gym' },
                { value: 'dumbbells', label: 'Dumbbells' },
                { value: 'home', label: 'Home' },
              ]}
              value={filters.equipment}
              onSelect={(v) => onFiltersChange({ ...filters, equipment: v })}
            />
            {/* Experience filter — hidden until exercises are tagged
            <FilterPills<WorkoutExperience>
              label="Experience"
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
              ]}
              value={filters.experience}
              onSelect={(v) => onFiltersChange({ ...filters, experience: v })}
            /> */}
            <FilterPills<WorkoutDuration>
              label="Duration"
              options={[
                { value: 30, label: '30 min' },
                { value: 45, label: '45 min' },
                { value: 60, label: '60 min' },
              ]}
              value={filters.duration}
              onSelect={(v) => onFiltersChange({ ...filters, duration: v })}
            />
            {hasActiveFilters && (
              <button
                onClick={() => onFiltersChange({ goal: null, equipment: null, experience: null, duration: null })}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors pt-1"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Today's status */}
        {todayInProgress && !todayWorkout && (
          <div className="mt-5 bg-white border border-amber-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">In progress</p>
                <p className="text-xs text-slate-500 capitalize">{todayInProgress.category} session</p>
              </div>
            </div>
            <button
              onClick={() => onStart(todayInProgress.category)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Resume
            </button>
          </div>
        )}
        {todayWorkout && (
          <div className="mt-5 bg-white border border-emerald-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Workout logged</p>
                <p className="text-xs text-slate-500 capitalize">{todayWorkout.category} session</p>
              </div>
            </div>
            <button
              onClick={() => onStart(todayWorkout.category)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View
            </button>
          </div>
        )}
      </div>

      {/* Weekly strip */}
      <div className="px-5 mb-4 fade-up fade-up-1">
        <button
          onClick={onProgress}
          className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 hover:border-slate-200 active:scale-[0.99] transition-all"
        >
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-14 shrink-0 text-left">
            This week
          </p>
          <div className="flex flex-1 justify-between items-center">
            {weekDays.map((dateStr, i) => {
              const workout = dayMap.get(dateStr);
              const isToday = dateStr === today;
              const isFuture = dateStr > today;
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    workout
                      ? `${CAT_BG[workout.category]} text-white`
                      : isFuture
                        ? 'bg-slate-50'
                        : 'bg-slate-100'
                  } ${isToday ? 'ring-2 ring-offset-1 ring-indigo-300' : ''}`}>
                    {workout
                      ? CAT_LABEL[workout.category].slice(0, 1).toUpperCase()
                      : null}
                  </div>
                  <p className={`text-[8px] font-medium ${isToday ? 'text-indigo-500' : 'text-slate-300'}`}>
                    {WEEK_DAYS[i].slice(0, 1)}
                  </p>
                </div>
              );
            })}
          </div>
          <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Section label */}
      <div className="px-5 pb-3 fade-up fade-up-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          Choose your workout
        </p>
      </div>

      {/* Category Grid */}
      <div className="flex-1 px-5 pb-10 fade-up fade-up-3">
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              onClick={() => onStart(cat)}
              hasWorkout={workouts.some((w) => w.date === today && w.category === cat)}
              workoutStatus={(() => { const w = workouts.find((w) => w.date === today && w.category === cat); return w ? (w.completedAt ? 'done' : 'in-progress') : undefined; })()}
            />
          ))}
          {presets.map((preset) => {
            const tags = [
              ...preset.categories.map((c) => CAT_LABEL_SHORT[c] ?? c),
              ...preset.muscles.map(capitalize),
            ].slice(0, 3).join(' · ');
            return (
              <CategoryCard
                key={`preset-${preset.id}`}
                category="custom"
                onClick={() => onStartPreset(preset)}
                labelOverride={preset.name}
                subOverride={tags || 'Custom mix'}
                dotOverride={preset.color || 'bg-orange-400'}
              />
            );
          })}
          <CategoryCard
            category="custom"
            onClick={() => onStart('custom')}
            hasWorkout={workouts.some((w) => w.date === today && w.category === 'custom')}
            workoutStatus={(() => { const w = workouts.find((w) => w.date === today && w.category === 'custom'); return w ? (w.completedAt ? 'done' : 'in-progress') : undefined; })()}
          />
        </div>
      </div>
    </div>
  );
}
