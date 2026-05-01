import { useState, useMemo, useEffect } from 'react';
import { Category, Exercise } from '../types';

const STANDARD_CATEGORIES: { value: Category; label: string }[] = [
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'crossfit', label: 'Crossfit' },
  { value: 'fullbody', label: 'Full Body' },
  { value: 'yoga', label: 'Yoga' },
];

function extractMuscles(exercises: Exercise[]): string[] {
  const set = new Set<string>();
  for (const ex of exercises) {
    if (!ex.muscle) continue;
    for (const m of ex.muscle.split(' / ')) {
      const trimmed = m.trim().toLowerCase();
      if (trimmed) set.add(trimmed);
    }
  }
  return Array.from(set).sort();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Props = {
  exercises: Exercise[];
  onStart: (pool: Exercise[]) => void;
  onBack: () => void;
};

const ALL_CATS = new Set(STANDARD_CATEGORIES.map((c) => c.value));

export default function CustomBuilder({ exercises, onStart, onBack }: Props) {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCats, setSelectedCats] = useState<Set<Category>>(new Set());
  const [selectedMuscles, setSelectedMuscles] = useState<Set<string>>(new Set());

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const allMuscles = useMemo(() => extractMuscles(exercises), [exercises]);

  const matchingPool = useMemo(() => {
    if (selectAll) return exercises.filter((e) => e.category !== 'custom');
    if (selectedCats.size === 0 && selectedMuscles.size === 0) return [];
    return exercises.filter((ex) => {
      if (selectedCats.has(ex.category)) return true;
      if (selectedMuscles.size > 0 && ex.muscle) {
        const tags = ex.muscle.split(' / ').map((m) => m.trim().toLowerCase());
        if (tags.some((t) => selectedMuscles.has(t))) return true;
      }
      return false;
    });
  }, [exercises, selectAll, selectedCats, selectedMuscles]);

  const toggleAll = () => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedCats(new Set());
      setSelectedMuscles(new Set());
    } else {
      setSelectAll(true);
      setSelectedCats(new Set(ALL_CATS));
      setSelectedMuscles(new Set());
    }
  };

  const toggleCat = (cat: Category) => {
    setSelectAll(false);
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const toggleMuscle = (muscle: string) => {
    setSelectAll(false);
    setSelectedMuscles((prev) => {
      const next = new Set(prev);
      if (next.has(muscle)) next.delete(muscle); else next.add(muscle);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">Custom Workout</h1>
            <p className="text-xs text-slate-500 mt-0.5">Pick categories and/or muscle groups</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pb-36 space-y-6">
        {/* Categories */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Categories</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleAll}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectAll
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              All
            </button>
            {STANDARD_CATEGORIES.map(({ value, label }) => {
              const active = selectedCats.has(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleCat(value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Muscle Groups */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Muscle Groups</p>
          <div className="flex flex-wrap gap-2">
            {allMuscles.map((muscle) => {
              const active = selectedMuscles.has(muscle);
              return (
                <button
                  key={muscle}
                  onClick={() => toggleMuscle(muscle)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {capitalize(muscle)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pool count preview */}
        <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm text-center">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-800">{matchingPool.length}</span>{' '}
            {matchingPool.length === 1 ? 'exercise' : 'exercises'} available
          </p>
        </div>
      </div>

      {/* Start button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-6 bg-gradient-to-t from-[#eef1f8] via-[#eef1f8]/90 to-transparent">
        <button
          onClick={() => onStart(matchingPool)}
          disabled={matchingPool.length === 0}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-150 ${
            matchingPool.length > 0
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 active:scale-[0.98]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {matchingPool.length > 0 ? 'Start Workout' : 'Select categories or muscles'}
        </button>
      </div>
    </div>
  );
}
