import { motion } from 'framer-motion';
import { ExternalLink, Gift as GiftIcon, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { GiftHero } from './GiftHero';
import type { Gift } from '../types/database';
import { formatCurrency } from '../lib/format';

type Props = {
  gift: Gift;
  isMine?: boolean;
  disabled?: boolean;
  onChoose?: (gift: Gift) => void;
  onCancelChoice?: (gift: Gift) => void;
};

export function GiftCard({ gift, isMine, disabled, onChoose, onCancelChoice }: Props) {
  const isReserved = gift.status === 'reserved';
  const unavailable = isReserved && !isMine;
  const canCancel = Boolean(isMine && onCancelChoice);

  return (
    <motion.article
      layout
      className={`group relative overflow-hidden rounded-[1.75rem] border bg-white/86 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-premium sm:rounded-[2rem] ${unavailable ? 'border-white/60 opacity-75' : 'border-white/80'}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42 }}
    >
      <GiftHero gift={gift} isMine={isMine} />

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
          {canCancel ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onCancelChoice?.(gift)}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              Cancelar minha escolha
            </Button>
          ) : (
            <Button
              onClick={() => onChoose?.(gift)}
              disabled={disabled || unavailable || isMine}
              className="w-full"
            >
              <GiftIcon className="h-4 w-4 shrink-0" />
              {isMine ? 'Escolhido por você' : unavailable ? 'Indisponível' : disabled ? 'Aguarde...' : 'Escolher presente'}
            </Button>
          )}
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
