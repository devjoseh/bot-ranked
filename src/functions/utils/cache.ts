type CacheEntry = { requestId: string; userId: string };
type CacheCategory = { [key:string]: CacheEntry[] }

const cacheStore: CacheCategory = {};

class CacheManager {
    private cacheStore: Record<string, CacheEntry[]> = {};

    /**
     * Adds an entry to the cache for the specified category.
     * @param category The cache category (e.g., 'request', 'mentoring')
     * @param requestId The request id
     * @param userId The user ID
     */
    public add(category: string, requestId: string, userId: string): boolean {
        if(!this.cacheStore[category]) {
            this.cacheStore[category] = [];
        }

        this.cacheStore[category].push({ requestId, userId })
        return true;
    }

    /**
     * Removes an entry from the cache for the specified category based on requestId
     * @param category The cache category
     * @param requestId The request id to be removed
     */
    public remove(category: string, requestId: string): boolean {
        if(!this.cacheStore[category]) return false;

        const index = this.cacheStore[category].findIndex(entry => entry.requestId === requestId);
        if (index !== -1) {
            this.cacheStore[category].splice(index, 1);
            return true;
        }

        return false;
    }

    /**
     * Searches for an entry in the cache for the specified category based on requestId
     * @param category The cache category
     * @param requestId The request id to be found
     * @returns The cache entry or undefined if not found
     */
    public find(category: string, requestId: string): CacheEntry | undefined {
        return this.cacheStore[category]?.find(entry => entry.requestId === requestId);
    }

    public clear(category: string): void {
        delete cacheStore[category];
    }

    public clearAll(): void {
        for (const category in cacheStore) {
            delete cacheStore[category]
        }
    }
}

export default CacheManager;