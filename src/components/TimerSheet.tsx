import { useState, useEffect, useRef } from 'react';

type Mode = 'stopwatch' | 'rest';

type Props = {
  visible: boolean;
  onClose: () => void;
  onRunningChange: (running: boolean) => void;
};

const REST_PRESETS = [30, 45, 60, 90, 120];

function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function playBeeps() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const beep = (startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
      osc.start(startTime);
      osc.stop(startTime + 0.18);
    };
    beep(ctx.currentTime);
    beep(ctx.currentTime + 0.25);
    beep(ctx.currentTime + 0.5);
    // close context after beeps finish
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // AudioContext not supported — fail silently
  }
}

export default function TimerSheet({ visible, onClose, onRunningChange }: Props) {
  const [mode, setMode] = useState<Mode>('stopwatch');

  // Stopwatch
  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);

  // Rest timer
  const [restDuration, setRestDuration] = useState(60);
  const [restRemaining, setRestRemaining] = useState(60);
  const [restRunning, setRestRunning] = useState(false);
  const [restDone, setRestDone] = useState(false);

  const swInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const restInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Notify parent when any timer is running
  useEffect(() => {
    onRunningChange(swRunning || restRunning);
  }, [swRunning, restRunning, onRunningChange]);

  useEffect(() => {
    if (swRunning) {
      swInterval.current = setInterval(() => setSwElapsed((e) => e + 1), 1000);
    } else {
      if (swInterval.current) clearInterval(swInterval.current);
    }
    return () => { if (swInterval.current) clearInterval(swInterval.current); };
  }, [swRunning]);

  useEffect(() => {
    if (restRunning) {
      restInterval.current = setInterval(() => {
        setRestRemaining((r) => {
          if (r <= 1) {
            setRestRunning(false);
            setRestDone(true);
            playBeeps();
            navigator.vibrate?.([200, 100, 200]);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (restInterval.current) clearInterval(restInterval.current);
    }
    return () => { if (restInterval.current) clearInterval(restInterval.current); };
  }, [restRunning]);

  const setPreset = (s: number) => {
    setRestDuration(s);
    setRestRemaining(s);
    setRestRunning(false);
    setRestDone(false);
  };

  const resetSw = () => {
    setSwRunning(false);
    setSwElapsed(0);
  };

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      )}

      {/* Sheet — always mounted, slides via transform */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 transition-transform duration-300 ease-in-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl">
          {/* Drag handle */}
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          {/* Tabs */}
          <div className="flex mx-5 mt-4 bg-slate-100 rounded-xl p-1">
            {(['stopwatch', 'rest'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                }`}
              >
                {m === 'stopwatch' ? 'Stopwatch' : 'Rest Timer'}
              </button>
            ))}
          </div>

          {/* Timer display */}
          <div className="flex flex-col items-center pt-8 pb-4 px-5">
            {mode === 'stopwatch' ? (
              <>
                <p className={`text-7xl font-bold tabular-nums tracking-tight leading-none ${
                  swRunning ? 'text-indigo-600' : 'text-slate-900'
                }`}>
                  {fmt(swElapsed)}
                </p>
                <p className="text-xs text-slate-400 mt-3 uppercase tracking-widest">Elapsed</p>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setSwRunning((r) => !r)}
                    className={`px-8 py-3 rounded-2xl font-semibold text-sm transition-colors ${
                      swRunning
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
                    }`}
                  >
                    {swRunning ? 'Pause' : swElapsed > 0 ? 'Resume' : 'Start'}
                  </button>
                  {swElapsed > 0 && !swRunning && (
                    <button
                      onClick={resetSw}
                      className="px-5 py-3 rounded-2xl text-sm text-slate-400 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className={`text-7xl font-bold tabular-nums tracking-tight leading-none ${
                  restDone ? 'text-emerald-500' : restRunning ? 'text-indigo-600' : 'text-slate-900'
                }`}>
                  {fmt(restRemaining)}
                </p>
                <p className={`text-xs mt-3 uppercase tracking-widest font-medium ${
                  restDone ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {restDone ? 'Rest complete!' : 'Remaining'}
                </p>

                {/* Presets */}
                <div className="flex gap-2 mt-5">
                  {REST_PRESETS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPreset(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        restDuration === s && !restDone
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {s < 60 ? `${s}s` : `${s / 60}m`}
                    </button>
                  ))}
                </div>

                {/* Custom stepper */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setPreset(Math.max(15, restDuration - 15))}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors select-none"
                  >
                    −15s
                  </button>
                  <button
                    onClick={() => setPreset(Math.min(3600, restDuration + 15))}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors select-none"
                  >
                    +15s
                  </button>
                </div>

                <div className="flex gap-3 mt-6">
                  {!restDone && (
                    <button
                      onClick={() => setRestRunning((r) => !r)}
                      className={`px-8 py-3 rounded-2xl font-semibold text-sm transition-colors ${
                        restRunning
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
                      }`}
                    >
                      {restRunning ? 'Pause' : 'Start'}
                    </button>
                  )}
                  <button
                    onClick={() => setPreset(restDuration)}
                    className="px-5 py-3 rounded-2xl text-sm text-slate-400 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    {restDone ? 'Again' : 'Reset'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Safe area */}
          <div className="h-8" />
        </div>
      </div>
    </>
  );
}
