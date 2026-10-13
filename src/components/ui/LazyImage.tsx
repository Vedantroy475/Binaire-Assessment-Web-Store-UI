import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { lazyLoader } from '@/utils/LazyLoader'

interface LazyImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null
  alt: string
  /** Aspect ratio wrapper class, e.g. "aspect-[3/4]". */
  wrapperClassName?: string
  rootMargin?: string
}

/**
 * LazyImage - a lazily-loaded image component built on the from-scratch
 * {@link lazyLoader} (native IntersectionObserver + native loading="lazy").
 * It renders a skeleton placeholder and fades the image in when it loads.
 */
export function LazyImage({
  src,
  alt,
  className,
  wrapperClassName,
  rootMargin = '300px',
  ...props
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const img = imgRef.current
    if (!img || !src) return
    setLoaded(false)
    const cleanup = lazyLoader.createLazyImage(img, src, {
      rootMargin,
      onLoad: () => setLoaded(true),
    })
    return cleanup
  }, [src, rootMargin])

  return (
    <div className={cn('relative overflow-hidden bg-steam-card', wrapperClassName)}>
      <img
        ref={imgRef}
        alt={alt}
        data-loaded={loaded ? 'true' : 'false'}
        className={cn(
          'h-full w-full object-cover opacity-0 transition-opacity duration-500',
          'data-[loaded=true]:opacity-100',
          className,
        )}
        {...props}
      />
      {!loaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}
    </div>
  )
}
