// Clean SVG icons (Lucide-inspired). All accept size + className.

const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const CareerIcon = (p: any) => (
  <svg {...base} {...p}>
    <path d="M7 21h10" />
    <path d="M12 17v4" />
    <path d="M6 3h12v6a6 6 0 1 1-12 0V3z" />
    <path d="M6 5H2v2a3 3 0 0 0 3 3" />
    <path d="M18 5h4v2a3 3 0 0 1-3 3" />
  </svg>
);

export const CurrentSeasonIcon = (p: any) => (
  <svg {...base} {...p}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export const CompetitionIcon = (p: any) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.12" />
  </svg>
);

export const RivalsIcon = (p: any) => (
  <svg {...base} {...p}>
    <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6" />
    <path d="m16 16 4 4" />
    <path d="m19 21 2-2" />
    <path d="m5 14-2 2 4 4" />
    <path d="m14.5 6.5-1-1" />
  </svg>
);

export const InfoIcon = (p: any) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export const PlusIcon = (p: any) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export const GripIcon = (p: any) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="5" r="1" fill="currentColor" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="9" cy="19" r="1" fill="currentColor" />
    <circle cx="15" cy="5" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="19" r="1" fill="currentColor" />
  </svg>
);

export const ContractIcon = (p: any) => (
  <svg {...base} {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </svg>
);

export const ChevronUp = (p: any) => (
  <svg {...base} {...p}><path d="m18 15-6-6-6 6" /></svg>
);
export const ChevronDown = (p: any) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);

export const RefreshIcon = (p: any) => (
  <svg {...base} {...p}>
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);
