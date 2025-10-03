import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL;
      
      if (!redisUrl) {
        console.warn('REDIS_URL not found in environment variables');
        this.isConnected = false;
        return;
      }
      
      this.client = createClient({
        url: redisUrl
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Generate cache key for pharmacy data based on date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {string} Cache key
   */
  getCacheKey(date) {
    return `pharmacies:${date}`;
  }

  /**
   * Get pharmacy data from cache
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Array|null} Cached pharmacy data or null if not found
   */
  async getPharmacies(date) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const key = this.getCacheKey(date);
      const cachedData = await this.client.get(key);
      
      if (cachedData) {
        console.log(`Cache hit for date: ${date}`);
        return JSON.parse(cachedData);
      }
      
      console.log(`Cache miss for date: ${date}`);
      return null;
    } catch (error) {
      console.error('Error getting data from cache:', error);
      return null;
    }
  }

  /**
   * Store pharmacy data in cache with TTL
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {Array} pharmacies - Pharmacy data to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 24 hours)
   */
  async setPharmacies(date, pharmacies, ttlSeconds = 24 * 60 * 60) {
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, skipping cache set');
      return;
    }

    try {
      const key = this.getCacheKey(date);
      const data = JSON.stringify(pharmacies);
      
      await this.client.setEx(key, ttlSeconds, data);
      console.log(`Cached pharmacy data for date: ${date} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      console.error('Error setting data in cache:', error);
    }
  }

  /**
   * Clear cache for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   */
  async clearCache(date) {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const key = this.getCacheKey(date);
      await this.client.del(key);
      console.log(`Cleared cache for date: ${date}`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  async getStats() {
    if (!this.isConnected || !this.client) {
      return { connected: false };
    }

    try {
      const info = await this.client.info('memory');
      const keys = await this.client.keys('pharmacies:*');
      
      return {
        connected: true,
        memoryInfo: info,
        cachedDates: keys.length
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { connected: false, error: error.message };
    }
  }
}

// Create singleton instance
const redisCache = new RedisCache();

export default redisCache;
