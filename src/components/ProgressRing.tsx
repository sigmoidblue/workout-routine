type Props = {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  pulse?: boolean;
};

export default function ProgressRing({
  completed,
  total,
  size = 128,
  strokeWidth = 8,
  pulse = false,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : completed / total;
  const offset = circumference * (1 - progress);
  const isComplete = progress === 1 && total > 0;

  return (
    <div
      className={`relative flex items-center justify-center ${pulse ? 'animate-pulse-once' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? '#10B981' : '#4F46E5'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.35s ease, stroke 0.25s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-900 leading-none">
          {completed}<span className="text-slate-300 font-light">/{total}</span>
        </span>
        <span className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
          {isComplete ? 'Complete' : 'Done'}
        </span>
      </div>
    </div>
  );
}
