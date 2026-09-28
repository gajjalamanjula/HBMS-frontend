import { useMemo, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

function resolveImageSource(source, fallback) {
  if (!source) return fallback || '';
  if (typeof source === 'string') return source;
  return source.fallback || source.webp || source.avif || fallback || '';
}

function resolveSources(source) {
  if (!source || typeof source === 'string') return [];

  return [
    source.avif ? { srcSet: source.avif, type: 'image/avif' } : null,
    source.webp ? { srcSet: source.webp, type: 'image/webp' } : null,
  ].filter(Boolean);
}

export default function AppImage({
  src,
  image,
  sources,
  alt,
  className,
  imageClassName,
  fallback = '',
  overlay = false,
  overlayClassName,
  rounded = 'rounded-[28px]',
  fit = 'cover',
  priority = false,
  loading,
  decoding = 'async',
  fetchPriority,
  sizes,
  aspectRatio,
  ...props
}) {
  const imageSource = image || src;
  const safeFallback = resolveImageSource(fallback, '');

  const pictureSources = useMemo(
    () => sources || resolveSources(imageSource),
    [sources, imageSource]
  );

  const initialSrc = resolveImageSource(imageSource, safeFallback);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!initialSrc);

  const imageLoading = loading || (priority ? 'eager' : 'lazy');
  const imageFetchPriority = fetchPriority || (priority ? 'high' : 'auto');
  const objectFitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div
      className={cn('relative overflow-hidden bg-slate-100', rounded, className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!loaded && !failed ? (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,_#e2e8f0_8%,_#f8fafc_18%,_#e2e8f0_33%)] bg-[length:200%_100%]" />
      ) : null}

      {failed ? (
        <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-slate-100 text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <ImageOff className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Image unavailable</p>
          </div>
        </div>
      ) : (
        <picture>
          {pictureSources.map((source) => (
            <source key={source.type} srcSet={source.srcSet} type={source.type} sizes={sizes} />
          ))}
          <img
            src={currentSrc}
            alt={alt || ''}
            loading={imageLoading}
            decoding={priority ? 'sync' : decoding}
            fetchPriority={imageFetchPriority}
            sizes={sizes}
            onLoad={() => setLoaded(true)}
            onError={() => {
              if (safeFallback && currentSrc !== safeFallback) {
                setCurrentSrc(safeFallback);
                return;
              }
              setFailed(true);
            }}
            className={cn(
              'h-full w-full transition duration-700',
              objectFitClass,
              loaded ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0',
              imageClassName
            )}
            {...props}
          />
        </picture>
      )}

      {overlay ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent',
            overlayClassName
          )}
        />
      ) : null}
    </div>
  );
}
