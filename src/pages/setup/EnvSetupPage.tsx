import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Copy, Database, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { PageShell } from '../../components/PageShell';
import { supabaseConfigStatus } from '../../lib/supabase';

const envExample = `VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co\nVITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA_AQUI`;

export function EnvSetupPage() {
  async function copyExample() {
    await navigator.clipboard.writeText(envExample);
    toast.success('Modelo copiado. Cole no arquivo .env.local');
  }

  return (
    <PageShell>
      <main className="grid min-h-[92vh] place-items-center py-10">
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="premium-card w-full max-w-3xl overflow-hidden p-6 sm:p-8 lg:p-10"
        >
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[1.4rem] bg-cocoa text-white shadow-glow">
            <Database className="h-7 w-7" />
          </div>

          <p className="premium-label text-center">Configuração necessária</p>
          <h1 className="mt-3 text-center font-display text-4xl leading-tight text-cocoa sm:text-5xl">
            Conecte o Supabase para abrir a lista
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-cocoa/65 sm:text-base">
            A tela ficou em branco porque o projeto ainda não encontrou corretamente a URL e a chave pública do Supabase.
            Crie ou ajuste o arquivo <strong>.env.local</strong> na raiz do projeto e reinicie o servidor.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.6rem] border border-cocoa/10 bg-white/70 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-cocoa">
                {supabaseConfigStatus.hasUrl && supabaseConfigStatus.urlLooksValid ? (
                  <CheckCircle2 className="h-5 w-5 text-olive" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-gold" />
                )}
                URL do projeto
              </div>
              <p className="text-sm leading-6 text-cocoa/62">
                {supabaseConfigStatus.hasUrl
                  ? supabaseConfigStatus.urlLooksValid
                    ? 'Encontramos uma URL com formato válido.'
                    : 'A URL foi encontrada, mas parece estar incompleta ou inválida.'
                  : 'Ainda não encontramos VITE_SUPABASE_URL.'}
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-cocoa/10 bg-white/70 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-cocoa">
                {supabaseConfigStatus.hasKey ? (
                  <CheckCircle2 className="h-5 w-5 text-olive" />
                ) : (
                  <KeyRound className="h-5 w-5 text-gold" />
                )}
                Chave pública
              </div>
              <p className="text-sm leading-6 text-cocoa/62">
                {supabaseConfigStatus.hasKey
                  ? 'Encontramos VITE_SUPABASE_ANON_KEY.'
                  : 'Ainda não encontramos VITE_SUPABASE_ANON_KEY.'}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.6rem] border border-gold/20 bg-[#FFF8F5] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-cocoa">Modelo do .env.local</p>
              <button
                type="button"
                onClick={copyExample}
                className="inline-flex items-center gap-2 rounded-full bg-cocoa px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </button>
            </div>
            <pre className="overflow-x-auto rounded-2xl bg-cocoa p-4 text-xs leading-6 text-white sm:text-sm">
              {envExample}
            </pre>
          </div>

          <div className="mt-8 space-y-3 rounded-[1.6rem] border border-cocoa/10 bg-white/60 p-5 text-sm leading-7 text-cocoa/70">
            <p><strong>1.</strong> Na raiz do projeto, crie um arquivo chamado <strong>.env.local</strong>.</p>
            <p><strong>2.</strong> Cole a URL do Supabase e a chave pública dentro dele.</p>
            <p><strong>3.</strong> Pare o terminal com <strong>Ctrl + C</strong> e rode novamente <strong>npm.cmd run dev</strong>.</p>
          </div>
        </motion.section>
      </main>
    </PageShell>
  );
}
