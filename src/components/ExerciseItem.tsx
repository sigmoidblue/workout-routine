import React, { useState } from 'react';
import { WorkoutExercise, Exercise, SetLog } from '../types';

type Props = {
  exercise: Exercise;
  workoutEx: WorkoutExercise;
  onChange: (updated: WorkoutExercise) => void;
  alternatives?: Exercise[];
  onSwap?: (newExerciseId: string) => void;
  // Superset
  bare?: boolean;           // skip card wrapper — used inside SupersetCard
  ssEnabled?: boolean;      // show link button on unpaired exercises
  linkable?: Exercise[];    // other unpaired exercises available to pair with
  onLink?: (partnerId: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
};

export default function ExerciseItem({
  exercise, workoutEx, onChange,
  alternatives, onSwap,
  bare, ssEnabled, linkable, onLink,
  dragHandleProps,
}: Props) {
  const [showLog, setShowLog] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showLink, setShowLink] = useState(false);

  const hideWeight = exercise.category === 'cardio' || exercise.category === 'yoga';

  const closeAll = () => { setShowLog(false); setShowSwap(false); setShowLink(false); };

  const toggleDone = () => {
    closeAll();
    onChange({ ...workoutEx, done: !workoutEx.done });
  };

  const addSet = () => onChange({ ...workoutEx, sets: [...(workoutEx.sets ?? []), { reps: 0, weight: undefined }] });
  const updateSet = (i: number, updated: SetLog) =>
    onChange({ ...workoutEx, sets: (workoutEx.sets ?? []).map((s, idx) => (idx === i ? updated : s)) });
  const removeSet = (i: number) =>
    onChange({ ...workoutEx, sets: (workoutEx.sets ?? []).filter((_, idx) => idx !== i) });

  const inner = (
    <>
      {/* Main row */}
      <div
        onClick={toggleDone}
        className="flex items-center gap-4 px-4 py-4 cursor-pointer select-none"
      >
        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
          workoutEx.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
        }`}>
          {workoutEx.done && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-tight ${workoutEx.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {exercise.name}
          </p>
          {exercise.muscle && (
            <p className="text-xs text-slate-500 capitalize mt-0.5">{exercise.muscle}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Link button — only on unpaired exercises when SS mode is on */}
          {ssEnabled && linkable && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowSwap(false); setShowLog(false); setShowLink((v) => !v); }}
              className={`p-1.5 rounded-lg transition-colors duration-100 ${
                showLink ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Pair as superset"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          )}

          {/* Swap button */}
          {onSwap && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowLog(false); setShowLink(false); setShowSwap((v) => !v); }}
              className={`p-1.5 rounded-lg transition-colors duration-100 ${
                showSwap ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Swap exercise"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4M4 17h12m0 0l-4-4m4 4l-4 4" />
              </svg>
            </button>
          )}

          {/* Log toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowSwap(false); setShowLink(false); setShowLog((v) => !v); }}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors duration-100 ${
              showLog ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showLog ? 'hide' : 'log'}
          </button>

          {/* Drag handle */}
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-6 h-6 text-slate-300 cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
                <circle cx="2" cy="2" r="1.3" /><circle cx="6" cy="2" r="1.3" />
                <circle cx="2" cy="7" r="1.3" /><circle cx="6" cy="7" r="1.3" />
                <circle cx="2" cy="12" r="1.3" /><circle cx="6" cy="12" r="1.3" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Link picker */}
      {showLink && (
        <div className="border-t border-slate-100 animate-slide-up px-4 pt-3 pb-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
            Pair as superset with
          </p>
          {linkable && linkable.length > 0 ? (
            <div className="space-y-1.5">
              {linkable.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => { onLink?.(ex.id); setShowLink(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors text-left group"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">{ex.name}</p>
                    {ex.muscle && <p className="text-xs text-slate-400 capitalize mt-0.5">{ex.muscle}</p>}
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">All other exercises are already paired.</p>
          )}
        </div>
      )}

      {/* Swap picker */}
      {showSwap && (
        <div className="border-t border-slate-100 animate-slide-up px-4 pt-3 pb-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
            Swap exercise
          </p>
          {alternatives && alternatives.length > 0 ? (
            <div className="space-y-1.5">
              {alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => { onSwap?.(alt.id); setShowSwap(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors text-left group"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">{alt.name}</p>
                    {alt.muscle && <p className="text-xs text-slate-400 capitalize mt-0.5">{alt.muscle}</p>}
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No other exercises available for this day.</p>
          )}
        </div>
      )}

      {/* Log panel */}
      {showLog && (
        <div className="border-t border-slate-100 animate-slide-up">
          <div className="px-4 pt-4 pb-5">
            {exercise.tip && (
              <p className="text-xs text-slate-500 italic leading-relaxed mb-4 border-l-2 border-indigo-200 pl-3">
                {exercise.tip}
              </p>
            )}
            <div className="space-y-2">
              {(workoutEx.sets ?? []).map((set, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 w-5 text-right font-medium">{i + 1}</span>
                  <input
                    type="number" min={0} placeholder="0" value={set.reps || ''}
                    onChange={(e) => updateSet(i, { ...set, reps: Number(e.target.value) })}
                    className="w-14 bg-slate-50 text-slate-800 text-sm rounded-lg px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-indigo-400 text-center"
                  />
                  <span className="text-xs text-slate-500">reps</span>
                  {!hideWeight && (
                    <>
                      <input
                        type="number" min={0} placeholder="0" value={set.weight ?? ''}
                        onChange={(e) => updateSet(i, { ...set, weight: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-14 bg-slate-50 text-slate-800 text-sm rounded-lg px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-indigo-400 text-center"
                      />
                      <span className="text-xs text-slate-500">kg</span>
                    </>
                  )}
                  <button onClick={() => removeSet(i)} className="text-slate-300 hover:text-red-400 transition-colors p-1 ml-auto">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button onClick={addSet} className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 mt-1 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add set
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (bare) return <div>{inner}</div>;

  return (
    <div className={`rounded-2xl border transition-colors duration-150 overflow-hidden ${
      workoutEx.done ? 'bg-emerald-50/60 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'
    }`}>
      {inner}
    </div>
  );
}
