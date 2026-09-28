import { resolveBackendFileUrl } from '../url/safeUrl';

function resolveLocalPreviewUrl(value = '') {
  const raw = typeof value === 'string' ? value.trim() : '';
  return raw.startsWith('blob:') ? raw : '';
}

export function resolveBackendAssetUrl(value = '', { allowLocalPreview = false } = {}) {
  const raw = typeof value === 'string' ? value.trim() : '';

  if (!raw) return '';

  if (allowLocalPreview && raw.startsWith('blob:')) {
    return resolveLocalPreviewUrl(raw);
  }

  return resolveBackendFileUrl(raw, { allowBlob: false });
}

export function getStaticImage(image, fallback = '') {
  if (!image) return fallback;

  if (typeof image === 'string') {
    return resolveBackendAssetUrl(image) || fallback;
  }

  return image;
}

export function getUploadedImage({
  thumbnailUrl,
  imageUrl,
  photoUrl,
  fileUrl,
  url,
} = {}) {
  return resolveBackendAssetUrl(
    thumbnailUrl ||
      imageUrl ||
      photoUrl ||
      fileUrl ||
      url ||
      ''
  );
}

export function getListThumbnail(record = {}) {
  return (
    resolveBackendAssetUrl(record.thumbnailUrl) ||
    resolveBackendAssetUrl(record.thumbnail) ||
    resolveBackendAssetUrl(record.imageThumbnailUrl) ||
    resolveBackendAssetUrl(record.photoThumbnailUrl) ||
    getUploadedImage(record)
  );
}

export function getCardImage(record = {}, fallback = '') {
  const imageUrls = Array.isArray(record.imageUrls)
    ? record.imageUrls
    : Array.isArray(record.images)
      ? record.images
      : [];

  return (
    resolveBackendAssetUrl(record.image) ||
    resolveBackendAssetUrl(record.imageUrl) ||
    resolveBackendAssetUrl(imageUrls[0]) ||
    resolveBackendAssetUrl(record.photoUrl) ||
    resolveBackendAssetUrl(record.thumbnailUrl) ||
    fallback
  );
}

export function getDocumentImage(record = {}) {
  return resolveBackendAssetUrl(
    record.documentPreviewUrl ||
      record.aadhaarUrl ||
      record.fileUrl ||
      ''
  );
}