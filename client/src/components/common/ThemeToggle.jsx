import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle({ compact = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent border-0 text-brand-peach/80 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-brand-peach hover:scale-110 active:scale-95 focus:outline-none"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <FontAwesomeIcon 
        icon={isDark ? faSun : faMoon} 
        className={`text-lg transition-all duration-500 ${isDark ? 'rotate-90 text-amber-400' : 'rotate-0 text-indigo-500'}`}
      />
    </button>
  );
}
