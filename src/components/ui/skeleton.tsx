import { cn } from '@/utils/cn'

/** Skeleton - loading placeholder with a shimmering highlight. */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'skeleton rounded-md bg-steam-card',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
