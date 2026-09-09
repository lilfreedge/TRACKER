import { useLang } from '../lib/i18n';

export default function Loading() {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative w-24 h-24">
        <img
          src="/loading-avatar.png"
          alt=""
          className="w-24 h-24 object-cover rounded-full border-4 border-emerald-500/30"
        />
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
      <div className="text-slate-500 dark:text-slate-400 text-sm">{t('loading')}</div>
    </div>
  );
}
