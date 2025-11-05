/**
 * API Cache Utility
 * Handles caching of API responses to prevent rate limiting
 */

const CACHE_DURATION = {
  STANDINGS: 5 * 60 * 1000, // 5 minutes
  DRIVERS: 10 * 60 * 1000, // 10 minutes
  TEAMS: 10 * 60 * 1000, // 10 minutes
  SCHEDULE: 15 * 60 * 1000, // 15 minutes
  RACE_RESULTS: 30 * 60 * 1000, // 30 minutes (race results don't change)
  NEWS: 2 * 60 * 1000, // 2 minutes (news updates frequently)
  STATS: 60 * 60 * 1000, // 1 hour (historical data)
  TELEMETRY: 30 * 60 * 1000, // 30 minutes
  HEALTH: 1 * 60 * 1000, // 1 minute
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes
};

class ApiCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Generate cache key from function name and parameters
   */
  generateKey(functionName, ...args) {
    const params = args.filter(arg => arg !== undefined && arg !== null);
    return `${functionName}_${params.join('_')}`;
  }

  /**
   * Check if cached data is still valid
   */
  isValid(timestamp, duration) {
    return Date.now() - timestamp < duration;
  }

  /**
   * Get cached data if available and valid
   */
  get(functionName, ...args) {
    const key = this.generateKey(functionName, ...args);
    const cached = this.cache.get(key);

    if (cached && this.isValid(cached.timestamp, CACHE_DURATION[functionName.toUpperCase()] || 5 * 60 * 1000)) {
      console.log(`🔄 Using cached data for ${functionName}`);
      return cached.data;
    }

    return null;
  }

  /**
   * Store data in cache
   */
  set(functionName, data, ...args) {
    const key = this.generateKey(functionName, ...args);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 Cached data for ${functionName}`);
  }

  /**
   * Clear specific cache entry
   */
  clear(functionName, ...args) {
    const key = this.generateKey(functionName, ...args);
    this.cache.delete(key);
    console.log(`🗑️ Cleared cache for ${functionName}`);
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
    console.log('🗑️ Cleared all cache');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {};
    for (const [key, value] of this.cache.entries()) {
      const functionName = key.split('_')[0];
      if (!stats[functionName]) {
        stats[functionName] = 0;
      }
      stats[functionName]++;
    }
    return {
      totalEntries: this.cache.size,
      byFunction: stats
    };
  }
}

// Create singleton instance
const apiCache = new ApiCache();

export default apiCache;
export { CACHE_DURATION };
