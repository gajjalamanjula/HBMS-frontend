import { Search, X } from 'lucide-react';

export default function BranchSearch({ value, onChange, resultCount }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-lg">
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 transition focus-within:border-[#F97316]">
          <Search className="h-5 w-5 shrink-0 text-[#F97316]" />

          <input
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search by area, city, hostel name..."
            className="w-full bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
          />
        </label>

        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-0">
          <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-sm font-semibold text-[#2563EB]">
            {resultCount} result{resultCount === 1 ? '' : 's'}
          </span>

          {value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#F97316] bg-white px-4 text-sm font-bold text-[#F97316] transition hover:bg-[#FFF7ED]"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}