import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { WorkoutLog, Exercise, StreakData, Category } from '../types';
import { defaultExercises } from '../data/defaultExercises';

const barbellIds = new Set(defaultExercises.filter((e) => e.barbell).map((e) => e.id));

type Props = {
  log: WorkoutLog;
  exercises: Exercise[];
  streak: StreakData;
  onDone: () => void;
};

const CATEGORY_LABELS: Record<Category, string> = {
  push: 'Push', pull: 'Pull', legs: 'Legs', core: 'Core',
  cardio: 'Cardio', crossfit: 'Crossfit', fullbody: 'Full Body', yoga: 'Yoga', custom: 'Custom Workout',
};


function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function Summary({ log, exercises, streak, onDone }: Props) {
  const [capturing, setCapturing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Re-order to match session visual layout: warmup → barbell → work sets → cooldown
  const sortedExercises = [
    ...log.exercises.filter((e) => e.phase === 'warmup'),
    ...log.exercises.filter((e) => !e.phase && barbellIds.has(e.exerciseId)),
    ...log.exercises.filter((e) => !e.phase && !barbellIds.has(e.exerciseId)),
    ...log.exercises.filter((e) => e.phase === 'cooldown'),
  ];

  const done = log.exercises.filter((e) => e.done);
  const total = log.exercises.length;

  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f1f5f9',
        logging: false,
      });

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      const file = new File([blob], `workout-${log.date}.png`, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${CATEGORY_LABELS[log.category]} Workout` });
      } else {
        // Desktop fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workout-${log.date}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // user cancelled or share failed — do nothing
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-6 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Workout summary</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Nice work!</h1>
        </div>
        {streak.current > 0 && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 shadow-sm">
            <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-slate-700 font-semibold text-sm leading-none">
              {streak.current}
              <span className="font-normal text-slate-500 ml-1">{streak.current === 1 ? 'day' : 'days'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Capture target — padded wrapper gives breathing room around the card in the image */}
      <div className="px-5 flex-1">
        <div ref={cardRef} className="bg-slate-100 rounded-3xl p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="px-6 pt-6 pb-5 border-b border-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                {log.name ?? CATEGORY_LABELS[log.category]}
              </p>
              <p className="text-slate-800 font-bold text-lg leading-tight">Workout complete</p>
              <p className="text-slate-500 text-sm mt-0.5">{formatDate(log.date)}</p>
            </div>

            {/* Exercise list */}
            <div className="px-6 py-2 divide-y divide-slate-50">
              {sortedExercises.map((we) => {
                const ex = exercises.find((e) => e.id === we.exerciseId);
                if (!ex) return null;
                const setsDone = (we.sets ?? []).filter((s) => s.reps > 0);
                return (
                  <div key={we.exerciseId} className="flex items-center gap-3 py-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      we.done ? 'bg-emerald-500' : 'bg-slate-100'
                    }`}>
                      {we.done ? (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${we.done ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                        {ex.name}
                      </p>
                      {setsDone.length > 0 && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {setsDone.map((s, i) => (
                            <span key={i}>
                              {i > 0 && <span className="mx-1 text-slate-200">·</span>}
                              {s.reps} reps{s.weight ? ` @ ${s.weight}kg` : ''}
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">{done.length}</span>
                <span className="text-slate-500"> of {total} completed</span>
              </p>
              {streak.current > 0 && (
                <p className="text-xs font-semibold text-indigo-500">
                  {streak.current} day streak
                </p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pt-5 pb-10 space-y-3">
        <button
          onClick={handleShareImage}
          disabled={capturing}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {capturing ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating image...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share workout
            </>
          )}
        </button>

        <button
          onClick={onDone}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-all active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
