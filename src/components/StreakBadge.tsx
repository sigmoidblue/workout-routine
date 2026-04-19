import { StreakData } from '../types';

type Props = { streak: StreakData };

export default function StreakBadge({ streak }: Props) {
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 shadow-sm">
      <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
      <span className="text-slate-700 font-semibold text-sm leading-none">
        {streak.current}
        <span className="font-normal text-slate-400 ml-1">
          {streak.current === 1 ? 'day' : 'days'}
        </span>
      </span>
    </div>
  );
}
