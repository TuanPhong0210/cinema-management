import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faClock, faFilm, faRightFromBracket, faTicket, faUserTie, faUsers, faVideo } from '@fortawesome/free-solid-svg-icons';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';

const links = [
  ['Dashboard', '/manager', faChartLine],
  ['Movies', '/manager/movies', faFilm],
  ['Rooms', '/manager/rooms', faVideo],
  ['Showtimes', '/manager/showtimes', faClock],
  ['Tickets', '/manager/tickets', faTicket],
  ['Employees', '/manager/employees', faUsers],
  ['Attendance', '/manager/attendance', faUserTie]
];

export default function ManagerLayout() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('managerToken');
    navigate('/manager/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-cinema-950 lg:flex">
      <aside className="bg-cinema-950 text-white lg:fixed lg:inset-y-0 lg:w-72">
        <div className="flex h-16 items-center justify-between px-5 lg:h-20">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-violet-200">Manager</p>
            <h1 className="text-xl font-extrabold">Violet Cinema</h1>
          </div>
          <button className="lg:hidden" onClick={logout}><FontAwesomeIcon icon={faRightFromBracket} /></button>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
          {links.map(([label, to, icon]) => (
            <NavLink key={to} to={to} end={to === '/manager'} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold ${isActive ? 'bg-white text-cinema-900' : 'text-violet-100 hover:bg-white/10'}`}>
              <FontAwesomeIcon icon={icon} className="w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="mx-3 mb-4 hidden items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-violet-100 hover:bg-white/10 lg:flex">
          <FontAwesomeIcon icon={faRightFromBracket} /> Logout
        </button>
      </aside>
      <main className="w-full px-4 py-5 lg:ml-72 lg:px-8 lg:py-8">
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
