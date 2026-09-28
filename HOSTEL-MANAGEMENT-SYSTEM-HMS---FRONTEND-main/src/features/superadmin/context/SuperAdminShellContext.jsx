import { useEffect, useMemo, useState } from 'react';
import { SuperAdminShellContext } from './SuperAdminShellContextValue';

export function SuperAdminShellProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }

      if (window.innerWidth < 1024) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebarCollapsed: () => setSidebarCollapsed((prev) => !prev),
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
      darkMode,
      setDarkMode,
      toggleDarkMode: () => setDarkMode((prev) => !prev),
    }),
    [sidebarCollapsed, sidebarOpen, darkMode]
  );

  return (
    <SuperAdminShellContext.Provider value={value}>
      {children}
    </SuperAdminShellContext.Provider>
  );
}
