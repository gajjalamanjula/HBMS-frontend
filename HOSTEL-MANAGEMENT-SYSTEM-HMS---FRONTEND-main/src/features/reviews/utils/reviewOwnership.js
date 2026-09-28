function getReviewOwnerId(review) {
  return (
    review.ownerUserId ??
    review.userId ??
    review.tenantId ??
    review.raw?.ownerUserId ??
    review.raw?.userId ??
    review.raw?.tenantId ??
    null
  );
}

export function isOwnReview(review, user) {
  if (review?.canEdit === true || review?.canDelete === true) return true;

  const ownerId = getReviewOwnerId(review);
  if (!ownerId || !user?.id) return false;

  return String(ownerId) === String(user.id);
}
