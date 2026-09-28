import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  MapPin,
  Phone,
} from 'lucide-react';

import {
  OwnerHeaderActions,
  OwnerMetricCard,
  OwnerPageHeader,
  OwnerPanel,
  OwnerProgress,
} from '../../../features/owner/components/OwnerDashboardUi';
import {
  OwnerErrorState,
  OwnerLoadingGrid,
} from '../../../features/owner/components/OwnerPhase4States';
import { useOwnerBranches, useOwnerBranchStats } from '../../../features/owner/hooks/useOwnerBranches';
import {
  formatOwnerCurrency,
  formatOwnerNumber,
  getOwnerPercent,
} from '../../../features/owner/utils/ownerUiUtils';

export default function OwnerBranchStatsPage() {
  const { branchId } = useParams();

  const branchesQuery = useOwnerBranches();
  const statsQuery = useOwnerBranchStats(branchId);

  const branch = branchesQuery.branches.find((item) => String(item.id) === String(branchId));
  const stats = statsQuery.data || null;

  const totalBeds = stats?.totalBeds ?? branch?.totalBeds ?? 0;
  const occupied = stats?.occupied ?? branch?.occupiedBeds ?? 0;
  const available = stats?.available ?? Math.max(Number(totalBeds || 0) - Number(occupied || 0), 0);
  const occupancy = getOwnerPercent(occupied, totalBeds);

  const isLoading = branchesQuery.isLoading || statsQuery.isLoading;

  const refreshAll = () => {
    branchesQuery.refetchBranches?.();
    statsQuery.refetch?.();
  };

  if (!branchId) {
    return (
      <OwnerErrorState
        title="Invalid branch"
        message="Open branch details from your branch list."
      />
    );
  }

  return (
    <div className="space-y-4">
      <OwnerPageHeader
        title={branch?.name || 'Branch Performance'}
        eyebrow="Branch Performance"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/owner/branches"
              className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#eadfd6] bg-white px-3 text-[12px] font-bold text-[#2f6b2f] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fff8ed]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>

            <OwnerHeaderActions
              isFetching={(branchesQuery.isFetching || statsQuery.isFetching) && !isLoading}
              onRefresh={refreshAll}
            />
          </div>
        }
      />

      {branchesQuery.isError || statsQuery.isError ? (
        <OwnerErrorState
          title="Branch details could not be loaded"
          message={branchesQuery.errorMessage || statsQuery.error?.message}
          onRetry={refreshAll}
        />
      ) : null}

      {isLoading ? (
        <OwnerLoadingGrid count={4} />
      ) : !branch ? (
        <OwnerErrorState
          title="Branch not found"
          message="This branch is not available in your owner branch list."
          onRetry={refreshAll}
        />
      ) : (
        <>
          <section className="overflow-hidden rounded-[22px] border border-[#eadfd6] bg-white shadow-[0_18px_46px_rgba(58,40,20,0.08)]">
            <div className="grid gap-0 lg:grid-cols-[420px_1fr]">
              <div className="relative min-h-[260px] bg-[#eef5e7]">
                {branch.displayImageUrl ? (
                  <img
                    src={branch.displayImageUrl}
                    alt={branch.name}
                    className="h-full min-h-[260px] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full min-h-[260px] items-center justify-center text-[#6f8f62]">
                    <ImageIcon className="h-14 w-14" />
                  </div>
                )}

                <span className="absolute right-4 top-4 rounded-full bg-[#2f6b2f] px-3 py-1.5 text-[11px] font-black text-white shadow">
                  {occupancy}% occ
                </span>
              </div>

              <div className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7b8d6b]">
                      {display(branch.hostelType, 'Hostel')}
                    </p>
                    <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight text-[#2d2111]">
                      {branch.name}
                    </h1>

                    <p className="mt-2 flex items-start gap-2 text-[13px] leading-6 text-[#8a8178]">
                      <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#c15f43]" />
                      <span>{display(branch.fullAddress || branch.location)}</span>
                    </p>
                  </div>

                  {branch.monthlyRent ? (
                    <div className="rounded-[16px] border border-[#d8e7d1] bg-[#f7fbf3] px-4 py-3 text-right">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7b8d6b]">Monthly Rent</p>
                      <p className="mt-1 font-display text-[24px] font-semibold text-[#2f6b2f]">
                        {formatOwnerCurrency(branch.monthlyRent)}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Total Beds" value={totalBeds} />
                  <MiniStat label="Occupied" value={occupied} />
                  <MiniStat label="Available" value={available} />
                </div>

                <div className="mt-5">
                  <OwnerProgress value={occupancy} className="h-3" barClassName="bg-[#2f6b2f]" />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#9b9288]">
                    <span>Occupancy</span>
                    <span>{formatOwnerNumber(occupied)} / {formatOwnerNumber(totalBeds)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-3 md:grid-cols-3">
            <OwnerMetricCard title="Total Beds" value={formatOwnerNumber(totalBeds)} icon={BedDouble} tone="neutral" />
            <OwnerMetricCard title="Occupied" value={formatOwnerNumber(occupied)} subtitle={`${occupancy}% occupied`} icon={BedDouble} tone="amber" />
            <OwnerMetricCard title="Available" value={formatOwnerNumber(available)} icon={CheckCircle2} tone="sage" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <OwnerPanel title="Address Details" subtitle="Branch address and location information">
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Location" value={branch.location} />
                <Detail label="City" value={branch.city} />
                <Detail label="Area" value={branch.area} />
                <Detail label="Colony" value={branch.colony} />
                <Detail label="Road No" value={branch.roadNo} />
                <Detail label="Landmark" value={branch.landmark} />
              </div>

              <div className="mt-3">
                <Detail label="Full Address" value={branch.fullAddress} large />
              </div>

              {branch.mapLocationUrl ? (
                <a
                  href={branch.mapLocationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#eadfd6] bg-white px-4 text-[12px] font-bold text-[#2f6b2f] transition hover:bg-[#fff8ed]"
                >
                  Open Map
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </OwnerPanel>

            <OwnerPanel title="Contact Details" subtitle="Manager and branch contact">
              <div className="space-y-3">
                <ContactLine icon={Building2} label="Manager Name" value={branch.managerName} />
                <ContactLine icon={Phone} label="Manager Phone" value={branch.managerPhone} />
                <ContactLine icon={Phone} label="WhatsApp Number" value={branch.whatsappNumber} />
                <ContactLine icon={Building2} label="Total Floors" value={branch.totalFloors} />
              </div>
            </OwnerPanel>
          </div>

          <OwnerPanel title="Branch Information" subtitle="Description and amenities from branch details">
            <div className="grid gap-4 lg:grid-cols-2">
              <Detail label="Description" value={branch.description} large />
              <Detail label="Amenities" value={branch.amenities} large />
            </div>
          </OwnerPanel>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-[16px] border border-[#efe6dc] bg-[#fffaf6] p-4 text-center">
      <p className="font-display text-[24px] font-semibold text-[#2d2111]">{formatOwnerNumber(value)}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9b9288]">{label}</p>
    </div>
  );
}

function Detail({ label, value, large = false }) {
  return (
    <div className="rounded-[14px] border border-[#efe6dc] bg-[#fffaf6] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9b9288]">{label}</p>
      <p className={`mt-2 text-[13px] font-semibold leading-6 text-[#2d2111] ${large ? 'min-h-16' : ''}`}>
        {display(value)}
      </p>
    </div>
  );
}

function ContactLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-[#efe6dc] bg-[#fffaf6] p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#2f6b2f] shadow-sm">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9b9288]">{label}</p>
        <p className="mt-1 truncate text-[13px] font-semibold text-[#2d2111]">{display(value)}</p>
      </div>
    </div>
  );
}

function display(value, fallback = 'Not available') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}
