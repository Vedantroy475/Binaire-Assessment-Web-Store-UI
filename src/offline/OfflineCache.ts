/**
 * OfflineCache - a small promise wrapper around IndexedDB used to store API
 * responses so the store keeps working while offline ("full API access"
 * offline = previously fetched data remains available).
 *
 * Falls back gracefully to an in-memory Map when IndexedDB is unavailable
 * (e.g. private mode) so the app never crashes.
 */

const DB_NAME = 'webstore-cache'
const DB_VERSION = 1
const STORE_NAME = 'responses'

interface CacheRecord {
  key: string
  value: unknown
  timestamp: number
}

export class OfflineCache {
  private dbPromise: Promise<IDBDatabase> | null = null
  private memory = new Map<string, CacheRecord>()
  private useMemoryFallback = false

  /** Open (and lazily create) the IndexedDB database. */
  private openDb(): Promise<IDBDatabase> {
    if (this.useMemoryFallback) return Promise.reject(new Error('memory fallback'))
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB unavailable'))
        return
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    }).catch((err) => {
      this.useMemoryFallback = true
      throw err
    })

    return this.dbPromise
  }

  private tx<T>(
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    return this.openDb().then(
      (db) =>
        new Promise<T>((resolve, reject) => {
          const transaction = db.transaction(STORE_NAME, mode)
          const store = transaction.objectStore(STORE_NAME)
          const req = fn(store)
          req.onsuccess = () => resolve(req.result)
          req.onerror = () => reject(req.error)
        }),
    )
  }

  /** Store a value under a key. */
  async set(key: string, value: unknown): Promise<void> {
    const record: CacheRecord = { key, value, timestamp: Date.now() }
    if (this.useMemoryFallback) {
      this.memory.set(key, record)
      return
    }
    try {
      await this.tx('readwrite', (store) => store.put(record) as IDBRequest<IDBValidKey>)
    } catch {
      this.memory.set(key, record)
    }
  }

  /** Retrieve a value previously stored under a key (or undefined). */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    if (this.useMemoryFallback) {
      return this.memory.get(key)?.value as T | undefined
    }
    try {
      const record = await this.tx<CacheRecord | undefined>('readonly', (store) =>
        store.get(key) as IDBRequest<CacheRecord | undefined>,
      )
      return record?.value as T | undefined
    } catch {
      return this.memory.get(key)?.value as T | undefined
    }
  }

  /** Whether a key exists in the cache. */
  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== undefined
  }

  /** Remove a single key. */
  async remove(key: string): Promise<void> {
    if (this.useMemoryFallback) {
      this.memory.delete(key)
      return
    }
    try {
      await this.tx('readwrite', (store) => store.delete(key) as IDBRequest<undefined>)
    } catch {
      this.memory.delete(key)
    }
  }

  /** Clear everything (used on sign-out / cache reset). */
  async clear(): Promise<void> {
    this.memory.clear()
    if (this.useMemoryFallback) return
    try {
      await this.tx('readwrite', (store) => store.clear() as IDBRequest<undefined>)
    } catch {
      /* ignore */
    }
  }
}

/** Singleton cache shared across the app. */
export const offlineCache = new OfflineCache()
