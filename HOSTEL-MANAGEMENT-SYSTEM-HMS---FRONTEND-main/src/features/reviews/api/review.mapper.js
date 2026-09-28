import { cleanText } from '../../../lib/api/normalizeResponse';

function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toText(value) {
  return value === undefined || value === null ? '' : String(value);
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value === 1;
  return fallback;
}

function readNestedId(value) {
  if (!value || typeof value !== 'object') return null;
  return pickFirst(value.id, value.userId, value.tenantId) ?? null;
}

function readNestedEmail(value) {
  if (!value || typeof value !== 'object') return '';
  return toText(pickFirst(value.email, value.userEmail, value.tenantEmail));
}

function normalizeCategoryRating(value) {
  if (value === undefined || value === null || value === '') return 0;
  return Math.min(5, Math.max(1, toNumber(value, 0)));
}

function readCategoryRatings(raw = {}) {
  return {
    foodRating: normalizeCategoryRating(raw.foodRating),
    cleaningRating: normalizeCategoryRating(raw.cleaningRating),
    securityRating: normalizeCategoryRating(raw.securityRating),
    wifiRating: normalizeCategoryRating(raw.wifiRating),
    powerRating: normalizeCategoryRating(raw.powerRating),
  };
}

function averageCategoryRatings(categoryRatings) {
  const ratings = Object.values(categoryRatings).filter((rating) => rating >= 1 && rating <= 5);
  if (!ratings.length) return 0;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

export function mapReview(raw = {}) {
  const tenant = raw.tenant && typeof raw.tenant === 'object' ? raw.tenant : null;
  const user = raw.user && typeof raw.user === 'object' ? raw.user : null;
  const reviewer = raw.reviewer && typeof raw.reviewer === 'object' ? raw.reviewer : null;

  const ratings = readCategoryRatings(raw);

  const userId =
    pickFirst(
      raw.userId,
      raw.tenantId,
      raw.createdById,
      raw.reviewerId,
      readNestedId(tenant),
      readNestedId(user),
      readNestedId(reviewer)
    ) ?? null;

  const rating =
    toNumber(
      pickFirst(raw.overallRating, raw.rating, raw.stars, raw.averageRating, raw.avgRating),
      0
    ) || averageCategoryRatings(ratings);

  return {
    id: pickFirst(raw.id, raw.reviewId) ?? '',
    branchId: pickFirst(raw.branchId, raw.hostelBranchId, raw.branch?.id) ?? '',
    userId,
    tenantId: userId,
    ownerUserId: pickFirst(raw.ownerUserId, raw.userId, raw.tenantId, raw.createdById, raw.reviewerId) ?? userId,
    canEdit: toBoolean(raw.canEdit ?? raw.editable, false),
    canDelete: toBoolean(raw.canDelete ?? raw.deletable, false),
    userName: toText(
      pickFirst(
        raw.userName,
        raw.tenantName,
        raw.reviewerName,
        raw.createdByName,
        tenant?.name,
        user?.name,
        reviewer?.name
      )
    ),
    userEmail: toText(
      pickFirst(
        raw.userEmail,
        raw.tenantEmail,
        raw.reviewerEmail,
        raw.createdByEmail,
        readNestedEmail(tenant),
        readNestedEmail(user),
        readNestedEmail(reviewer)
      )
    ),
    ratings,
    rating,
    overallRating: rating,
    comment: toText(pickFirst(raw.comment, raw.review, raw.description, raw.message)),
    createdAt: toText(pickFirst(raw.createdAt, raw.createdDate, raw.createdOn, raw.timestamp)),
    updatedAt: toText(pickFirst(raw.updatedAt, raw.updatedDate, raw.updatedOn)),
    raw,
  };
}

export function mapReviewList(rows = []) {
  return Array.isArray(rows)
    ? rows.map(mapReview).filter((review) => review.id || review.comment)
    : [];
}

export function buildReviewPayload(payload = {}) {
  return {
    foodRating: toNumber(payload.foodRating, 0),
    cleaningRating: toNumber(payload.cleaningRating, 0),
    securityRating: toNumber(payload.securityRating, 0),
    wifiRating: toNumber(payload.wifiRating, 0),
    powerRating: toNumber(payload.powerRating, 0),
    comment: cleanText(payload.comment),
  };
}
