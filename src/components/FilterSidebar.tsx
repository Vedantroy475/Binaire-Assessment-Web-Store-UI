import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import type { FilterState } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { activeFilterCount } from '@/filters/FilterEngine'
import { cn } from '@/utils/cn'

interface FilterSidebarProps {
  state: FilterState
  genres: string[]
  onChange: (next: FilterState) => void
  onReset: () => void
}

/**
 * FilterSidebar - the left-hand filter rail on the New Releases page.
 * Genre checkboxes, price range inputs, an "on sale" toggle and a minimum
 * rating stepper. Reports every change up through onChange.
 */
export function FilterSidebar({ state, genres, onChange, onReset }: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const count = activeFilterCount(state)

  const toggleGenre = (genre: string) => {
    const has = state.genres.includes(genre)
    onChange({
      ...state,
      genres: has ? state.genres.filter((g) => g !== genre) : [...state.genres, genre],
    })
  }

  const body = (
    <div className="space-y-6">
      {/* Genres */}
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-steam-textdim">
          Genres
        </legend>
        <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {genres.map((genre) => (
            <label
              key={genre}
              className="flex cursor-pointer items-center gap-2 text-sm text-steam-text hover:text-steam-blue"
            >
              <Checkbox
                checked={state.genres.includes(genre)}
                onCheckedChange={() => toggleGenre(genre)}
              />
              <span>{genre}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Price */}
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-steam-textdim">
          Price range
        </legend>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            aria-label="Minimum price"
            value={state.minPrice ?? ''}
            onChange={(e) =>
              onChange({ ...state, minPrice: e.target.value === '' ? null : Number(e.target.value) })
            }
          />
          <span className="text-steam-textdim">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            aria-label="Maximum price"
            value={state.maxPrice ?? ''}
            onChange={(e) =>
              onChange({ ...state, maxPrice: e.target.value === '' ? null : Number(e.target.value) })
            }
          />
        </div>
      </fieldset>

      {/* On sale */}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-steam-text hover:text-steam-blue">
        <Checkbox
          checked={state.onSaleOnly}
          onCheckedChange={(v) => onChange({ ...state, onSaleOnly: Boolean(v) })}
        />
        <span>On sale only</span>
      </label>

      {/* Min rating */}
      <div>
        <label
          htmlFor="min-rating"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-steam-textdim"
        >
          Minimum rating: {state.minRating.toFixed(1)}
        </label>
        <input
          id="min-rating"
          type="range"
          min={0}
          max={9}
          step={0.5}
          value={state.minRating}
          onChange={(e) => onChange({ ...state, minRating: Number(e.target.value) })}
          className="w-full accent-steam-blue"
        />
      </div>

      <Button variant="outline" size="sm" onClick={onReset} className="w-full" disabled={count === 0}>
        Reset filters {count > 0 && `(${count})`}
      </Button>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="sm"
        className="mb-4 w-full lg:hidden"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-controls="filter-panel"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters {count > 0 && `(${count})`}
      </Button>

      <aside
        id="filter-panel"
        className={cn(
          'panel shrink-0 p-4 lg:block lg:w-64',
          mobileOpen ? 'mb-4 block' : 'hidden',
        )}
        aria-label="Product filters"
      >
        {body}
      </aside>
    </>
  )
}
