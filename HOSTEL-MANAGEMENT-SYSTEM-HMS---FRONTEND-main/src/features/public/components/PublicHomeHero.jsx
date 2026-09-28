import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Leaf,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wifi,
} from 'lucide-react';

export default function PublicHomeHero({
  search,
  onSearchChange,
  onSearchSubmit,
  branchesCount,
  resultCount,
  isError,
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = useMemo(
    () => [
      {
        badge: 'Verified',
        title: 'Live hostel preview',
        location: 'Hyderabad branches',
        subtitle: 'Search, compare, and book from available hostel listings.',
        meta: 'Live listings',
      },
      {
        badge: 'Rooms',
        title: 'Check rooms faster',
        location: 'Area-wise hostel search',
        subtitle: 'Find nearby hostels with rent, beds, and amenities.',
        meta: 'Room ready',
      },
      {
        badge: 'Booking',
        title: 'Book your stay easily',
        location: 'Safe hostel discovery',
        subtitle: 'Continue booking from available hostel listings.',
        meta: 'Instant flow',
      },
    ],
    []
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeSlide];

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearchSubmit?.();
  };

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FAFC_55%,#FFF7ED_100%)]">
      <div className="hbms-container grid items-center gap-8 py-10 sm:py-12 lg:min-h-[570px] lg:py-14 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.48fr)]">
        <div className="mx-auto max-w-[760px] text-center xl:mx-0 xl:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F97316]">
            <Leaf className="h-4 w-4" />
            {branchesCount ? `${branchesCount} live hostels` : 'Live hostel discovery'}
          </span>

          <h1 className="mt-7 font-display text-[clamp(40px,4.7vw,76px)] font-bold leading-[0.98] tracking-[-0.025em] text-[#0F172A]">
            Find Your Perfect
            <span className="block pt-2 italic text-[#F97316]">Home Away</span>
            <span className="block pt-2">From Home</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[680px] text-[15px] leading-7 text-[#64748B] sm:text-[16px] xl:mx-0">
            Browse listed hostels for students and working professionals. Compare rooms, rent,
            amenities, and availability.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row xl:justify-start">
            <Link
              to="/branches"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[13px] bg-[#F97316] px-6 text-sm font-bold text-white transition hover:bg-[#EA580C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
            >
              Browse Hostels
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex h-11 items-center justify-center rounded-[13px] border border-[#0F172A] px-6 text-sm font-bold text-[#0F172A] transition hover:bg-[#FFF7ED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
            >
              Talk to a Manager
            </Link>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-9 flex max-w-[640px] flex-col gap-3 rounded-[20px] border border-[#E2E8F0] bg-white p-3 shadow-[0_8px_34px_rgba(15,23,42,0.10)] sm:flex-row xl:mx-0"
          >
            <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-[15px] bg-[#F8FAFC] px-4">
              <Search className="h-5 w-5 shrink-0 text-[#F97316]" />
              <span className="sr-only">Search live hostels</span>
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by area, city, or hostel name"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                type="search"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[15px] bg-[#F97316] px-6 text-sm font-bold text-white transition hover:bg-[#EA580C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-4 text-sm text-[#64748B]">
            Compare rooms, rent, amenities, and availability.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold text-[#0F172A] xl:justify-start">
            <span className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5">
              Live hostels: {branchesCount}
            </span>
            <span className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5">
              Search results: {resultCount}
            </span>
            <span className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5">
              Listings: {isError ? 'Unavailable' : 'Ready'}
            </span>
          </div>
        </div>

        <div className="hidden justify-end xl:flex">
          <div className="relative w-full max-w-[350px] rounded-[26px] border border-[#E2E8F0] bg-white/85 p-4 shadow-[0_18px_54px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-3 py-1.5 text-[11px] font-black text-white shadow-[0_10px_22px_rgba(22,163,74,0.24)]">
              <span className="h-2 w-2 rounded-full bg-white" />
              Live
            </div>

            <div className="overflow-hidden rounded-[22px] border border-white bg-[#F8FAFC] shadow-inner">
              <div className="relative h-[170px] overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_46%,#FED7AA_100%)] p-5">
                <div className="flex justify-end">
                  <div className="mr-20 rounded-full border border-white bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#F97316]">
                    {currentSlide.badge}
                  </div>
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <div className="mb-3 flex gap-1.5">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.title}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Show slide ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          activeSlide === index ? 'w-7 bg-[#F97316]' : 'w-3 bg-white/85'
                        }`}
                      />
                    ))}
                  </div>

                  <h2 className="font-display text-[24px] font-bold leading-[1.08] text-[#0F172A]">
                    {currentSlide.title}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[#475569]">
                    <MapPin className="h-4 w-4 text-[#F97316]" />
                    {currentSlide.location}
                  </div>
                </div>
              </div>

              <div className="bg-white p-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-[#EFF6FF] px-3 py-2.5">
                    <BedDouble className="h-4 w-4 text-[#2563EB]" />
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                      Beds
                    </p>
                    <p className="text-sm font-black text-[#0F172A]">Ready</p>
                  </div>

                  <div className="rounded-2xl bg-[#FFF7ED] px-3 py-2.5">
                    <Wifi className="h-4 w-4 text-[#F97316]" />
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#F97316]">
                      WiFi
                    </p>
                    <p className="text-sm font-black text-[#0F172A]">Listed</p>
                  </div>

                  <div className="rounded-2xl bg-[#ECFDF5] px-3 py-2.5">
                    <Star className="h-4 w-4 text-[#16A34A]" />
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#16A34A]">
                      Rent
                    </p>
                    <p className="text-sm font-black text-[#0F172A]">Live</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#F97316]">
                        {currentSlide.meta}
                      </p>
                      <h3 className="mt-1 text-sm font-black text-[#0F172A]">
                        Safe stay near your area
                      </h3>
                      <p className="mt-1 text-xs text-[#64748B]">{currentSlide.subtitle}</p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#16A34A]" />
                <span className="text-sm font-bold text-[#0F172A]">Safe hostel discovery</span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#F97316]" />
                <span className="text-sm font-bold text-[#0F172A]">
                  {branchesCount || 0} hostels ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}