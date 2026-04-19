type RegionId =
  | 'chest_l' | 'chest_r'
  | 'shoulder_l' | 'shoulder_r'
  | 'bicep_l' | 'bicep_r'
  | 'abs' | 'oblique_l' | 'oblique_r'
  | 'quad_l' | 'quad_r'
  | 'calf_l' | 'calf_r';

// keyword → regions to highlight (front-view only)
const MUSCLE_MAP: [string, RegionId[]][] = [
  ['chest',           ['chest_l',    'chest_r']],
  ['pec',             ['chest_l',    'chest_r']],
  ['shoulder',        ['shoulder_l', 'shoulder_r']],
  ['delt',            ['shoulder_l', 'shoulder_r']],
  ['bicep',           ['bicep_l',    'bicep_r']],
  ['abs',             ['abs']],
  ['lower abs',       ['abs']],
  ['oblique',         ['oblique_l',  'oblique_r']],
  ['core',            ['abs', 'oblique_l', 'oblique_r']],
  ['stability',       ['abs', 'oblique_l', 'oblique_r']],
  ['quad',            ['quad_l',     'quad_r']],
  ['hamstring',       ['quad_l',     'quad_r']],
  ['leg',             ['quad_l',     'quad_r']],
  ['glute',           ['quad_l',     'quad_r']],
  ['posterior chain', ['quad_l',     'quad_r']],
  ['calf',            ['calf_l',     'calf_r']],
  // back / lats / triceps not visible in front view — show neutral
];

function getHighlighted(muscle: string): Set<RegionId> {
  const m = muscle.toLowerCase();
  for (const [kw, regions] of MUSCLE_MAP) {
    if (m.includes(kw)) return new Set(regions);
  }
  return new Set();
}

type Props = { muscle: string; size?: number };

export default function MuscleMap({ muscle, size = 44 }: Props) {
  const lit = getHighlighted(muscle);
  const height = Math.round(size * (162 / 80));

  const ACTIVE  = '#4F46E5'; // indigo-600
  const PASSIVE = '#CBD5E1'; // slate-300
  const NEUTRAL = '#E2E8F0'; // slate-200 (non-muscle: head, neck, forearms, hips, knees, feet)
  const SEP     = 'white';   // white stroke separates adjacent shapes

  const f = (id: RegionId) => (lit.has(id) ? ACTIVE : PASSIVE);
  const sw = 1.5;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 80 162"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Neutral (non-muscle) shapes ── */}

      {/* Head */}
      <ellipse cx="40" cy="10" rx="10" ry="11"
        fill={NEUTRAL} stroke={SEP} strokeWidth={sw} />

      {/* Neck */}
      <path d="M35 20 L45 20 L44 26 L36 26 Z"
        fill={NEUTRAL} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Left forearm */}
      <path d="M7 73 L21 73 L19 95 L5 95 Z"
        fill={NEUTRAL} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Right forearm */}
      <path d="M59 73 L73 73 L75 95 L62 95 Z"
        fill={NEUTRAL} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Hip / pelvis */}
      <path d="M21 80 L59 80 L61 92 L19 92 Z"
        fill={NEUTRAL} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Left knee */}
      <path d="M17 137 L36 137 L35 144 L16 144 Z"
        fill={NEUTRAL} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Right knee */}
      <path d="M44 137 L63 137 L64 144 L45 144 Z"
        fill={NEUTRAL} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Left foot */}
      <path d="M14 160 L33 160 L34 162 L12 162 Z"
        fill={NEUTRAL} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Right foot */}
      <path d="M47 160 L66 160 L68 162 L46 162 Z"
        fill={NEUTRAL} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* ── Muscle regions ── */}

      {/* Left shoulder */}
      <path d="M22 26 Q12 28 10 38 Q10 47 18 50 L26 48 L28 28 Z"
        fill={f('shoulder_l')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Right shoulder */}
      <path d="M58 26 Q68 28 70 38 Q70 47 62 50 L54 48 L52 28 Z"
        fill={f('shoulder_r')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Left pec */}
      <path d="M28 28 L40 26 L40 54 Q33 58 26 54 Q22 50 23 42 Z"
        fill={f('chest_l')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Right pec */}
      <path d="M40 26 L52 28 Q57 34 57 42 Q56 50 54 54 L40 54 Z"
        fill={f('chest_r')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Left upper arm (bicep front) */}
      <path d="M9 46 L23 46 L21 72 L8 72 Z"
        fill={f('bicep_l')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Right upper arm */}
      <path d="M57 46 L71 46 L72 72 L59 72 Z"
        fill={f('bicep_r')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Abs */}
      <path d="M31 56 L49 56 L48 80 L32 80 Z"
        fill={f('abs')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Left oblique */}
      <path d="M23 56 L31 56 L32 80 L21 78 Z"
        fill={f('oblique_l')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Right oblique */}
      <path d="M49 56 L57 56 L59 78 L48 80 Z"
        fill={f('oblique_r')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Left quad */}
      <path d="M19 92 L38 92 L36 136 L17 136 Z"
        fill={f('quad_l')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Right quad */}
      <path d="M42 92 L61 92 L63 136 L44 136 Z"
        fill={f('quad_r')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Left calf */}
      <path d="M17 145 L35 145 L33 160 L15 160 Z"
        fill={f('calf_l')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />

      {/* Right calf */}
      <path d="M45 145 L63 145 L65 160 L47 160 Z"
        fill={f('calf_r')} stroke={SEP} strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  );
}
