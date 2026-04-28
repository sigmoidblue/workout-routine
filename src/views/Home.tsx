import { useState } from 'react';
import { Category, WorkoutLog, WorkoutFilters, WorkoutGoal, WorkoutEquipment, WorkoutDuration } from '../types';
import CategoryCard from '../components/CategoryCard';
import StreakBadge from '../components/StreakBadge';
import { useStreak } from '../hooks/useStreak';

const CATEGORIES: Category[] = ['push', 'pull', 'legs', 'core', 'cardio', 'crossfit', 'fullbody', 'yoga'];

type Props = {
  onStart: (category: Category) => void;
  onLibrary: () => void;
  workouts: WorkoutLog[];
  filters: WorkoutFilters;
  onFiltersChange: (f: WorkoutFilters) => void;
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

export default function Home({ onStart, onLibrary, workouts, filters, onFiltersChange }: Props) {
  const { streak } = useStreak();
  const today = todayStr();
  const todayWorkout = workouts.find((w) => w.date === today);
  const [showFilters, setShowFilters] = useState(false);

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

      {/* Section label */}
      <div className="px-5 pb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          Choose your workout
        </p>
      </div>

      {/* Category Grid */}
      <div className="flex-1 px-5 pb-10">
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              onClick={() => onStart(cat)}
              hasWorkout={workouts.some((w) => w.date === today && w.category === cat)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
