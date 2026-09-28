import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

import { usePublicBranches } from '../../features/public/hooks/usePublicBranches';
import { getAmenityList } from '../../features/public/utils/publicMappers';

export default function AboutPage() {
  const { branches, isLoading } = usePublicBranches();

  const stats = useMemo(() => {
    const areas = new Set();
    const types = new Set();
    const amenities = new Set();

    branches.forEach((branch) => {
      if (branch.area) areas.add(branch.area);
      if (branch.city) areas.add(branch.city);
      if (branch.hostelType) types.add(branch.hostelType);

      getAmenityList(branch).forEach((amenity) => amenities.add(amenity));
    });

    return [
      { label: 'Live Branches', value: branches.length || '-' },
      { label: 'Areas Listed', value: areas.size || '-' },
      { label: 'Hostel Types', value: types.size || '-' },
      { label: 'Amenities Listed', value: amenities.size || '-' },
    ];
  }, [branches]);

  return (
    <section className="bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_100%)] py-16 text-white lg:py-20">
        <div className="hbms-container grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FDBA74]">
              About the Platform
            </p>

            <h1 className="mt-6 font-display text-[clamp(42px,6vw,72px)] font-bold leading-[0.98] tracking-[-0.02em]">
              Live Hostel Discovery
              <span className="block italic text-[#FDBA74]">
                with Smart Dashboards
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-[17px] leading-8 text-[#CBD5E1]">
              Browse hostels, compare rooms, view amenities, check
              availability, submit booking requests, make secure payments,
              and access personalized dashboards based on your role.
            </p>

            <Link
              to="/branches"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-8 text-sm font-bold text-white transition hover:bg-[#EA580C]"
            >
              Browse Live Branches
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/10 p-7 text-center backdrop-blur"
              >
                <p className="font-display text-[42px] font-bold text-[#FDBA74]">
                  {isLoading ? '...' : stat.value}
                </p>

                <p className="mt-3 text-sm font-semibold text-[#CBD5E1]">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="hbms-container py-16 lg:py-20">
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F97316]">
            Platform Features
          </p>

          <h2 className="mt-4 font-display text-[clamp(34px,4vw,54px)] font-bold text-[#0F172A]">
            Everything You Need
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-8 text-[#64748B]">
            HostelStay makes finding and booking hostels simple with
            real-time availability, secure bookings, and dedicated dashboards.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Building2,
              title: 'Branch Discovery',
              text:
                'Browse verified hostels with live room details, pricing, and amenities.',
            },
            {
              icon: MapPin,
              title: 'Real-Time Availability',
              text:
                'View available rooms and beds instantly before placing your booking request.',
            },
            {
              icon: ShieldCheck,
              title: 'Secure Dashboard Access',
              text:
                'Owners, managers, tenants, and admins receive dedicated role-based dashboards.',
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-3xl border border-[#E2E8F0] bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7ED]">
                  <Icon className="h-7 w-7 text-[#F97316]" />
                </div>

                <h2 className="mt-6 font-display text-[26px] font-bold text-[#0F172A]">
                  {item.title}
                </h2>

                <p className="mt-4 text-[15px] leading-7 text-[#64748B]">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#F8FAFC] py-16">
        <div className="hbms-container">
          <div className="mx-auto max-w-4xl rounded-[32px] border border-[#E2E8F0] bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_50%,#FFF7ED_100%)] px-8 py-12 text-center shadow-xl">
            <h2 className="font-display text-[clamp(34px,4vw,54px)] font-bold text-[#0F172A]">
              Ready to Find Your Hostel?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-8 text-[#64748B]">
              Explore verified hostel branches, compare amenities and prices,
              and submit your booking request in just a few clicks.
            </p>

            <Link
              to="/branches"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-8 text-sm font-bold text-white transition hover:bg-[#EA580C]"
            >
              Explore Hostels
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}