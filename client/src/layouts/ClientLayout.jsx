import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faTicket, faUserShield, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';

export default function ClientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('clientToken'));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('clientToken'));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="client-shell font-sans">
      <header className="sticky top-0 z-30 border-b border-brand-pearl/10 bg-brand-black/25 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3 text-lg font-display font-black tracking-widest text-brand-peach uppercase">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-brand-pearl/20 bg-brand-studio/30 text-brand-peach client-glow"><FontAwesomeIcon icon={faFilm} /></span>
            Violet
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden rounded-full px-4 py-2 text-xs font-display font-medium uppercase tracking-[0.2em] text-brand-pearl hover:text-brand-peach sm:inline-flex"><FontAwesomeIcon icon={faTicket} className="mr-2" /> Movies</Link>
            <ThemeToggle compact />
            
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-pearl/20 bg-brand-studio/20 px-4 py-2 text-xs font-display font-bold uppercase tracking-[0.14em] text-brand-peach transition hover:border-brand-studio hover:bg-brand-studio/40">
                  <FontAwesomeIcon icon={faUser} /> Profile
                </Link>
                <button onClick={handleLogout} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-pearl/10 bg-brand-black/20 text-brand-pearl transition hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-500" title="Đăng xuất">
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-pearl/20 bg-brand-studio/25 px-4 py-2 text-xs font-display font-bold uppercase tracking-[0.14em] text-brand-peach transition hover:border-brand-studio hover:bg-brand-studio/45">
                  <FontAwesomeIcon icon={faUser} /> Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="relative z-10 border-t border-brand-pearl/10 bg-brand-black/25 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-brand-pearl sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display font-black tracking-wider text-brand-peach uppercase">Violet Cinema</span>
          <span className="text-xs font-medium opacity-80">Simple booking, live seat availability, no account required.</span>
        </div>
      </footer>
    </div>
  );
}
