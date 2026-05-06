import { useState, useMemo, useRef, useEffect } from 'react';
import { Exercise, Category } from '../types';

const CATEGORIES: Category[] = ['push', 'pull', 'legs', 'core', 'cardio', 'crossfit', 'fullbody', 'yoga'];

const CATEGORY_LABELS: Record<Category, string> = {
  push: 'Push', pull: 'Pull', legs: 'Legs', core: 'Core',
  cardio: 'Cardio', crossfit: 'Crossfit', fullbody: 'Full Body', yoga: 'Yoga', custom: 'Custom',
};

type Props = {
  exercises: Exercise[];
  onAdd: (ex: Omit<Exercise, 'id'>) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Library({ exercises, onAdd, onDelete, onBack }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('push');
  const [muscle, setMuscle] = useState('');
  const [showMuscleDropdown, setShowMuscleDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const muscleInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allMuscles = useMemo(() => {
    const set = new Set<string>();
    for (const ex of exercises) {
      if (!ex.muscle) continue;
      for (const m of ex.muscle.split(' / ')) {
        const trimmed = m.trim().toLowerCase();
        if (trimmed) set.add(trimmed);
      }
    }
    return Array.from(set).sort();
  }, [exercises]);

  const filteredMuscles = useMemo(() => {
    const q = muscle.trim().toLowerCase();
    if (!q) return allMuscles;
    return allMuscles.filter((m) => m.includes(q));
  }, [muscle, allMuscles]);

  const isCustomValue = muscle.trim() && !allMuscles.includes(muscle.trim().toLowerCase());

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        muscleInputRef.current && !muscleInputRef.current.contains(e.target as Node)
      ) {
        setShowMuscleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = activeCategory === 'all'
    ? exercises
    : exercises.filter((e) => e.category === activeCategory);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filtered.filter((e) => e.category === cat);
    return acc;
  }, {} as Record<Category, Exercise[]>);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), category, muscle: muscle.trim() || undefined });
    setName('');
    setMuscle('');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Library</p>
            <h1 className="text-xl font-bold text-slate-900">Exercises</h1>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors ${
              showForm
                ? 'bg-slate-100 text-slate-600'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'
            }`}
          >
            {showForm ? 'Cancel' : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="mx-5 mb-4 bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm animate-slide-up">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">New exercise</p>
          <input
            type="text"
            placeholder="Exercise name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full bg-slate-50 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 focus:outline-none focus:border-indigo-400 placeholder-slate-400"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 text-sm border border-slate-200 focus:outline-none focus:border-indigo-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <div className="relative">
            <input
              ref={muscleInputRef}
              type="text"
              placeholder="Muscle group"
              value={muscle}
              onChange={(e) => { setMuscle(e.target.value); setShowMuscleDropdown(true); }}
              onFocus={() => setShowMuscleDropdown(true)}
              className="w-full bg-slate-50 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 focus:outline-none focus:border-indigo-400 placeholder-slate-400"
            />
            {showMuscleDropdown && (filteredMuscles.length > 0 || isCustomValue) && (
              <div
                ref={dropdownRef}
                className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto"
              >
                {isCustomValue && (
                  <button
                    type="button"
                    onClick={() => { setShowMuscleDropdown(false); }}
                    className="w-full text-left px-3.5 py-2 text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2"
                  >
                    <span className="text-indigo-600 font-medium">Add</span>
                    <span className="text-slate-800">"{muscle.trim()}"</span>
                  </button>
                )}
                {filteredMuscles.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMuscle(capitalize(m)); setShowMuscleDropdown(false); }}
                    className="w-full text-left px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {capitalize(m)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            Save exercise
          </button>
        </div>
      )}

      {/* Category filter pills */}
      <div className="px-5 pb-4 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {(['all', ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? 'all' : cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise list */}
      <div className="flex-1 px-5 pb-10 space-y-6 overflow-y-auto">
        {CATEGORIES.map((cat) => {
          if (grouped[cat].length === 0) return null;
          return (
            <div key={cat}>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                {CATEGORY_LABELS[cat]}
              </p>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {grouped[cat].map((ex) => (
                  <div key={ex.id} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{ex.name}</p>
                      {ex.muscle && (
                        <p className="text-xs text-slate-500 capitalize mt-0.5">{ex.muscle}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onDelete(ex.id)}
                      className="text-slate-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm text-center pt-12">No exercises here yet.</p>
        )}
      </div>
    </div>
  );
}
