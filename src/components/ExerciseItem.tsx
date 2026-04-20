import { useState } from 'react';
import { WorkoutExercise, Exercise, SetLog } from '../types';
// import MuscleMap from './MuscleMap';

type Props = {
  exercise: Exercise;
  workoutEx: WorkoutExercise;
  onChange: (updated: WorkoutExercise) => void;
};

export default function ExerciseItem({ exercise, workoutEx, onChange }: Props) {
  const [showLog, setShowLog] = useState(false);

  const toggleDone = () => onChange({ ...workoutEx, done: !workoutEx.done });

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
      {/* Main row — entire row toggles done */}
      <div
        onClick={toggleDone}
        className="flex items-center gap-4 px-4 py-4 cursor-pointer select-none"
      >
        {/* Checkbox (visual only) */}
        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
          workoutEx.done
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-slate-300'
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
            <p className="text-xs text-slate-400 capitalize mt-0.5">{exercise.muscle}</p>
          )}
        </div>

        {/* Log toggle — stopPropagation so it doesn't trigger toggleDone */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowLog((v) => !v); }}
          className={`text-xs px-2.5 py-1 rounded-lg transition-colors duration-100 ${
            showLog
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          {showLog ? 'hide' : 'log'}
        </button>
      </div>

      {/* Expanded panel */}
      {showLog && (
        <div className="border-t border-slate-100 animate-slide-up">
          <div className="px-4 pt-4 pb-5 flex items-start gap-5">

            {/* Muscle map — commented out for now */}
            {/* {exercise.muscle && (
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <MuscleMap muscle={exercise.muscle} size={44} />
                <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest capitalize">
                  {exercise.muscle}
                </p>
              </div>
            )} */}

            {/* Set logging */}
            <div className="flex-1 space-y-2 pt-1">
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
                  <span className="text-xs text-slate-400">reps</span>
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
                  <span className="text-xs text-slate-400">kg</span>
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
