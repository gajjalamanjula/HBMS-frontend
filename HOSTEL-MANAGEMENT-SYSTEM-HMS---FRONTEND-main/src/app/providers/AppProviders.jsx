import { Toaster } from 'sonner';
import QueryProvider from './QueryProvider';
import { DashboardThemeProvider } from './DashboardThemeProvider';

export default function AppProviders({ children }) {
  return (
    <QueryProvider>
      <DashboardThemeProvider>{children}</DashboardThemeProvider>

      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        toastOptions={{
          duration: 3500,
          className: 'border border-slate-200 shadow-lg',
        }}
      />
    </QueryProvider>
  );
}
