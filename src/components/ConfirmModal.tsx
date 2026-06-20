import { AnimatePresence, motion } from 'framer-motion';
import { Gift as GiftIcon, X } from 'lucide-react';
import { Button } from './Button';
import { GiftHero } from './GiftHero';
import type { Gift } from '../types/database';

type Props = {
  gift: Gift | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({ gift, open, loading, onClose, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {open && gift && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-cocoa/35 px-4 py-6 backdrop-blur-sm sm:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/70 bg-porcelain shadow-premium sm:rounded-[2rem]"
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="relative">
              <GiftHero gift={gift} compact />
              <button
                onClick={onClose}
                className="absolute right-3 top-3 z-30 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-cocoa shadow-soft transition hover:bg-white"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 text-center sm:p-8">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
                <GiftIcon className="h-6 w-6" />
              </div>
              <p className="premium-label">Confirmação especial</p>
              <h3 className="mt-3 font-display text-3xl leading-tight text-cocoa sm:text-4xl">Deseja escolher este presente?</h3>
              <p className="mt-3 text-sm leading-6 text-cocoa/65">
                Você está escolhendo <strong>{gift.name}</strong>. Depois da confirmação, ele ficará reservado para você.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button onClick={onConfirm} loading={loading} className="w-full sm:w-auto">
                  Sim, escolher presente
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
