import ErrorBoundary from './ErrorBoundary';
import SectionErrorFallback from './SectionErrorFallback';

export default function SectionErrorBoundary({ children, name, resetKey }) {
  return (
    <ErrorBoundary name={name} fallback={SectionErrorFallback} resetKey={resetKey}>
      {children}
    </ErrorBoundary>
  );
}
