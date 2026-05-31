import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const links = [
  ['Dashboard', '/', 'dashboard'],
  ['Movies', '/movies', 'movie'],
  ['Rooms', '/rooms', 'theater_comedy'],
  ['Showtimes', '/showtimes', 'schedule'],
  ['Tickets', '/tickets', 'local_activity'],
  ['Employees', '/employees', 'badge'],
  ['Combos', '/combos', 'fastfood'],
  ['Discounts', '/discounts', 'sell'],
  ['Attendance', '/attendance', 'event_available']
];

export default function ManagerLayout() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem('managerRole') || 'Admin');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('managerRole', role);
    // Dispatch a custom event to notify active pages of the role change
    window.dispatchEvent(new Event('roleChange'));
  }, [role]);

  const logout = () => {
    localStorage.removeItem('managerToken');
    localStorage.removeItem('managerRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#15121b] text-[#e7e0ed] flex">
      {/* Side Navigation Bar */}
      <aside className="w-64 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col p-6 bg-[#15121b] bg-glass-bg backdrop-blur-xl border-r border-white/10 z-50">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>movie_filter</span>
          </div>
          <div>
            <h1 className="font-display-lg text-lg font-bold text-violet-300 leading-none">CineAdmin</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Noir Edition</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {links.map(([label, to, icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 font-bold border-l-4 border-violet-400 pl-3'
                    : 'text-slate-400 hover:text-[#e7e0ed] hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span className="font-label-md text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/15 mt-auto space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <header className="h-20 bg-glass-bg backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-10 shadow-sm sticky top-0 z-40">
          <div className="relative w-full max-w-md group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
            <input
              type="text"
              placeholder="Search movies, staff, revenue..."
              className="w-full bg-[#211e27]/70 border-none rounded-full py-2.5 pl-12 pr-4 text-[#e7e0ed] focus:ring-2 focus:ring-violet-500 placeholder-slate-500 text-sm transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 hover:text-violet-300 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 hover:text-violet-300 transition-colors">
                <span className="material-symbols-outlined">dark_mode</span>
              </button>
              <span className="h-6 w-px bg-white/10 mx-2"></span>
              <a
                href="#"
                className="flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-violet-300 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">help</span>
                <span>Support</span>
              </a>
            </div>

            <div className="h-8 w-px bg-white/10"></div>

            {/* Profile Dropdown & Role Swapper */}
            <div className="relative">
              <div
                className="flex items-center gap-3 cursor-pointer group select-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="text-right hidden sm:block">
                  <p className="font-label-md text-sm text-[#e7e0ed] font-bold group-hover:text-violet-300 transition-colors">
                    {role === 'Admin' ? 'Admin Noir' : 'Employee Staff'}
                  </p>
                  <p className="text-[10px] text-violet-400 uppercase tracking-widest font-bold mt-0.5">
                    {role} Role
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 p-[2px] group-hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all">
                  <div className="w-full h-full rounded-full bg-[#211e27] overflow-hidden">
                    <img
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnupFVYMc89aFZg6zcimW817WtaJq3ArrbWNWR7ochY5YVH8azEzxwDxbXQrXixdboIvVLjzLTz154DmtJRINTCBsyXuCC54pwjeWuZZQUWO8OEbi1851fzDbxFsOXnPPiSYB8X_dXzxoWeiBZj9cP9m0AFAC9q753uqy8WjVZ689FfybwpR7Jjh3F_78ta1EjYQTy2fHuaaTguhnZgI2o6J9JytPvgLrKigntpHpgayifHAHIRRVE-RmQ22u3LbpHakEMh8VM9w7z"
                    />
                  </div>
                </div>
              </div>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#1e1b26] border border-white/10 p-3 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-white/5 mb-2">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Switch Mock Role</p>
                    </div>
                    <button
                      onClick={() => { setRole('Admin'); setDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between ${
                        role === 'Admin' ? 'bg-violet-600/20 text-violet-300' : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span>Administrator</span>
                      {role === 'Admin' && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                    <button
                      onClick={() => { setRole('Employee'); setDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between ${
                        role === 'Employee' ? 'bg-violet-600/20 text-violet-300' : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span>Employee Staff</span>
                      {role === 'Employee' && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Viewport Main Canvas */}
        <main className="flex-grow p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
