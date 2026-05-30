import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle({ compact = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-brand-pearl/30 bg-brand-martinique/70 px-3 text-sm font-bold text-brand-peach transition hover:border-brand-studio hover:bg-brand-studio dark:border-brand-pearl/20 dark:bg-brand-martinique/70 dark:text-brand-peach dark:hover:bg-brand-studio"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
      {!compact && <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
