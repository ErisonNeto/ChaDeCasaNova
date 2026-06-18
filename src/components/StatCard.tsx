import type { LucideIcon } from 'lucide-react';

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
};

export function StatCard({ label, value, icon: Icon, hint }: Props) {
  return (
    <div className="rounded-[1.6rem] border border-white bg-white/80 p-4 shadow-soft sm:rounded-[1.8rem] sm:p-5">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="truncate text-[0.68rem] font-bold uppercase tracking-[.16em] text-cocoa/45 sm:text-xs sm:tracking-[.2em]">{label}</p>
          <p className="mt-3 font-display text-3xl leading-none text-cocoa sm:text-4xl">{value}</p>
          {hint && <p className="mt-2 text-sm text-cocoa/55">{hint}</p>}
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-champagne text-olive sm:h-12 sm:w-12">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
