import { useEffect, useState } from 'react';

export function useAuth() {
  const [token, setTokenState] = useState(() => localStorage.getItem('managerToken'));

  useEffect(() => {
    const onStorage = () => setTokenState(localStorage.getItem('managerToken'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setToken = (value) => {
    if (value) localStorage.setItem('managerToken', value);
    else localStorage.removeItem('managerToken');
    setTokenState(value);
  };

  return { token, setToken, isLoggedIn: Boolean(token) };
}

