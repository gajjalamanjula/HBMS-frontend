import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import RouteOutletBoundary from '../components/error/RouteOutletBoundary';

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F3F1FF] px-4 py-5 font-body sm:py-6">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[455px] flex-col justify-center">
       

        <div className="w-full rounded-[22px] bg-[#334155] p-5 shadow-[0_25px_60px_rgba(30,41,59,0.35)] sm:p-6">
          <RouteOutletBoundary name="Authentication page" loaderLabel="Loading auth page..." />
        </div>
      </div>
    </div>
  );
}