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

export default function TimerSheet({ visible, onClose, onRunningChange }: Props) {
  const [mode, setMode] = useState<Mode>('stopwatch');
  const [fullscreen, setFullscreen] = useState(false);

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

  // Drag-to-expand state
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // AudioContext kept alive so it can be used outside a user-gesture (iOS fix)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const unlockAudio = () => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AC();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    } catch { /* not supported */ }
  };

  const playBeeps = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const beep = (t: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    };
    beep(ctx.currentTime);
    beep(ctx.currentTime + 0.28);
    beep(ctx.currentTime + 0.56);
  };

  useEffect(() => () => { audioCtxRef.current?.close(); }, []);

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
  }, [restRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const setPreset = (s: number) => {
    setRestDuration(s);
    setRestRemaining(s);
    setRestRunning(false);
    setRestDone(false);
  };

  const resetSw = () => { setSwRunning(false); setSwElapsed(0); };

  const handleRestToggle = () => { unlockAudio(); setRestRunning((r) => !r); };
  const handleSwToggle = () => { unlockAudio(); setSwRunning((r) => !r); };

  // Drag handle gesture handlers
  const onHandlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
    setIsDragging(true);
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const raw = e.clientY - dragStartY.current;
    // partial mode: resist upward drag; fullscreen: resist downward drag
    if (!fullscreen) setDragOffset(Math.min(0, raw) * 0.4);
    else setDragOffset(Math.max(0, raw) * 0.4);
  };

  const onHandlePointerUp = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const raw = e.clientY - dragStartY.current;
    dragStartY.current = null;
    setIsDragging(false);
    setDragOffset(0);
    if (!fullscreen && raw < -50) setFullscreen(true);
    else if (fullscreen && raw > 60) setFullscreen(false);
  };

  const isFs = fullscreen && visible;

  return (
    <>
      {/* Backdrop */}
      {visible && !fullscreen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      )}

      {/* Sheet */}
      <div
        className={`fixed z-50 ${!isDragging ? 'transition-all duration-300 ease-in-out' : ''} ${
          isFs
            ? 'inset-0'
            : `bottom-0 left-0 right-0 max-w-md mx-auto ${visible ? 'translate-y-0' : 'translate-y-full'}`
        }`}
        style={isDragging && visible ? { transform: `translateY(${dragOffset}px)` } : undefined}
      >
        <div className={`bg-white shadow-2xl flex flex-col ${isFs ? 'h-full' : 'rounded-t-3xl'}`}>

          {/* Drag handle row — touch target for swipe gesture */}
          <div
            className="flex items-center justify-between px-4 pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
          >
            <div className="w-8" />
            <div className="w-10 h-1 rounded-full bg-slate-200" />
            {isFs ? (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <div className="w-8" />
            )}
          </div>

          {/* Tabs */}
          <div className="flex mx-5 mt-2 bg-slate-100 rounded-xl p-1">
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

          {/* Timer content */}
          <div className={`flex flex-col items-center px-5 ${isFs ? 'flex-1 justify-center pb-16' : 'pt-8 pb-4'}`}>
            {mode === 'stopwatch' ? (
              <>
                <p className={`font-bold tabular-nums tracking-tight leading-none ${isFs ? 'text-9xl' : 'text-7xl'} ${
                  swRunning ? 'text-indigo-600' : 'text-slate-900'
                }`}>
                  {fmt(swElapsed)}
                </p>
                <p className="text-xs text-slate-400 mt-3 uppercase tracking-widest">Elapsed</p>
                <div className="flex gap-3 mt-10">
                  <button
                    onClick={handleSwToggle}
                    className={`px-10 py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
                      swRunning
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
                    }`}
                  >
                    {swRunning ? 'Pause' : swElapsed > 0 ? 'Resume' : 'Start'}
                  </button>
                  {swElapsed > 0 && !swRunning && (
                    <button onClick={resetSw} className="px-6 py-3.5 rounded-2xl text-sm text-slate-400 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Reset
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className={`font-bold tabular-nums tracking-tight leading-none ${isFs ? 'text-9xl' : 'text-7xl'} ${
                  restDone ? 'text-emerald-500' : restRunning ? 'text-indigo-600' : 'text-slate-900'
                }`}>
                  {fmt(restRemaining)}
                </p>
                <p className={`text-xs mt-3 uppercase tracking-widest font-medium ${restDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {restDone ? 'Rest complete!' : 'Remaining'}
                </p>

                <div className="flex gap-2 mt-6">
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

                <div className="flex gap-2 mt-2">
                  <button onClick={() => setPreset(Math.max(15, restDuration - 15))} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors select-none">−15s</button>
                  <button onClick={() => setPreset(Math.min(3600, restDuration + 15))} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors select-none">+15s</button>
                </div>

                <div className="flex gap-3 mt-8">
                  {!restDone && (
                    <button
                      onClick={handleRestToggle}
                      className={`px-10 py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
                        restRunning
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
                      }`}
                    >
                      {restRunning ? 'Pause' : 'Start'}
                    </button>
                  )}
                  <button onClick={() => setPreset(restDuration)} className="px-6 py-3.5 rounded-2xl text-sm text-slate-400 bg-slate-100 hover:bg-slate-200 transition-colors">
                    {restDone ? 'Again' : 'Reset'}
                  </button>
                </div>
              </>
            )}
          </div>

          {!isFs && <div className="h-8" />}
        </div>
      </div>
    </>
  );
}
