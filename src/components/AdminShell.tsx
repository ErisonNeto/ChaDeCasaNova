import type { PropsWithChildren } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Gift, Home, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/presentes', label: 'Presentes', icon: Gift },
  { to: '/admin/convidados', label: 'Convidados', icon: Users },
];

export function AdminShell({ children }: PropsWithChildren) {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7EEE9] font-body text-cocoa">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col lg:flex-row">
        <aside className="sticky top-0 z-20 border-b border-cocoa/10 bg-porcelain/95 px-4 py-4 backdrop-blur-xl lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-7">
          <div className="flex items-center justify-between gap-3 lg:block">
            <NavLink to="/admin" className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cocoa text-white shadow-glow sm:h-12 sm:w-12">
                <Home className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-lg leading-none sm:text-xl">Casa Nova</p>
                <p className="mt-1 truncate text-[0.64rem] font-bold uppercase tracking-[.16em] text-gold sm:text-xs sm:tracking-[.2em]">Admin premium</p>
              </div>
            </NavLink>
            <Button variant="ghost" onClick={signOut} className="h-11 w-11 shrink-0 px-0 lg:hidden" aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:mt-10 lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) =>
                  `flex min-w-fit items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition sm:gap-3 ${
                    isActive ? 'bg-cocoa text-white shadow-soft' : 'text-cocoa/65 hover:bg-white hover:text-cocoa'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto hidden pt-10 lg:block">
            <div className="rounded-[1.6rem] border border-gold/20 bg-white/70 p-5 shadow-soft">
              <p className="font-display text-xl">Controle refinado</p>
              <p className="mt-2 text-sm leading-6 text-cocoa/60">
                Acompanhe convidados, reservas e presentes com segurança no banco.
              </p>
              <Button variant="secondary" onClick={signOut} className="mt-5 w-full">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </aside>
        <section className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</section>
      </div>
    </main>
  );
}
