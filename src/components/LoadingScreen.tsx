import { Home, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageShell } from './PageShell';

export function LoadingScreen({ text = 'Preparando sua lista com carinho...' }: { text?: string }) {
  return (
    <PageShell>
      <div className="flex min-h-[80vh] items-center justify-center px-2">
        <motion.div
          className="premium-card flex w-full max-w-sm flex-col items-center px-6 py-8 text-center sm:px-10 sm:py-9"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          <div className="relative mb-5 grid h-16 w-16 place-items-center rounded-full bg-white shadow-soft">
            <Home className="h-7 w-7 text-olive" />
            <Sparkles className="absolute -right-1 -top-1 h-5 w-5 animate-pulse text-gold" />
          </div>
          <p className="font-display text-2xl leading-tight text-cocoa">{text}</p>
          <div className="mt-6 flex gap-2">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gold" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:160ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:320ms]" />
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
