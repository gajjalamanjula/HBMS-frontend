import AppRouter from './app/router/AppRouter';
import ErrorBoundary from './components/error/ErrorBoundary';
import AppErrorFallback from './components/error/AppErrorFallback';

export default function App() {
  return (
    <ErrorBoundary name="HMS app root" fallback={AppErrorFallback}>
      <div className="public-site">
        <AppRouter />
      </div>
    </ErrorBoundary>
  );
}