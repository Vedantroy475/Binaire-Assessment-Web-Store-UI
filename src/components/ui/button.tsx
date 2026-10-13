import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Button - shadcn/ui style button built on class-variance-authority.
 * Every variant exposes hover / active / focus-visible / disabled states,
 * and the base class includes a focus-visible ring for accessibility.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue focus-visible:ring-offset-2 focus-visible:ring-offset-steam-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-steam-blue text-steam-header hover:bg-steam-blue/90 active:bg-steam-blue/80',
        primary:
          'bg-steam-blue text-steam-header font-semibold hover:brightness-110 active:brightness-95',
        green:
          'bg-steam-green text-steam-pricegreen hover:bg-steam-greendark active:brightness-95',
        outline:
          'border border-steam-blue/40 bg-transparent text-steam-blue hover:bg-steam-blue/10 hover:border-steam-blue hover:text-white hover:font-bold active:bg-steam-blue/20',
        ghost:
          'text-steam-text hover:bg-white/5 hover:text-white hover:font-bold active:bg-white/10',
        link: 'text-steam-blue underline-offset-4 hover:underline hover:text-white hover:font-bold',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
