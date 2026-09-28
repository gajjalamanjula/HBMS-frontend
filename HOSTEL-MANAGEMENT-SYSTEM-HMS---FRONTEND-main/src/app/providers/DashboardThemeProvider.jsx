import { useEffect, useMemo, useState } from 'react';
import { DashboardThemeContext } from './DashboardThemeContext';

const STORAGE_KEY = 'hms_dashboard_themes';

function readStoredThemes() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function DashboardThemeProvider({ children }) {
  const [themesByScope, setThemesByScope] = useState(readStoredThemes);
  const [activeScope, setActiveScope] = useState('global');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themesByScope));
  }, [themesByScope]);

  const activeTheme = themesByScope[activeScope] || 'light';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', activeTheme === 'dark');
    document.documentElement.setAttribute('data-dashboard-theme', activeTheme);
  }, [activeTheme]);

  const value = useMemo(
    () => ({
      themesByScope,
      activeScope,
      setActiveScope,
      getTheme(scope) {
        return themesByScope[scope] || 'light';
      },
      setTheme(scope, nextTheme) {
        setThemesByScope((prev) => ({
          ...prev,
          [scope]: nextTheme,
        }));
      },
      toggleTheme(scope) {
        setThemesByScope((prev) => {
          const current = prev[scope] || 'light';
          return {
            ...prev,
            [scope]: current === 'dark' ? 'light' : 'dark',
          };
        });
      },
    }),
    [activeScope, themesByScope]
  );

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  );
}
