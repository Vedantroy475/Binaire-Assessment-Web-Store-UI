import { useState } from 'react'
import { WifiOff, Wifi, Power } from 'lucide-react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { networkMonitor } from '@/offline/NetworkMonitor'
import { cn } from '@/utils/cn'

/**
 * NetworkStatusBanner
 *
 * The brief requires the UI to tell the user the current internet connection
 * status and support being switched online/offline (even "randomly"). This
 * banner reflects the live status from {@link networkMonitor} and includes a
 * toggle so the offline behaviour can be demonstrated on demand.
 */
export function NetworkStatusBanner() {
  const { isOnline, isSimulated } = useNetworkStatus()
  const [, force] = useState(0)

  const toggle = () => {
    networkMonitor.setSimulatedOffline(networkMonitor.isOnline)
    force((n) => n + 1)
  }

  if (isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex items-center justify-between gap-3 bg-steam-green/90 px-4 py-1.5 text-xs text-steam-pricegreen',
          'animate-banner-in',
        )}
      >
        <span className="flex items-center gap-2 font-medium">
          <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
          {isSimulated ? 'Simulating online connection' : 'You are online'}
        </span>
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-1 rounded px-2 py-0.5 font-semibold text-steam-pricegreen/90 hover:bg-black/20 hover:text-steam-pricegreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-pricegreen"
        >
          <Power className="h-3 w-3" aria-hidden="true" />
          Simulate offline
        </button>
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-between gap-3 bg-destructive/90 px-4 py-1.5 text-xs text-white',
        'animate-banner-in',
      )}
    >
      <span className="flex items-center gap-2 font-medium">
        <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
        {isSimulated
          ? 'Offline mode (simulated) — showing cached content'
          : 'You are offline — showing cached content'}
      </span>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1 rounded px-2 py-0.5 font-semibold text-white/90 hover:bg-black/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <Power className="h-3 w-3" aria-hidden="true" />
        Go back online
      </button>
    </div>
  )
}
