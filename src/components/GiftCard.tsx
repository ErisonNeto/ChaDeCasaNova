import { motion } from 'framer-motion';
import { ExternalLink, Gift as GiftIcon, Heart, LockKeyhole } from 'lucide-react';
import { Button } from './Button';
import type { Gift } from '../types/database';
import { formatCurrency } from '../lib/format';
import { getGiftFallbackImageUrl, getGiftImageUrl, handleGiftImageError } from '../lib/giftImages';

type Props = {
  gift: Gift;
  isMine?: boolean;
  disabled?: boolean;
  onChoose?: (gift: Gift) => void;
};

export function GiftCard({ gift, isMine, disabled, onChoose }: Props) {
  const isReserved = gift.status === 'reserved';
  const unavailable = isReserved && !isMine;
  const status = isMine ? 'Reservado por você' : isReserved ? 'Já escolhido' : 'Disponível';
  const statusClass = isMine
    ? 'bg-gold/15 text-gold border-gold/30'
    : isReserved
      ? 'bg-cocoa/10 text-cocoa/55 border-cocoa/10'
      : 'bg-sage/15 text-olive border-sage/25';

  return (
    <motion.article
      layout
      className={`group relative overflow-hidden rounded-[1.75rem] border bg-white/80 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-premium sm:rounded-[2rem] ${unavailable ? 'border-white/60 opacity-75' : 'border-white/80'}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42 }}
    >
      <div className="relative h-52 overflow-hidden sm:h-64 lg:h-72">
        <img
          src={getGiftImageUrl(gift)}
          data-fallback={getGiftFallbackImageUrl(gift)}
          alt={gift.name}
          loading="lazy"
          onError={handleGiftImageError}
          className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${unavailable ? 'grayscale-[25%]' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/45 via-transparent to-transparent" />
        <span className={`absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full border px-3 py-1.5 text-[0.68rem] font-bold shadow-soft backdrop-blur sm:left-4 sm:top-4 sm:text-xs ${statusClass}`}>
          {isReserved ? <LockKeyhole className="h-3.5 w-3.5 shrink-0" /> : <Heart className="h-3.5 w-3.5 shrink-0" />}
          <span className="truncate">{status}</span>
        </span>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="premium-label">Presente</p>
            <h3 className="mt-2 break-words font-display text-[1.65rem] leading-tight text-cocoa sm:text-2xl">{gift.name}</h3>
          </div>
          {gift.price !== null && gift.price !== undefined && (
            <p className="w-fit shrink-0 rounded-full bg-champagne px-3 py-1 text-sm font-bold text-cocoa/75">{formatCurrency(gift.price)}</p>
          )}
        </div>
        {gift.description && <p className="mt-3 min-h-0 text-sm leading-6 text-cocoa/65 sm:min-h-[3rem]">{gift.description}</p>}

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <Button
            onClick={() => onChoose?.(gift)}
            disabled={disabled || unavailable || isMine}
            className="w-full"
          >
            <GiftIcon className="h-4 w-4 shrink-0" />
            {isMine ? 'Escolhido por você' : unavailable ? 'Indisponível' : 'Escolher presente'}
          </Button>
          {gift.purchase_url && (
            <a href={gift.purchase_url} target="_blank" rel="noreferrer" className="w-full md:w-auto">
              <Button type="button" variant="secondary" className="w-full whitespace-nowrap">
                <ExternalLink className="h-4 w-4 shrink-0" />
                Ver onde comprar
              </Button>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
