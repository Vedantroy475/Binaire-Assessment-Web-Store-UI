import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useIntersection - a from-scratch hook around the native IntersectionObserver
 * (no external libraries). Returns a ref to attach to a sentinel element and a
 * boolean telling whether that element is currently intersecting the viewport.
 */
export function useIntersection<T extends Element>(
  options: { rootMargin?: string; once?: boolean } = {},
): { ref: (node: T | null) => void; isIntersecting: boolean } {
  const { rootMargin = '200px', once = false } = options
  const [isIntersecting, setIntersecting] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (node: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      if (!node) return

      if (typeof IntersectionObserver === 'undefined') {
        setIntersecting(true)
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setIntersecting(true)
              if (once) observer.disconnect()
            } else if (!once) {
              setIntersecting(false)
            }
          }
        },
        { rootMargin, threshold: 0 },
      )
      observer.observe(node)
      observerRef.current = observer
    },
    [rootMargin, once],
  )

  useEffect(() => {
    return () => observerRef.current?.disconnect()
  }, [])

  return { ref, isIntersecting }
}
