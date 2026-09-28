import { useContext } from 'react';
import { SuperAdminShellContext } from './SuperAdminShellContextValue';

export function useSuperAdminShell() {
  const context = useContext(SuperAdminShellContext);

  if (!context) {
    throw new Error('useSuperAdminShell must be used within SuperAdminShellProvider');
  }

  return context;
}
