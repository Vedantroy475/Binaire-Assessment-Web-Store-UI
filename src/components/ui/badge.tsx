import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/** Badge - small status/label pill (used for tags, discounts, platforms). */
const badgeVariants = cva(
  'inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-steam-blue text-steam-header',
        secondary: 'border-transparent bg-steam-card text-steam-text',
        outline: 'border-steam-textdim/40 text-steam-textdim',
        discount: 'border-transparent bg-steam-green text-steam-pricegreen',
        green: 'border-transparent bg-steam-pricegreen text-steam-header',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
