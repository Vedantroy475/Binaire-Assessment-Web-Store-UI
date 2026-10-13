/**
 * LazyLoader - a from-scratch lazy-loading utility.
 *
 * Two responsibilities, both implemented WITHOUT React.lazy or any library:
 *
 *  1. `observeElement`: infinite-scroll trigger using the native
 *     `IntersectionObserver` browser API. When a sentinel element scrolls into
 *     view it fires a callback (used to load the next page of content).
 *
 *  2. `createLazyImage`: lazy <img> loading. Images use a native
 *     `loading="lazy"` attribute AND an IntersectionObserver so the real `src`
 *     is only attached when the image is near the viewport. This also lets us
 *     fade the image in once decoded (nice transition, respects reduced motion
 *     at the CSS layer).
 */

export interface LazyImageOptions {
  rootMargin?: string
  onLoad?: () => void
}

export class LazyLoader {
  private observer: IntersectionObserver | null = null

  private ensureObserver(onIntersect: () => void, rootMargin: string): IntersectionObserver {
    if (this.observer) {
      // Replace callback behaviour by recreating when rootMargin changes is
      // overkill; a single observer with the widest margin is sufficient.
      return this.observer
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onIntersect()
            break
          }
        }
      },
      { rootMargin, threshold: 0 },
    )
    return this.observer
  }

  /**
   * Observe a sentinel element and fire `onIntersect` when it becomes visible.
   * Returns a cleanup function.
   */
  observeElement(
    element: Element | null,
    onIntersect: () => void,
    rootMargin = '200px',
  ): () => void {
    if (!element || typeof IntersectionObserver === 'undefined') {
      // Graceful fallback: fire immediately so content still loads.
      onIntersect()
      return () => {}
    }
    const observer = this.ensureObserver(onIntersect, rootMargin)
    observer.observe(element)
    return () => observer.unobserve(element)
  }

  /**
   * Attach lazy-loading behaviour to an <img>. Returns a cleanup function.
   * The image keeps a data-src until it is near the viewport.
   */
  createLazyImage(img: HTMLImageElement, src: string, options: LazyImageOptions = {}): () => void {
    const rootMargin = options.rootMargin ?? '200px'

    const apply = () => {
      if (img.dataset.loaded === 'true') return
      img.src = src
      img.dataset.loaded = 'true'
      if (img.complete) {
        img.classList.add('opacity-100')
        options.onLoad?.()
      } else {
        img.addEventListener('load', () => {
          img.classList.add('opacity-100')
          options.onLoad?.()
        })
      }
    }

    // Prefer native lazy loading when available; still wire IO for the fade.
    img.loading = 'lazy'

    if (typeof IntersectionObserver === 'undefined') {
      apply()
      return () => {}
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            apply()
            obs.disconnect()
            break
          }
        }
      },
      { rootMargin, threshold: 0 },
    )
    observer.observe(img)

    return () => observer.disconnect()
  }

  dispose(): void {
    this.observer?.disconnect()
    this.observer = null
  }
}

/** Shared singleton loader. */
export const lazyLoader = new LazyLoader()
