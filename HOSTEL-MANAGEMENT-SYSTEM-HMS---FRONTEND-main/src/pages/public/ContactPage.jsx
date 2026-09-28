import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, Phone } from 'lucide-react';

import { usePublicBranches } from '../../features/public/hooks/usePublicBranches';
import { getBranchLocation } from '../../features/public/utils/publicMappers';

function getBranchContacts(branches) {
  return branches
    .filter((branch) => branch.managerPhone || branch.whatsappNumber || branch.managerName)
    .slice(0, 12);
}

export default function ContactPage() {
  const { branches, isLoading, isError, errorMessage, refetchBranches } = usePublicBranches();

  const branchContacts = useMemo(() => getBranchContacts(branches), [branches]);

  return (
    <section className="bg-[#F8FAFC]">
      <div className="bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_100%)] py-16 text-white lg:py-20">
        <div className="hbms-container">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FDBA74]">
            Branch Contacts
          </p>

          <h1 className="mt-6 font-display text-[clamp(38px,5vw,62px)] font-bold">
            Contact Details From Live Branches
          </h1>

          <p className="mt-6 max-w-xl text-[16px] leading-8 text-[#CBD5E1]">
            Contact cards appear only when a public branch record includes
            manager or phone details.
          </p>
        </div>
      </div>

      <div className="hbms-container py-12 lg:py-16">
        {isError ? (
          <div className="rounded-3xl border border-[#FECACA] bg-white p-6 shadow-lg">
            <p className="font-bold text-[#DC2626]">
              Unable to load branch contacts
            </p>

            <p className="mt-2 text-sm text-[#64748B]">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={refetchBranches}
              className="mt-4 h-11 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white transition hover:bg-[#EA580C]"
            >
              Retry
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-3xl bg-white shadow-lg"
              />
            ))}
          </div>
        ) : branchContacts.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {branchContacts.map((branch) => (
              <article
                key={branch.id}
                className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7ED]">
                  <Building2 className="h-7 w-7 text-[#F97316]" />
                </div>

                <h2 className="mt-5 font-display text-[24px] font-bold text-[#0F172A]">
                  {branch.name}
                </h2>

                <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-[#64748B]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#F97316]" />
                  {getBranchLocation(branch)}
                </p>

                {branch.managerName ? (
                  <div className="mt-4 rounded-xl bg-[#F8FAFC] p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748B]">
                      Manager
                    </p>

                    <p className="mt-1 font-semibold text-[#0F172A]">
                      {branch.managerName}
                    </p>
                  </div>
                ) : null}

                {branch.managerPhone || branch.whatsappNumber ? (
                  <a
                    href={`tel:${branch.managerPhone || branch.whatsappNumber}`}
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white transition hover:bg-[#EA580C]"
                  >
                    <Phone className="h-4 w-4" />
                    Call Branch
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-white p-10 text-center shadow-lg">
            <Building2 className="mx-auto h-12 w-12 text-[#F97316]" />

            <h2 className="mt-5 font-display text-[30px] font-bold text-[#0F172A]">
              No Branch Contacts Listed Yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#64748B]">
              Public contact cards will appear after branch records include
              manager name, phone, or WhatsApp number.
            </p>

            <Link
              to="/branches"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-6 text-sm font-bold text-white transition hover:bg-[#EA580C]"
            >
              Browse Hostels
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}