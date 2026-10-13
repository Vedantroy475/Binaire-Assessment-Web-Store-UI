import { useEffect, useState } from 'react'
import { networkMonitor } from '@/offline/NetworkMonitor'
import type { ConnectionStatus } from '@/types'

/**
 * Subscribe a React component to the network connection status.
 * Re-renders whenever online/offline changes (including the manual simulate
 * toggle), so the UI can always tell the user the current connection state.
 */
export function useNetworkStatus(): {
  status: ConnectionStatus
  isOnline: boolean
  isSimulated: boolean
} {
  const [status, setStatus] = useState<ConnectionStatus>(networkMonitor.status)

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe(setStatus)
    return unsubscribe
  }, [])

  return {
    status,
    isOnline: status === 'online',
    isSimulated: networkMonitor.isSimulated,
  }
}
