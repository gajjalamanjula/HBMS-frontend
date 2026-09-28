import { forwardRef, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { BedDouble, Building2, ImageIcon, MapPin, PlusCircle, Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import {
  OwnerEmptyBlock,
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
import { useCreateOwnerBranch } from '../../../features/owner/hooks/useCreateOwnerBranch';
import { useOwnerBranches } from '../../../features/owner/hooks/useOwnerBranches';
import { ownerBranchSchema } from '../../../features/owner/schemas/ownerBranch.schema';
import { formatOwnerCurrency, formatOwnerNumber, getOwnerPercent } from '../../../features/owner/utils/ownerUiUtils';

const INPUT_CLASS =
  'h-11 w-full rounded-[12px] border border-[#eadfd6] bg-[#fffaf6] px-3 text-[13px] text-[#2d2111] outline-none transition placeholder:text-[#b3aa9f] focus:border-[#2f7439] focus:ring-2 focus:ring-[#dbeed7]';

export default function OwnerBranchesPage() {
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { branches, isLoading, isFetching, isError, errorMessage, refetchBranches } =
    useOwnerBranches();
  const createBranch = useCreateOwnerBranch();

  const filteredBranches = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return branches;
    return branches.filter((branch) =>
      [branch.name, branch.location, branch.city, branch.area, branch.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [branches, search]);

  const totals = useMemo(() => {
    const totalBeds = branches.reduce((sum, branch) => sum + Number(branch.totalBeds || 0), 0);
    const occupiedBeds = branches.reduce((sum, branch) => sum + Number(branch.occupiedBeds || 0), 0);
    return {
      branches: branches.length,
      shown: filteredBranches.length,
      totalBeds,
      occupiedBeds,
      occupancy: getOwnerPercent(occupiedBeds, totalBeds),
    };
  }, [branches, filteredBranches.length]);

  const handleCreateBranch = async (values) => {
    try {
      await createBranch.mutateAsync(values);
      setShowCreateForm(false);
      return true;
    } catch {
      // Mutation hook already shows a controlled toast.
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <OwnerPageHeader
        title="Branch Performance"
        eyebrow="All Locations"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <OwnerHeaderActions
              isFetching={isFetching && !isLoading}
              onRefresh={refetchBranches}
            />
            <button
              type="button"
              onClick={() => setShowCreateForm((value) => !value)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] bg-[#2f6b2f] px-3 text-[12px] font-bold text-white shadow-[0_12px_22px_rgba(47,107,47,0.24)] transition hover:-translate-y-0.5 hover:bg-[#265826]"
            >
              {showCreateForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
              {showCreateForm ? 'Close form' : 'Create Branch'}
            </button>
          </div>
        }
      />

      {isError ? (
        <OwnerErrorState
          title="Branches could not be loaded"
          message={errorMessage}
          onRetry={refetchBranches}
        />
      ) : null}

      {showCreateForm ? (
        <CreateBranchPanel
          isPending={createBranch.isPending}
          onSubmit={handleCreateBranch}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <OwnerMetricCard title="Total Branches" value={formatOwnerNumber(totals.branches)} subtitle="Owned by you" icon={Building2} loading={isLoading} tone="sage" />
        <OwnerMetricCard title="Total Beds" value={formatOwnerNumber(totals.totalBeds)} subtitle="All locations" icon={BedDouble} loading={isLoading} tone="neutral" />
        <OwnerMetricCard title="Avg Occupancy" value={`${totals.occupancy}%`} subtitle="Occupied / total" icon={Building2} loading={isLoading} tone="sage" />
        <OwnerMetricCard title="Shown" value={formatOwnerNumber(totals.shown)} subtitle="After search" icon={Search} loading={isLoading} tone="neutral" />
      </div>

      <OwnerPanel
        title="Branch Locations"
        subtitle="Search branches and review bed performance"
        action={
          <label className="flex h-9 w-full max-w-[280px] items-center gap-2 rounded-[10px] border border-[#eadfd6] bg-[#fffaf6] px-3">
            <Search className="h-3.5 w-3.5 text-[#9b9288]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search branch"
              className="w-full bg-transparent text-[12px] text-[#2d2111] outline-none placeholder:text-[#b3aa9f]"
            />
          </label>
        }
      >
        {isLoading ? (
          <OwnerLoadingGrid count={4} />
        ) : filteredBranches.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredBranches.map((branch) => {
              const percent = getOwnerPercent(branch.occupiedBeds, branch.totalBeds);
              const available = Math.max(Number(branch.totalBeds || 0) - Number(branch.occupiedBeds || 0), 0);
              return (
                <Link
                  key={branch.id}
                  to={`/owner/branches/${branch.id}`}
                  className="group overflow-hidden rounded-[18px] border border-[#eadfd6] bg-white shadow-[0_14px_34px_rgba(58,40,20,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(58,40,20,0.12)]"
                >
                  <div className="relative min-h-[138px] overflow-hidden bg-[#eaf4e0]">
                    {branch.displayImageUrl ? (
                      <img
                        src={branch.displayImageUrl}
                        alt={branch.name}
                        className="h-[138px] w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex min-h-[138px] items-center justify-center bg-[#f2f6ed] text-[#6f8f62]">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    <span className="absolute right-3 top-3 rounded-full bg-[#2f6b2f] px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                      {percent}% occ
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-[18px] font-semibold text-[#332513]">{branch.name || 'Not available'}</p>
                        <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-medium text-[#9b9288]"><MapPin className="h-3 w-3 text-[#c15f43]" />{branch.location || 'Not available'}</p>
                      </div>
                      {branch.monthlyRent ? (
                        <span className="shrink-0 text-[11px] font-bold text-[#2f6b2f]">
                          {formatOwnerCurrency(branch.monthlyRent)}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <BranchMiniStat label="Occupied" value={branch.occupiedBeds} />
                      <BranchMiniStat label="Available" value={available} />
                      <BranchMiniStat label="Total" value={branch.totalBeds} />
                    </div>

                    <div className="mt-4">
                      <OwnerProgress value={percent} barClassName="bg-[#2f7439]" />
                      <div className="mt-2 flex items-center justify-between text-[11px] text-[#9b9288]">
                        <span>Occupancy</span>
                        <span>{formatOwnerNumber(branch.occupiedBeds)} / {formatOwnerNumber(branch.totalBeds)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <OwnerEmptyBlock title="No branches found" message="Create a branch or clear the current search filter." />
        )}
      </OwnerPanel>
    </div>
  );
}

function CreateBranchPanel({ isPending, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ownerBranchSchema),
    defaultValues: {
      hostelName: '',
      location: '',
      monthlyRent: '',
      hostelType: 'MALE',
      city: '',
      area: '',
      colony: '',
      roadNo: '',
      landmark: '',
      fullAddress: '',
      description: '',
      managerName: '',
      managerPhone: '',
      whatsappNumber: '',
      totalFloors: '',
      amenities: '',
      mapLocationUrl: '',
      images: undefined,
    },
  });

  const submitForm = async (values) => {
    const success = await onSubmit(values);
    if (success) reset();
  };

  return (
    <OwnerPanel
      title="Create Branch"
      subtitle="Add a hostel branch with image, address, rent, and contact details."
    >
      <form onSubmit={handleSubmit(submitForm)} className="space-y-5" noValidate>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <OwnerBranchInput label="Hostel Name *" error={errors.hostelName?.message} {...register('hostelName')} />
          <OwnerBranchInput label="Location *" error={errors.location?.message} {...register('location')} />
          <OwnerBranchInput label="Monthly Rent*" type="number" error={errors.monthlyRent?.message} {...register('monthlyRent')} />

          <label className="space-y-2">
           <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7d7167]">Hostel Type <span className="text-red-600">*</span></span>
            <select {...register('hostelType')} className={INPUT_CLASS}>
              <option value="MALE">Men Hostel</option>
              <option value="FEMALE">Women Hostel</option>
              <option value="Co-Living">Co-Living </option>
            </select>
            {errors.hostelType?.message ? <ErrorText>{errors.hostelType.message}</ErrorText> : null}
          </label>

          <OwnerBranchInput label="City" {...register('city')} />
          <OwnerBranchInput label="Area" {...register('area')} />
          <OwnerBranchInput label="Colony" {...register('colony')} />
          <OwnerBranchInput label="Road No" {...register('roadNo')} />
          <OwnerBranchInput label="Landmark" {...register('landmark')} />
          <OwnerBranchInput label="Manager Name" {...register('managerName')} />
          <OwnerBranchInput label="Manager Phone" {...register('managerPhone')} />
          <OwnerBranchInput label="WhatsApp Number" {...register('whatsappNumber')} />
          <OwnerBranchInput label="Total Floors" type="number" error={errors.totalFloors?.message} {...register('totalFloors')} />
          <OwnerBranchInput label="Map Location URL" error={errors.mapLocationUrl?.message} {...register('mapLocationUrl')} />

      <label className="space-y-2 md:col-span-2 xl:col-span-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7d7167]">Branch Images <span className="text-red-600">*</span></span>
      <p className="text-[11px] text-[#9b9288]">Select multiple images. JPG, PNG, or WEBP up to 5 MB each</p>

      <input type="file"multiple accept="image/png,image/jpeg,image/jpg,image/webp" {...register('images')}
    className="block h-11 w-full rounded-[12px] border border-[#eadfd6] bg-[#fffaf6] px-3 py-2 text-[12px] text-[#2d2111] outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#2f7439] file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-white"
      />

     {errors.images?.message ? (
      <ErrorText>{errors.images.message}</ErrorText>
      ) : null}
      </label>
        </div>

        <TextareaField label="Full Address" rows={3} error={errors.fullAddress?.message} {...register('fullAddress')} />
        <TextareaField label="Description" rows={3} {...register('description')} />
        <TextareaField label="Amenities" rows={2} placeholder="WiFi, Laundry, CCTV, Food..." {...register('amenities')} />

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => reset()}
            disabled={isPending}
            className="h-10 rounded-[12px] border border-[#eadfd6] bg-white px-4 text-[13px] font-bold text-[#5c5148] transition hover:bg-[#fff7ef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="h-10 rounded-[12px] bg-[#2f7439] px-5 text-[13px] font-bold text-white shadow-[0_12px_26px_rgba(47,116,57,0.22)] transition hover:-translate-y-0.5 hover:bg-[#285f31] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Creating...' : 'Create Branch'}
          </button>
        </div>
      </form>
    </OwnerPanel>
  );
}

const OwnerBranchInput = forwardRef(function OwnerBranchInput(
  { label, error, type = 'text', ...props },
  ref
) {
  return (
    <label className="space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7d7167]">{label}</span>
      <input ref={ref} type={type} {...props} className={INPUT_CLASS} />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </label>
  );
});

const TextareaField = forwardRef(function TextareaField(
  { label, error, rows = 2, ...props },
  ref
) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7d7167]">{label}</span>
      <textarea
        ref={ref}
        rows={rows}
        {...props}
        className="w-full rounded-[12px] border border-[#eadfd6] bg-[#fffaf6] px-3 py-3 text-[13px] text-[#2d2111] outline-none transition placeholder:text-[#b3aa9f] focus:border-[#2f7439] focus:ring-2 focus:ring-[#dbeed7]"
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </label>
  );
});

function ErrorText({ children }) {
  return <p className="text-[11px] font-semibold text-red-600">{children}</p>;
}

function BranchMiniStat({ label, value }) {
  return (
    <div className="rounded-[12px] bg-[#fbf4ee] p-3 text-center">
      <p className="font-display text-[18px] font-semibold text-[#3c2c18]">{formatOwnerNumber(value)}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-[#9b9288]">{label}</p>
    </div>
  );
}
