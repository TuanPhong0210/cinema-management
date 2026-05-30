import { useEffect, useState } from 'react';

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));

  return { theme, isDark: theme === 'dark', toggleTheme, setTheme: setThemeState };
}

