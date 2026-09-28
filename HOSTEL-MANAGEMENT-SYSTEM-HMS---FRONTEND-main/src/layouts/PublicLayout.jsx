import PublicHeader from '../components/shared/PublicHeader';
import PublicFooter from '../components/shared/PublicFooter';
import RouteOutletBoundary from '../components/error/RouteOutletBoundary';

export default function PublicLayout() {
  return (
    <div className="public-site min-h-screen overflow-x-hidden bg-[#F9F5EE] text-[#2C1F0E]">
      <PublicHeader />
      <main>
        <RouteOutletBoundary name="Public page" loaderLabel="Loading public page..." />
      </main>
      <PublicFooter />
    </div>
  );
}
