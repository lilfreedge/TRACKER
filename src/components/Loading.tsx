export default function Loading({ label }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 py-16">
      <div className="relative" style={{ width: 240, height: 240 }}>
        <img
          src="/loading-avatar.png"
          alt=""
          className="w-full h-full object-cover rounded-full border-[6px] border-emerald-500/30"
        />
        <div className="absolute inset-0 rounded-full border-[6px] border-emerald-500 border-t-transparent animate-spin" />
      </div>
      <div className="text-slate-500 dark:text-slate-400 text-sm tracking-wide">
        {label ?? 'Loading…'}
      </div>
    </div>
  );
}
