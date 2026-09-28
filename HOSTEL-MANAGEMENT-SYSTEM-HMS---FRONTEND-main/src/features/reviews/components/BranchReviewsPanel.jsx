import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Loader2, RefreshCw, Star, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import useAuthStore from '../../../store/authStore';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { useDialogA11y } from '../../../components/ui/useDialogA11y';
import { PublicEmptyState, PublicErrorState } from '../../public/components/PublicStates';
import { formatDate } from '../../../utils/date';
import { ROLES, normalizeRole } from '../../../utils/constants/roles';
import { useBranchReviews } from '../hooks/useBranchReviews';
import { isOwnReview } from '../utils/reviewOwnership';
import {
  useAddReview,
  useDeleteReview,
  useUpdateReview,
} from '../hooks/useReviewMutations';

const RATING_OPTIONS = [
  { value: 5, label: '5 Stars' },
  { value: 4, label: '4 Stars' },
  { value: 3, label: '3 Stars' },
  { value: 2, label: '2 Stars' },
  { value: 1, label: '1 Star' },
];

const RATING_FIELDS = [
  { name: 'foodRating', label: 'Food' },
  { name: 'cleaningRating', label: 'Cleaning' },
  { name: 'securityRating', label: 'Security' },
  { name: 'wifiRating', label: 'Wi-Fi' },
  { name: 'powerRating', label: 'Power' },
];

const DEFAULT_RATINGS = {
  foodRating: 5,
  cleaningRating: 5,
  securityRating: 5,
  wifiRating: 5,
  powerRating: 5,
};

function ReviewStars({ rating }) {
  const safeRating = Math.min(5, Math.max(0, Number(rating || 0)));

  return (
    <div className="flex items-center gap-1 text-amber-500" aria-label={`${safeRating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const filled = starValue <= safeRating;

        return (
          <Star
            key={starValue}
            className={`h-4 w-4 ${filled ? 'fill-current' : 'text-slate-300'}`}
          />
        );
      })}
    </div>
  );
}

function validateRatings(values) {
  return RATING_FIELDS.every(({ name }) => {
    const rating = Number(values[name]);
    return Number.isFinite(rating) && rating >= 1 && rating <= 5;
  });
}

function buildRatingsPayload(values) {
  return Object.fromEntries(
    RATING_FIELDS.map(({ name }) => [name, Number(values[name])])
  );
}

function getEditableRatings(review) {
  const reviewRatings = review.ratings || {};

  return Object.fromEntries(
    RATING_FIELDS.map(({ name }) => {
      const rating = Number(reviewRatings[name]);
      return [name, rating >= 1 && rating <= 5 ? rating : DEFAULT_RATINGS[name]];
    })
  );
}

export default function BranchReviewsPanel({ branchId }) {
  const [ratings, setRatings] = useState(DEFAULT_RATINGS);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const deleteDialogRef = useDialogA11y({
    open: Boolean(deleteConfirm),
    onClose: () => setDeleteConfirm(null),
  });

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const normalizedRole = normalizeRole(role || user?.role);
  const isTenant = normalizedRole === ROLES.TENANT;

  const { reviews, isLoading, isFetching, isError, errorMessage, refetchReviews } =
    useBranchReviews(branchId, { softFailPublicErrors: !isTenant });
  const addReview = useAddReview(branchId);
  const updateReview = useUpdateReview(branchId);
  const deleteReview = useDeleteReview(branchId);
  const formPending = addReview.isPending || updateReview.isPending;

  const resetForm = () => {
    setEditingReviewId('');
    setRatings(DEFAULT_RATINGS);
    setComment('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedComment = comment.trim();

    if (!validateRatings(ratings)) {
      toast.error('Each rating must be between 1 and 5');
      return;
    }

    if (!trimmedComment) {
      toast.error('Review comment is required');
      return;
    }

    if (!branchId || !trimmedComment) return;

    const payload = {
      ...buildRatingsPayload(ratings),
      comment: trimmedComment,
    };

    if (editingReviewId) {
      updateReview.mutate(
        {
          id: editingReviewId,
          data: payload,
        },
        {
          onSuccess: resetForm,
        }
      );
      return;
    }

    addReview.mutate(payload, {
      onSuccess: resetForm,
    });
  };

  const startEdit = (review) => {
    setEditingReviewId(review.id);
    setRatings(getEditableRatings(review));
    setComment(review.comment || '');
  };

  const cancelEdit = () => {
    resetForm();
  };

  const handleDelete = (review) => {
    setDeleteConfirm(review);
  };

  const confirmDelete = () => {
    if (!deleteConfirm?.id) return;

    deleteReview.mutate(deleteConfirm.id, {
      onSuccess: () => {
        if (editingReviewId === deleteConfirm.id) resetForm();
        setDeleteConfirm(null);
      },
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Reviews</h2>
          <p className="mt-1 text-sm text-slate-600">
            Share your stay experience and read feedback from other tenants.
          </p>
        </div>

        {isFetching ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Refreshing
          </span>
        ) : null}
      </div>

      {isTenant ? (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {RATING_FIELDS.map((field) => (
              <Select
                key={field.name}
                name={field.name}
                label={field.label}
                value={ratings[field.name]}
                onChange={(event) =>
                  setRatings((current) => ({
                    ...current,
                    [field.name]: Number(event.target.value),
                  }))
                }
                options={RATING_OPTIONS}
                placeholder=""
              />
            ))}
          </div>

          <Textarea
            name="comment"
            label="Review"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            rows={4}
            required
          />

          <Button
            type="submit"
            isLoading={formPending}
            loadingText={editingReviewId ? 'Updating...' : 'Submitting...'}
            disabled={!branchId || !comment.trim()}
          >
            {editingReviewId ? 'Update Review' : 'Add Review'}
          </Button>
          {editingReviewId ? (
            <Button
              type="button"
              variant="secondary"
              leftIcon={<X className="h-4 w-4" />}
              onClick={cancelEdit}
              disabled={formPending}
            >
              Cancel
            </Button>
          ) : null}
        </form>
      ) : !isAuthenticated ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
          <p>Login to add review.</p>
          <Link
            to="/login"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Login to add review
          </Link>
        </div>
      ) : null}

      {isAuthenticated && !isTenant ? (
        <p className="mt-4 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
          Reviews are read-only for your account.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="grid gap-3">
            {['review-a', 'review-b'].map((key) => (
              <div key={key} className="h-28 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : null}

        {isError && isTenant ? (
          <PublicErrorState
            title="Unable to load reviews"
            message={errorMessage}
            onRetry={refetchReviews}
          />
        ) : null}

        {isError && !isTenant ? (
          <PublicEmptyState
            title="Reviews are not available right now."
            message="You can still view branch details and continue booking."
          />
        ) : null}

        {!isLoading && !isError && reviews.length === 0 ? (
          <PublicEmptyState title="No reviews yet." message="Be the first to share your stay experience." />
        ) : null}

        {!isLoading && !isError
          ? reviews.map((review) => {
              const canManage = isTenant && review.id && isOwnReview(review, user);
              const isEditing = editingReviewId === review.id;
              const isDeleting = deleteReview.isPending && deleteReview.variables === review.id;

              return (
                <article
                  key={review.id || `${review.userName}-${review.createdAt}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <ReviewStars rating={review.rating} />
                      {review.userName ? (
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          By {review.userName}
                        </p>
                      ) : null}
                    </div>

                    {canManage ? (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant={isEditing ? 'primary' : 'secondary'}
                          title="Edit review"
                          aria-label="Edit review"
                          leftIcon={<Edit2 className="h-4 w-4" />}
                          onClick={() => startEdit(review)}
                          disabled={deleteReview.isPending || updateReview.isPending}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="danger"
                          title="Delete review"
                          aria-label="Delete review"
                          leftIcon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDelete(review)}
                          isLoading={isDeleting}
                          disabled={updateReview.isPending}
                        />
                      </div>
                    ) : null}
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
                    {review.comment}
                  </p>

                  {review.createdAt ? (
                    <p className="mt-3 text-xs text-slate-500">
                      Posted {formatDate(review.createdAt)}
                    </p>
                  ) : null}
                </article>
              );
            })
          : null}

        {!isLoading && !isError && reviews.length && refetchReviews ? (
          <button
            type="button"
            onClick={refetchReviews}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh reviews
          </button>
        ) : null}
      </div>

      {deleteConfirm ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            ref={deleteDialogRef}
            tabIndex={-1}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
            aria-describedby="delete-review-description"
            className="responsive-dialog-panel w-full max-w-md rounded-xl bg-white p-4 shadow-2xl outline-none sm:p-5"
          >
            <h3 id="delete-review-title" className="text-base font-semibold text-slate-950">Delete review?</h3>
            <p id="delete-review-description" className="mt-2 text-sm leading-6 text-slate-600">
              This action cannot be undone. Your review will be permanently removed.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              {deleteConfirm.comment || 'Selected review'}
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteReview.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={confirmDelete}
                isLoading={deleteReview.isPending}
                loadingText="Deleting..."
              >
                Delete Review
              </Button>
            </div>
          </div>
        </div>
      ) : null}

    </section>
  );
}
