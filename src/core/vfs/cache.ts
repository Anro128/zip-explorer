// LRU Cache for file contents — limits memory usage
// Evicts least-recently-used entries when capacity is exceeded.

interface CacheEntry<T> {
  value: T;
  size: number;  // bytes
  lastAccessed: number;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxBytes: number;
  private currentBytes = 0;

  constructor(maxMB = 100) {
    this.maxBytes = maxMB * 1024 * 1024;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    entry.lastAccessed = Date.now();
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, sizeBytes: number): void {
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }
    // Evict until we have space
    while (this.currentBytes + sizeBytes > this.maxBytes && this.cache.size > 0) {
      this.evictLRU();
    }
    this.cache.set(key, { value, size: sizeBytes, lastAccessed: Date.now() });
    this.currentBytes += sizeBytes;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentBytes -= entry.size;
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentBytes = 0;
  }

  get size(): number {
    return this.cache.size;
  }

  get usedMB(): number {
    return this.currentBytes / (1024 * 1024);
  }

  private evictLRU(): void {
    // Map iteration is in insertion order; first = LRU
    const firstKey = this.cache.keys().next().value;
    if (firstKey !== undefined) {
      this.delete(firstKey);
    }
  }
}

// Singleton cache for file content (blobs/text)
export const fileContentCache = new LRUCache<Uint8Array>(100);

// Singleton cache for zip entry listings (parsed VFSNode arrays)
export const zipEntryCache = new LRUCache<object>(50);
