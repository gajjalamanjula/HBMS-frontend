import BranchCard from './BranchCard';
import { PublicEmptyState, PublicErrorState } from './PublicStates';

const SKELETON_KEYS = ['one', 'two', 'three', 'four', 'five', 'six'];

function BranchGridSkeleton({ count, gridClassName }) {
  return (
    <div className={gridClassName}>
      {SKELETON_KEYS.slice(0, count).map((key) => (
        <div
          key={`branch-card-skeleton-${key}`}
          className="min-h-[420px] animate-pulse overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-lg"
        >
          <div className="h-[205px] bg-[#F8FAFC]" />

          <div className="space-y-4 p-5">
            <div className="h-6 w-2/3 rounded-full bg-[#E2E8F0]" />
            <div className="h-4 w-full rounded-full bg-[#E2E8F0]" />
            <div className="h-4 w-5/6 rounded-full bg-[#E2E8F0]" />

            <div className="flex gap-2">
              <div className="h-7 w-20 rounded-full bg-[#FFF7ED]" />
              <div className="h-7 w-24 rounded-full bg-[#FFF7ED]" />
              <div className="h-7 w-16 rounded-full bg-[#FFF7ED]" />
            </div>

            <div className="h-12 rounded-xl bg-[#FED7AA]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BranchGrid({
  branches,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  emptyMessage = 'No branches are available yet.',
  compact = false,
  gridClassName = 'grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3',
}) {
  if (isLoading) {
    return (
      <BranchGridSkeleton
        count={compact ? 3 : 6}
        gridClassName={gridClassName}
      />
    );
  }

  if (isError) {
    return (
      <PublicErrorState
        title="Hostels could not be loaded"
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  if (!branches.length) {
    return <PublicEmptyState title="No hostels found" message={emptyMessage} />;
  }

  return (
    <div className={gridClassName}>
      {branches.map((branch) => (
        <BranchCard key={branch.id} branch={branch} compact={compact} />
      ))}
    </div>
  );
}