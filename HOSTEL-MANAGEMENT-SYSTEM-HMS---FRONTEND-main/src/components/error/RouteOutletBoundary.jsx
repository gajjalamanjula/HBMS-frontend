import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PageLoader from '../feedback/PageLoader';
import ErrorBoundary from './ErrorBoundary';
import RouteErrorFallback from './RouteErrorFallback';

export default function RouteOutletBoundary({ name = 'Route', loaderLabel = 'Loading page...', context }) {
  const location = useLocation();

  return (
    <ErrorBoundary
      name={name}
      fallback={RouteErrorFallback}
      resetKey={location.pathname}
    >
      <Suspense fallback={<PageLoader label={loaderLabel} />}>
        <Outlet context={context} />
      </Suspense>
    </ErrorBoundary>
  );
}
