import { useState, useEffect, useLayoutEffect, useRef } from 'react';

type Mode = 'stopwatch' | 'rest';
type Props = { visible: boolean; onClose: () => void; onRunningChange: (running: boolean) => void; };

const REST_PRESETS = [30, 45, 60, 90, 120];
const EASING = 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)';

function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function TimerSheet({ visible, onClose, onRunningChange }: Props) {
  const [mode, setMode] = useState<Mode>('stopwatch');
  const [fullscreen, setFullscreen] = useState(false);

  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [restRemaining, setRestRemaining] = useState(60);
  const [restRunning, setRestRunning] = useState(false);
  const [restDone, setRestDone] = useState(false);

  const swInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const restInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Direct DOM ref — all position updates bypass React to avoid re-renders during drag
  const sheetRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const partialHeightRef = useRef(440);

  // Drag refs — all refs so no re-renders during pointer move
  const dragging = useRef(false);
  const dragStartY = useRef(0);
  const dragBaseOffset = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0); // px/ms, positive = downward
  const fullscreenRef = useRef(false);
  fullscreenRef.current = fullscreen;

  const audioCtxRef = useRef<AudioContext | null>(null);

  // ── helpers ────────────────────────────────────────────────────────────────

  const partialOffset = () => window.innerHeight - partialHeightRef.current;

  const move = (y: number, animated = false) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = animated ? EASING : 'none';
    el.style.transform = `translateY(${y}px)`;
  };

  const currentOffset = () => {
    const m = sheetRef.current?.style.transform?.match(/translateY\((.+)px\)/);
    return m ? parseFloat(m[1]) : (fullscreenRef.current ? 0 : partialOffset());
  };

  // ── show / hide ────────────────────────────────────────────────────────────

  // Position off-screen before first paint so it never flashes visible
  useLayoutEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${window.innerHeight}px)`;
    }
  }, []);

  const measurePartialHeight = () => {
    if (!innerRef.current) return;
    const total = Array.from(innerRef.current.children).reduce(
      (sum, child) => sum + (child as HTMLElement).offsetHeight, 0
    );
    if (total > 50) partialHeightRef.current = total;
  };

  useEffect(() => {
    if (visible) {
      measurePartialHeight(); // measure before animating in so height is correct
      move(window.innerHeight);
      setFullscreen(false);
      requestAnimationFrame(() => move(partialOffset(), true));
    } else {
      move(window.innerHeight, true);
      setFullscreen(false);
      setRestDone(false);
      setRestRunning(false);
      setRestRemaining(restDuration);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-measure and reposition when switching tabs while sheet is open
  useEffect(() => {
    if (!visible || fullscreen) return;
    measurePartialHeight();
    move(partialOffset(), true);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── snap ──────────────────────────────────────────────────────────────────

  const snapTo = (toFullscreen: boolean, close = false) => {
    if (close) {
      move(window.innerHeight, true);
      setTimeout(onClose, 320);
      return;
    }
    if (toFullscreen) {
      // Change layout first, then animate so the full-screen layout is in place
      setFullscreen(true);
      requestAnimationFrame(() => move(0, true));
    } else {
      // Animate first, change layout after so the layout shift isn't visible
      move(partialOffset(), true);
      setTimeout(() => setFullscreen(false), 320);
    }
  };

  // ── drag handlers (no setState — direct DOM only) ─────────────────────────

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    dragStartY.current = e.clientY;
    dragBaseOffset.current = currentOffset();
    lastY.current = e.clientY;
    lastT.current = Date.now();
    velocity.current = 0;
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const now = Date.now();
    const dt = now - lastT.current;
    if (dt > 0) velocity.current = (e.clientY - lastY.current) / dt;
    lastY.current = e.clientY;
    lastT.current = now;

    const raw = dragBaseOffset.current + (e.clientY - dragStartY.current);
    // Clamp: can't drag above 0 (fullscreen top) or too far below
    move(Math.max(-20, Math.min(window.innerHeight * 0.85, raw)));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const delta = e.clientY - dragStartY.current;
    const vel = velocity.current;

    if (fullscreenRef.current) {
      // In fullscreen: drag down to collapse
      if (delta > 80 || vel > 0.6) snapTo(false);
      else move(0, true); // spring back to fullscreen
    } else {
      // In partial: drag up to expand, drag down to close
      if (delta < -60 || vel < -0.6) snapTo(true);
      else if (delta > 80 || vel > 0.8) snapTo(false, true);
      else move(partialOffset(), true); // spring back to partial
    }
  };

  // ── audio ─────────────────────────────────────────────────────────────────

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
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t); osc.stop(t + 0.2);
    };
    beep(ctx.currentTime);
    beep(ctx.currentTime + 0.28);
    beep(ctx.currentTime + 0.56);
  };

  useEffect(() => () => { audioCtxRef.current?.close(); }, []);

  // ── timer effects ─────────────────────────────────────────────────────────

  useEffect(() => {
    onRunningChange(swRunning || restRunning);
  }, [swRunning, restRunning, onRunningChange]);

  useEffect(() => {
    if (swRunning) swInterval.current = setInterval(() => setSwElapsed(e => e + 1), 1000);
    else if (swInterval.current) clearInterval(swInterval.current);
    return () => { if (swInterval.current) clearInterval(swInterval.current); };
  }, [swRunning]);

  useEffect(() => {
    if (restRunning) {
      restInterval.current = setInterval(() => {
        setRestRemaining(r => {
          if (r <= 1) { setRestRunning(false); setRestDone(true); playBeeps(); navigator.vibrate?.([200, 100, 200]); return 0; }
          return r - 1;
        });
      }, 1000);
    } else if (restInterval.current) clearInterval(restInterval.current);
    return () => { if (restInterval.current) clearInterval(restInterval.current); };
  }, [restRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const setPreset = (s: number) => { setRestDuration(s); setRestRemaining(s); setRestRunning(false); setRestDone(false); };
  const resetSw = () => { setSwRunning(false); setSwElapsed(0); };
  const handleRestToggle = () => { unlockAudio(); setRestRunning(r => !r); };
  const handleSwToggle = () => { unlockAudio(); setSwRunning(r => !r); };

  const isFs = fullscreen;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      {visible && !fullscreen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      )}

      {/* Outer wrapper — overflow-hidden clips the sheet when it's translated below viewport */}
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        <div
          ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl pointer-events-auto"
          style={{ height: '100dvh', willChange: 'transform' }}
        >
          {/* ── inner flex column ── */}
          <div ref={innerRef} className="flex flex-col h-full">

            {/* Drag handle — touch target for swipe */}
            <div
              className="flex justify-center pt-3 pb-2 touch-none cursor-grab active:cursor-grabbing select-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Tabs */}
            <div className="flex mx-5 mt-1 bg-slate-100 rounded-xl p-1 flex-shrink-0">
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
            <div className={`flex flex-col items-center px-5 ${isFs ? 'flex-1 justify-center pb-16' : 'pt-8 pb-4 flex-shrink-0'}`}>
              {mode === 'stopwatch' ? (
                <>
                  <p className={`font-bold tabular-nums tracking-tight leading-none ${isFs ? 'text-9xl' : 'text-7xl'} ${
                    swRunning ? 'text-indigo-600' : 'text-slate-900'
                  }`}>{fmt(swElapsed)}</p>
                  <p className="text-xs text-slate-400 mt-3 uppercase tracking-widest">Elapsed</p>
                  <div className="flex gap-3 mt-10">
                    <button
                      onClick={handleSwToggle}
                      className={`px-10 py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
                        swRunning ? 'bg-slate-100 text-slate-700' : 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      }`}
                    >
                      {swRunning ? 'Pause' : swElapsed > 0 ? 'Resume' : 'Start'}
                    </button>
                    {swElapsed > 0 && !swRunning && (
                      <button onClick={resetSw} className="px-6 py-3.5 rounded-2xl text-sm text-slate-400 bg-slate-100 hover:bg-slate-200 transition-colors">Reset</button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className={`font-bold tabular-nums tracking-tight leading-none ${isFs ? 'text-9xl' : 'text-7xl'} ${
                    restDone ? 'text-emerald-500' : restRunning ? 'text-indigo-600' : 'text-slate-900'
                  }`}>{fmt(restRemaining)}</p>
                  <p className={`text-xs mt-3 uppercase tracking-widest font-medium ${restDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {restDone ? "Break's over, let's go!" : 'Remaining'}
                  </p>

                  <div className="flex gap-2 mt-6">
                    {REST_PRESETS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setPreset(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          restDuration === s && !restDone ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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
                          restRunning ? 'bg-slate-100 text-slate-700' : 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
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

            {!isFs && <div className="h-8 flex-shrink-0" />}
          </div>
        </div>
      </div>
    </>
  );
}
