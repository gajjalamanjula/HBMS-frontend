import { useContext, useEffect } from 'react';
import { DashboardThemeContext } from './DashboardThemeContext';

export function useDashboardTheme(scope = 'global') {
  const context = useContext(DashboardThemeContext);

  if (!context) {
    throw new Error('useDashboardTheme must be used inside DashboardThemeProvider');
  }

  const { getTheme, setTheme, toggleTheme, setActiveScope } = context;

  useEffect(() => {
    setActiveScope(scope);
  }, [scope, setActiveScope]);

  const theme = getTheme(scope);
  const darkMode = theme === 'dark';

  return {
    theme,
    darkMode,
    setDarkMode(nextValue) {
      const resolved =
        typeof nextValue === 'function' ? nextValue(darkMode) : Boolean(nextValue);
      setTheme(scope, resolved ? 'dark' : 'light');
    },
    toggleTheme() {
      toggleTheme(scope);
    },
  };
}
