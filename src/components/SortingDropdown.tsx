import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronDown } from 'lucide-react'
import type { SortKey, SortOption } from '@/types'
import { cn } from '@/utils/cn'

interface SortingDropdownProps {
  options: SortOption[]
  value: SortKey
  onChange: (key: SortKey) => void
}

/**
 * SortingDropdown - a from-scratch sort selector (built on @radix-ui/react-
 * dropdown-menu, the primitive that ships with shadcn/ui). Lets the user pick
 * one of the polymorphic sort strategies exposed by the sorting module.
 */
export function SortingDropdown({ options, value, onChange }: SortingDropdownProps) {
  const current = options.find((o) => o.key === value)

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger
        className={cn(
          'inline-flex items-center gap-2 rounded-sm border border-border bg-steam-header/60 px-3 py-2 text-sm text-steam-text',
          'hover:border-steam-blue/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue',
        )}
        aria-label="Sort by"
      >
        <span className="text-steam-textdim">Sort:</span>
        <span className="font-medium">{current?.label ?? 'Select'}</span>
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className="z-50 min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-lg"
          align="end"
        >
          {options.map((option) => (
            <DropdownMenuPrimitive.Item
              key={option.key}
              onSelect={() => onChange(option.key)}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-steam-text outline-none',
                'hover:bg-steam-blue/20 focus:bg-steam-blue/20',
              )}
            >
              {option.label}
              {option.key === value && <Check className="h-4 w-4 text-steam-blue" aria-hidden="true" />}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
