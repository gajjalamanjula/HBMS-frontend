import { Link } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

export default function BackendApiUnavailablePage({
  title = 'This page is not available yet',
  description = 'This page is hidden until the required live data is available for customers.',
}) {
  return (
    <section className="bg-[#F9F5EE] py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/branches"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5C3D1E] transition hover:text-[#3B5E2B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to hostels
        </Link>

        <div className="mt-8 rounded-3xl border border-[#E8E2D6] bg-white p-8 shadow-[0_12px_30px_rgba(44,31,14,0.08)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3E1] text-[#3B5E2B]">
            <Construction className="h-7 w-7" />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#3B5E2B]">
            Coming Soon
          </p>

          <h1 className="mt-3 font-display text-[34px] font-bold tracking-tight text-[#2C1F0E] sm:text-[42px]">
            {title}
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#7A7268] sm:text-base">
            {description}
          </p>

          <Link
            to="/branches"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-[#3B5E2B] px-5 text-sm font-bold text-white transition hover:bg-[#2A4420]"
          >
            Browse available hostels
          </Link>
        </div>
      </div>
    </section>
  );
}
