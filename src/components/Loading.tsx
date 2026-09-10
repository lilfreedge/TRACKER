export default function Loading({ label }: { label?: string }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 py-8">
      <div className="loader-frame">
        <img src="/loading-avatar.png" alt="" className="loader-img" />
        <div className="loader-shimmer" />
      </div>
      <div className="text-slate-500 dark:text-slate-400 text-sm tracking-wide">
        {label ?? 'Loading…'}
      </div>
      <style>{`
        .loader-frame { position: relative; width: min(80vw, 70vh, 560px); height: min(80vw, 70vh, 560px); overflow: hidden; }
        .loader-img { width: 100%; height: 100%; object-fit: contain; animation: loader-pulse 1.6s ease-in-out infinite; }
        .loader-shimmer { position: absolute; top: 0; left: -60%; width: 60%; height: 100%; background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0) 25%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 75%, transparent 100%); animation: loader-shimmer 2s linear infinite; pointer-events: none; mix-blend-mode: screen; }
        @keyframes loader-pulse { 0%,100%{transform:scale(1);filter:brightness(1);} 50%{transform:scale(1.05);filter:brightness(1.08);} }
        @keyframes loader-shimmer { 0%{left:-60%;} 100%{left:160%;} }
      `}</style>
    </div>
  );
}
