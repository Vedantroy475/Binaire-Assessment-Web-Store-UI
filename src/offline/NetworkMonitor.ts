import type { ConnectionStatus } from '@/types'

type Listener = (status: ConnectionStatus) => void

/**
 * NetworkMonitor tracks connectivity using the browser's `navigator.onLine`
 * flag plus the `online` / `offline` window events.
 *
 * The brief says the app "will be switched to online and offline mode randomly
 * and the UI has to tell the user about the current internet connection
 * status". To make that observable/demo-able, this monitor also supports a
 * manual "simulate offline" override (toggled from the UI). When the override
 * is active it takes precedence over the real navigator status.
 *
 * Implemented as an observable singleton so any component can subscribe.
 */
export class NetworkMonitor {
  private listeners = new Set<Listener>()
  private simulated: boolean | null = null
  private _status: ConnectionStatus

  constructor() {
    this._status = this.readNavigatorStatus()

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }
  }

  private readNavigatorStatus(): ConnectionStatus {
    if (typeof navigator === 'undefined') return 'online'
    return navigator.onLine ? 'online' : 'offline'
  }

  private handleOnline = () => this.recompute()
  private handleOffline = () => this.recompute()

  private recompute() {
    const real = this.readNavigatorStatus()
    const next: ConnectionStatus =
      this.simulated !== null ? (this.simulated ? 'offline' : 'online') : real
    if (next !== this._status) {
      this._status = next
      this.emit()
    }
  }

  /** Current effective status. */
  get status(): ConnectionStatus {
    return this._status
  }

  get isOnline(): boolean {
    return this._status === 'online'
  }

  /**
   * Override connectivity for demonstration.
   * Pass `null` to return to following the real navigator status.
   */
  setSimulatedOffline(offline: boolean | null): void {
    this.simulated = offline
    this.recompute()
  }

  get isSimulated(): boolean {
    return this.simulated !== null
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    // Push current value immediately.
    listener(this._status)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit() {
    for (const listener of this.listeners) listener(this._status)
  }

  dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
    this.listeners.clear()
  }
}

/** Singleton monitor shared across the app. */
export const networkMonitor = new NetworkMonitor()
