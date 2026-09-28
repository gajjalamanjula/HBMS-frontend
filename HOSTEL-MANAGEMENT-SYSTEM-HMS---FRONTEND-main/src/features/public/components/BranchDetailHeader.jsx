import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

import { resolveBackendAssetUrl } from '../../../lib/images/imageDelivery';
import { getAmenityList, getBranchLocation } from '../utils/publicMappers';

function getBranchImages(branch = {}) {
  const raw = branch.raw || {};
  const candidates = [
    branch.imageUrl,
    raw.imageUrl,
    raw.image,
    raw.photoUrl,
    raw.thumbnailUrl,
    raw.coverImageUrl,
    raw.mainImageUrl,
  ];

  const listSources = [raw.images, raw.imageUrls, raw.photos, raw.gallery, raw.branchImages];

  listSources.forEach((source) => {
    if (Array.isArray(source)) {
      source.forEach((item) => {
        if (typeof item === 'string') candidates.push(item);
        else if (item && typeof item === 'object') {
          candidates.push(item.imageUrl || item.url || item.fileUrl || item.path || item.photoUrl);
        }
      });
    }
  });

  return Array.from(new Set(candidates.map(resolveBackendAssetUrl).filter(Boolean)));
}

export default function BranchDetailHeader({ branch }) {
  const amenities = getAmenityList(branch);
  const images = useMemo(() => getBranchImages(branch), [branch]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const visibleImages = images.filter((image) => !failedImages.has(image));
  const activeImage = visibleImages[activeIndex] || visibleImages[0] || '';
  const hasCarousel = visibleImages.length > 1;
  const monthlyRent = branch.monthlyRentLabel || formatRent(branch.monthlyRent || branch.raw?.monthlyRent);

  const moveImage = (direction) => {
    if (!hasCarousel) return;
    setActiveIndex((current) => {
      const next = current + direction;
      if (next < 0) return visibleImages.length - 1;
      if (next >= visibleImages.length) return 0;
      return next;
    });
  };

  const markImageFailed = (image) => {
    setFailedImages((current) => new Set([...current, image]));
    setActiveIndex(0);
  };

  return (
    <section className="border-b border-[#E8E2D6] bg-[#FDFAF5]">
      <div className="hbms-container py-8 lg:py-10">
        <Link
          to="/branches"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#E8E2D6] bg-white px-3 text-sm font-bold text-[#5C3D1E] transition hover:border-[#8AAF79] hover:bg-[#EAF3E1] hover:text-[#3B5E2B]"
        >
          <ArrowLeft className="h-4 w-4" />
          All hostels
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <span className="inline-flex rounded-full border border-[#C8DCBC] bg-[#EAF3E1] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#3B5E2B]">
              {branch.hostelType || 'Branch'}
            </span>
            <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-[#2C1F0E] sm:text-5xl">
              {branch.name}
            </h1>
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#7A7268]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B5532A]" />
              {getBranchLocation(branch)}
            </p>
            {branch.description ? (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#7A7268]">
                {branch.description}
              </p>
            ) : null}
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-[#E8E2D6] bg-[#F0EAD9] shadow-[0_20px_44px_rgba(44,31,14,0.12)]">
            {activeImage ? (
              <img
                src={activeImage}
                alt={branch.name}
                className="h-[300px] w-full object-cover sm:h-[360px]"
                loading="eager"
                onError={() => markImageFailed(activeImage)}
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center sm:h-[360px]">
                <Building2 className="h-16 w-16 text-[#3B5E2B]" />
              </div>
            )}

            {hasCarousel ? (
              <>
                <button
                  type="button"
                  onClick={() => moveImage(-1)}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2C1F0E] shadow transition hover:bg-white"
                  aria-label="Previous branch image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(1)}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2C1F0E] shadow transition hover:bg-white"
                  aria-label="Next branch image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1 backdrop-blur">
                  {visibleImages.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-2 w-2 rounded-full transition ${index === activeIndex ? 'bg-white' : 'bg-white/45'}`}
                      aria-label={`Show branch image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile label="Monthly rent" value={monthlyRent} />
          <InfoTile label="City" value={branch.city || '-'} />
          <InfoTile label="Area" value={branch.area || '-'} />
          <InfoTile label="Floors" value={branch.totalFloors ?? '-'} />
        </div>

        {amenities.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full border border-[#E8E2D6] bg-white px-3 py-1 text-xs font-bold text-[#5C3D1E]"
              >
                {amenity}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-[16px] border border-[#E8E2D6] bg-white p-4 shadow-[0_10px_24px_rgba(44,31,14,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(44,31,14,0.1)]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#A8A099]">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-[#2C1F0E]">{value || '-'}</p>
    </div>
  );
}

function formatRent(value) {
  const rent = Number(value);
  if (!Number.isFinite(rent) || rent <= 0) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rent);
}
