import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Checkbox - shadcn/ui checkbox built on @radix-ui/react-checkbox. */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-steam-blue/50 bg-steam-header',
      'hover:border-steam-blue',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue focus-visible:ring-offset-2 focus-visible:ring-offset-steam-header',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-steam-blue data-[state=checked]:text-steam-header',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
