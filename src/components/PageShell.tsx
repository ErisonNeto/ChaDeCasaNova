import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';
import { DecorativeBackground } from './DecorativeBackground';

export function PageShell({ children }: PropsWithChildren) {
  return (
    <main className="relative min-h-screen overflow-x-hidden font-body text-cocoa">
      <DecorativeBackground />
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </main>
  );
}
