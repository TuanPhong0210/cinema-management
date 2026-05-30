import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faTicket, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { Link, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';

export default function ClientLayout() {
  return (
    <div className="client-shell">
      <header className="sticky top-0 z-30 border-b border-brand-pearl/10 bg-brand-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3 text-lg font-extrabold tracking-wide text-brand-peach">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-brand-pearl/20 bg-brand-studio/30 text-brand-peach client-glow"><FontAwesomeIcon icon={faFilm} /></span>
            Violet
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-pearl hover:text-brand-peach sm:inline-flex"><FontAwesomeIcon icon={faTicket} className="mr-2" /> Movies</Link>
            <ThemeToggle compact />
            <a href="http://localhost:5174/" className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-pearl/20 bg-brand-martinique/45 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-peach transition hover:border-brand-studio hover:bg-brand-studio/70"><FontAwesomeIcon icon={faUserShield} /> Manager</a>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="relative z-10 border-t border-brand-pearl/10 bg-brand-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-brand-pearl sm:flex-row sm:items-center sm:justify-between">
          <span className="font-bold text-brand-peach">Violet Cinema</span>
          <span>Simple booking, live seat availability, no account required.</span>
        </div>
      </footer>
    </div>
  );
}
