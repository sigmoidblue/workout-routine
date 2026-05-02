import { useState, useMemo, useEffect } from 'react';
import { Category, Exercise, CustomPreset } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

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
  onStart: (pool: Exercise[], name?: string) => void;
  onBack: () => void;
};

const ALL_CATS = new Set(STANDARD_CATEGORIES.map((c) => c.value));

export default function CustomBuilder({ exercises, onStart, onBack }: Props) {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCats, setSelectedCats] = useState<Set<Category>>(new Set());
  const [selectedMuscles, setSelectedMuscles] = useState<Set<string>>(new Set());
  const [presets, setPresets] = useLocalStorage<CustomPreset[]>('wr_custom_presets', []);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [activePresetName, setActivePresetName] = useState<string | undefined>();

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

  const hasSelection = selectedCats.size > 0 || selectedMuscles.size > 0 || selectAll;

  const toggleAll = () => {
    setActivePresetName(undefined);
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
    setActivePresetName(undefined);
    setSelectAll(false);
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const toggleMuscle = (muscle: string) => {
    setActivePresetName(undefined);
    setSelectAll(false);
    setSelectedMuscles((prev) => {
      const next = new Set(prev);
      if (next.has(muscle)) next.delete(muscle); else next.add(muscle);
      return next;
    });
  };

  const savePreset = () => {
    setPresets((prev: CustomPreset[]) => [...prev, {
      id: Math.random().toString(36).slice(2, 10),
      name: nameValue.trim(),
      categories: Array.from(selectedCats),
      muscles: Array.from(selectedMuscles),
    }]);
    setShowNameInput(false);
    setNameValue('');
  };

  const loadPreset = (preset: CustomPreset) => {
    const cats = new Set(preset.categories) as Set<Category>;
    setSelectedCats(cats);
    setSelectedMuscles(new Set(preset.muscles));
    setSelectAll(cats.size === ALL_CATS.size && preset.muscles.length === 0);
    setActivePresetName(preset.name);
  };

  const catLabelMap = Object.fromEntries(STANDARD_CATEGORIES.map(c => [c.value, c.label]));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
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
          {hasSelection && (
            <button
              onClick={() => { setShowNameInput(v => !v); setNameValue(''); }}
              className={`p-2 rounded-xl border shadow-sm transition-colors ${
                showNameInput
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
              title="Save preset"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={showNameInput ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>

        {/* Inline name input */}
        {showNameInput && (
          <div className="mt-3 flex gap-2 items-center">
            <input
              autoFocus
              type="text"
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && nameValue.trim()) savePreset(); }}
              placeholder="Preset name…"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={savePreset}
              disabled={!nameValue.trim()}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                nameValue.trim()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Save
            </button>
            <button
              onClick={() => { setShowNameInput(false); setNameValue(''); }}
              className="px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
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

        {/* Saved presets */}
        {presets.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Saved</p>
            <div className="space-y-2">
              {presets.map((preset: CustomPreset) => {
                const tags = [
                  ...preset.categories.map((c: Category) => catLabelMap[c] ?? c),
                  ...preset.muscles.map(capitalize),
                ].slice(0, 3);
                return (
                  <div
                    key={preset.id}
                    className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm"
                  >
                    <button
                      className="flex-1 flex flex-col items-start gap-1.5 text-left"
                      onClick={() => loadPreset(preset)}
                    >
                      <span className="text-sm font-semibold text-slate-800">{preset.name}</span>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setPresets((prev: CustomPreset[]) => prev.filter((p: CustomPreset) => p.id !== preset.id))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Start button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-6 bg-gradient-to-t from-[#eef1f8] via-[#eef1f8]/90 to-transparent">
        <button
          onClick={() => onStart(matchingPool, activePresetName)}
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
