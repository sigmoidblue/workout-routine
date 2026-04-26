import { useState } from 'react';
import { WorkoutExercise, Exercise, SetLog } from '../types';

type Props = {
  exercise: Exercise;
  workoutEx: WorkoutExercise;
  onChange: (updated: WorkoutExercise) => void;
  alternatives?: Exercise[];
  onSwap?: (newExerciseId: string) => void;
};

export default function ExerciseItem({ exercise, workoutEx, onChange, alternatives, onSwap }: Props) {
  const [showLog, setShowLog] = useState(false);
  const [showSwap, setShowSwap] = useState(false);

  const toggleDone = () => {
    setShowSwap(false);
    onChange({ ...workoutEx, done: !workoutEx.done });
  };

  const addSet = () => {
    const sets = [...(workoutEx.sets ?? []), { reps: 0, weight: undefined }];
    onChange({ ...workoutEx, sets });
  };

  const updateSet = (i: number, updated: SetLog) => {
    const sets = (workoutEx.sets ?? []).map((s, idx) => (idx === i ? updated : s));
    onChange({ ...workoutEx, sets });
  };

  const removeSet = (i: number) => {
    const sets = (workoutEx.sets ?? []).filter((_, idx) => idx !== i);
    onChange({ ...workoutEx, sets });
  };

  return (
    <div className={`rounded-2xl border transition-colors duration-150 overflow-hidden ${
      workoutEx.done
        ? 'bg-emerald-50/60 border-emerald-100'
        : 'bg-white border-slate-100 shadow-sm'
    }`}>
      {/* Main row */}
      <div
        onClick={toggleDone}
        className="flex items-center gap-4 px-4 py-4 cursor-pointer select-none"
      >
        {/* Checkbox */}
        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
          workoutEx.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
        }`}>
          {workoutEx.done && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Name + muscle */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-tight ${
            workoutEx.done ? 'line-through text-slate-400' : 'text-slate-800'
          }`}>
            {exercise.name}
          </p>
          {exercise.muscle && (
            <p className="text-xs text-slate-500 capitalize mt-0.5">{exercise.muscle}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Swap button */}
          {onSwap && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowLog(false); setShowSwap((v) => !v); }}
              className={`p-1.5 rounded-lg transition-colors duration-100 ${
                showSwap
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
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
            onClick={(e) => { e.stopPropagation(); setShowSwap(false); setShowLog((v) => !v); }}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors duration-100 ${
              showLog
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showLog ? 'hide' : 'log'}
          </button>
        </div>
      </div>

      {/* Swap picker */}
      {showSwap && (
        <div className="border-t border-slate-100 animate-slide-up px-4 pt-3 pb-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
            Swap · {exercise.muscle}
          </p>
          {alternatives && alternatives.length > 0 ? (
            <div className="space-y-1.5">
              {alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => { onSwap?.(alt.id); setShowSwap(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors text-left group"
                >
                  <span className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">{alt.name}</span>
                  <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No other {exercise.muscle} exercises in your library.
            </p>
          )}
        </div>
      )}

      {/* Log panel */}
      {showLog && (
        <div className="border-t border-slate-100 animate-slide-up">
          <div className="px-4 pt-4 pb-5">
            {/* Trainer tip */}
            {exercise.tip && (
              <p className="text-xs text-slate-500 italic leading-relaxed mb-4 border-l-2 border-indigo-200 pl-3">
                {exercise.tip}
              </p>
            )}

            {/* Set logging */}
            <div className="space-y-2">
              {(workoutEx.sets ?? []).map((set, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 w-5 text-right font-medium">{i + 1}</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(i, { ...set, reps: Number(e.target.value) })}
                    className="w-14 bg-slate-50 text-slate-800 text-sm rounded-lg px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-indigo-400 text-center"
                  />
                  <span className="text-xs text-slate-500">reps</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={set.weight ?? ''}
                    onChange={(e) =>
                      updateSet(i, {
                        ...set,
                        weight: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                    className="w-14 bg-slate-50 text-slate-800 text-sm rounded-lg px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-indigo-400 text-center"
                  />
                  <span className="text-xs text-slate-500">kg</span>
                  <button
                    onClick={() => removeSet(i)}
                    className="text-slate-300 hover:text-red-400 transition-colors p-1 ml-auto"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={addSet}
                className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 mt-1 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
