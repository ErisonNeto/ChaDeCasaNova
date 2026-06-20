import { Heart, LockKeyhole } from 'lucide-react';
import type { Gift } from '../types/database';
import { formatHeroTitle, getGiftCategory } from '../lib/giftVisual';

type Props = {
  gift: Gift;
  isMine?: boolean;
  compact?: boolean;
};

export function GiftHero({ gift, isMine, compact = false }: Props) {
  const isReserved = gift.status === 'reserved';
  const status = isMine ? 'Reservado por você' : isReserved ? 'Já escolhido' : 'Disponível';
  const category = getGiftCategory(gift.name);
  const title = formatHeroTitle(gift.name);

  return (
    <div className={`relative overflow-hidden rounded-t-[1.75rem] border-b border-shell/70 bg-[linear-gradient(180deg,#fbf5f0_0%,#f4e7e1_58%,#d8c8c0_100%)] sm:rounded-t-[2rem] ${compact ? 'h-48 sm:h-56' : 'h-[22rem] sm:h-[24rem]'}`}>
      <div className="absolute inset-0 opacity-[0.26] [background-image:linear-gradient(rgba(120,86,76,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(120,86,76,.08)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.92),transparent_58%)]" />
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose/20 blur-3xl" />
      <div className="absolute -left-24 bottom-5 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

      <span className="absolute left-4 top-4 z-20 inline-flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-shell/80 bg-white/72 px-4 py-2 text-xs font-bold text-rose shadow-soft backdrop-blur">
        {isReserved ? <LockKeyhole className="h-3.5 w-3.5 shrink-0" /> : <Heart className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{status}</span>
      </span>

      <div className="absolute inset-x-0 top-8 z-10 text-center">
        <p className="text-[0.68rem] font-bold uppercase tracking-[.52em] text-rose/85">{category}</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div className="relative h-full w-full max-w-[28rem]">
          <div className="absolute left-1/2 top-[4.8rem] h-32 w-64 -translate-x-1/2 rounded-t-full border-[10px] border-[#efc7c0] border-b-0 opacity-95 sm:top-[5.4rem] sm:h-36 sm:w-72" />
          <div className="absolute left-1/2 top-[5.4rem] h-28 w-56 -translate-x-1/2 rounded-t-full border-[4px] border-[#fae7e2] border-b-0 opacity-95 sm:top-[6.1rem] sm:h-32 sm:w-64" />
          <div className="absolute left-1/2 top-[10.3rem] h-12 w-12 -translate-x-1/2 rounded-full bg-porcelain shadow-[0_0_24px_rgba(255,255,255,.75)] sm:top-[11.2rem]" />
          <div className="absolute bottom-[4.8rem] left-1/2 h-[1px] w-44 -translate-x-1/2 rounded-full bg-rose/25 sm:bottom-[5.4rem]" />
        </div>
      </div>

      <div className="absolute inset-x-0 top-[8.7rem] z-20 px-8 text-center sm:top-[9.8rem]">
        <h3 className="mx-auto max-w-[22rem] font-display text-[1.35rem] font-semibold leading-[1.15] text-cocoa drop-shadow-sm sm:text-[1.55rem]">
          {title}
        </h3>
      </div>

      <div className="absolute inset-x-0 bottom-12 z-20 text-center">
        <p className="text-[0.62rem] font-bold uppercase tracking-[.45em] text-rose/75">Chá de Casa Nova</p>
        <p className="mt-2 font-display text-[1.35rem] font-semibold leading-none text-rose">Jeyse & Erison</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#d4c5be]/75 to-transparent" />
    </div>
  );
}
