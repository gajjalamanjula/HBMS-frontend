import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, Star } from 'lucide-react';
import { getCardImage } from '../../../lib/images/imageDelivery';
import { getAmenityList, getBranchLocation } from '../utils/publicMappers';

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getHostelType(branch) {
  const rawType = String(branch.hostelType || branch.raw?.hostelType || '').trim();
  const normalized = rawType.toLowerCase();

  const isCoLiving =
    normalized.includes('co_living') ||
    normalized.includes('co-living') ||
    normalized.includes('co living') ||
    normalized.includes('coliving');

  const isWomen =
    normalized.includes('women') ||
    normalized.includes('female') ||
    normalized.includes('girl');

  const isMen =
    !isWomen &&
    !isCoLiving &&
    (normalized.includes('men') || normalized.includes('male') || normalized.includes('boy'));

  if (isCoLiving) return { label: 'Co-living', badge: 'bg-[#EEF2FF] text-[#4F46E5]' };
  if (isWomen) return { label: "Women's", badge: 'bg-[#FDF2F8] text-[#DB2777]' };
  if (isMen) return { label: "Men's", badge: 'bg-[#EFF6FF] text-[#2563EB]' };

  if (rawType) {
    return {
      label: rawType.replace(/_/g, ' '),
      badge: 'bg-[#FFF7ED] text-[#F97316]',
    };
  }

  return null;
}

function formatPrice(branch) {
  const rent = toNumber(
    branch.monthlyRent ??
      branch.monthlyRentStartsAt ??
      branch.raw?.monthlyRent ??
      branch.raw?.monthlyRentStartsAt
  );

  if (rent === null) return 'Contact';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rent);
}

function getRating(branch) {
  const rating = toNumber(
    branch.raw?.rating ??
      branch.raw?.avgRating ??
      branch.raw?.averageRating ??
      branch.rating ??
      branch.avgRating ??
      branch.averageRating
  );

  if (rating !== null && rating > 0) {
    return {
      value: Math.min(5, Math.max(0, rating)),
      source: 'Branch rating',
    };
  }

  return null;
}

function getAvailability(branch) {
  const raw = branch.raw || {};

  const totalBeds = toNumber(
    branch.totalBeds ??
      raw.totalBeds ??
      raw.bedCount ??
      raw.totalBedCount
  );

  const occupiedBeds = toNumber(
    branch.occupiedBeds ??
      raw.occupiedBeds ??
      raw.occupiedBedCount
  );

  const availableBeds = toNumber(
    branch.availableBeds ??
      raw.availableBeds ??
      raw.availableBedCount ??
      raw.vacantBeds
  );

  if (totalBeds === null || totalBeds <= 0) return null;

  const available =
    availableBeds !== null
      ? availableBeds
      : occupiedBeds !== null
        ? Math.max(totalBeds - occupiedBeds, 0)
        : null;

  if (available === null) return null;

  return {
    totalBeds,
    availableBeds: available,
    percent: Math.min(100, Math.max(0, ((totalBeds - available) / totalBeds) * 100)),
  };
}

export default function BranchCard({ branch, compact = false }) {
  const type = getHostelType(branch);
  const amenities = getAmenityList(branch);
  const shownAmenities = amenities.slice(0, compact ? 3 : 4);
  const remainingAmenities = amenities.length - shownAmenities.length;
  const location = getBranchLocation(branch);
  const rating = getRating(branch);
  const imageUrl = getCardImage(branch);
  const branchTitle = branch.name || branch.hostelName || 'Hostel branch';
  const [imageFailed, setImageFailed] = useState(false);
  const availability = getAvailability(branch);
  const isAlmostFull = availability ? availability.availableBeds <= 5 : false;

  const description =
    branch.description ||
    branch.raw?.shortDescription ||
    branch.raw?.summary ||
    branch.raw?.description ||
    'More hostel details will appear here when available.';

  const hasMonthlyRent =
    branch.monthlyRent !== null ||
    branch.monthlyRentStartsAt !== null ||
    branch.raw?.monthlyRent !== null ||
    branch.raw?.monthlyRentStartsAt !== null;

  return (
    <article className="group flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[#FDBA74] hover:shadow-2xl">
      <div className="relative h-[205px] overflow-hidden bg-[#F8FAFC] sm:h-[215px]">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={`${branchTitle} hostel building image`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_45%,#FED7AA_100%)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-white/70 text-[#F97316] shadow-inner">
              <Building2 className="h-8 w-8" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-[#0F172A]/20 to-transparent" />

        {type ? (
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] shadow-sm ${type.badge}`}
          >
            {type.label}
          </span>
        ) : null}

        <div className="absolute right-4 top-4">
          {rating ? (
            <div
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-[#F97316] shadow-sm"
              title={rating.source}
              aria-label={`${rating.value.toFixed(1)} out of 5 branch rating`}
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              {rating.value.toFixed(1)}
            </div>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h2 className="font-display text-[22px] font-bold leading-tight text-white">
            {branchTitle}
          </h2>

          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white/90">
            <MapPin className="h-3.5 w-3.5 text-[#FDBA74]" />
            <span className="line-clamp-1">{location}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          {rating ? (
            <div
              className="flex items-center gap-1 text-sm font-bold text-[#F97316]"
              title={rating.source}
              aria-label={`${rating.value.toFixed(1)} out of 5 branch rating`}
            >
              <span className="flex gap-0.5" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <Star
                    key={starValue}
                    className={`h-3.5 w-3.5 ${
                      starValue <= Math.round(rating.value)
                        ? 'fill-current'
                        : 'text-[#CBD5E1]'
                    }`}
                  />
                ))}
              </span>

              <span className="ml-1">{rating.value.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-[#64748B]">Rating not listed</span>
          )}

          <p className="shrink-0 font-display text-[24px] font-bold leading-none text-[#F97316]">
            {formatPrice(branch)}
            {hasMonthlyRent ? (
              <span className="font-body text-sm font-medium text-[#64748B]">/mo</span>
            ) : null}
          </p>
        </div>

        <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-[#64748B]">
          {description}
        </p>

        {shownAmenities.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {shownAmenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-[#FFF7ED] px-3 py-1 text-xs font-semibold text-[#F97316]"
              >
                {amenity}
              </span>
            ))}

            {remainingAmenities > 0 ? (
              <span className="rounded-full bg-[#FFF7ED] px-3 py-1 text-xs font-semibold text-[#F97316]">
                +{remainingAmenities}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-xs font-semibold text-[#94A3B8]">
            Amenities not listed
          </p>
        )}

        {availability ? (
          <div className="mt-5 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]">
              <div
                className={`h-full rounded-full ${
                  isAlmostFull ? 'bg-[#EF4444]' : 'bg-[#F97316]'
                }`}
                style={{ width: `${availability.percent}%` }}
              />
            </div>

            <span
              className={`text-xs font-bold ${
                isAlmostFull ? 'text-[#EF4444]' : 'text-[#64748B]'
              }`}
            >
              {availability.availableBeds} left
            </span>
          </div>
        ) : null}

        <Link
          to={`/branches/${branch.id}`}
          className="mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 text-sm font-bold text-white transition hover:bg-[#EA580C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
        >
          {isAlmostFull ? 'View rooms' : 'View details'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}