import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis | null = null;
  private readonly enabled: boolean;
  private readonly ttl: number = 3600; // Default 1 hour

  constructor(private configService: ConfigService) {
    this.enabled = !!this.configService.get<string>('REDIS_URL');
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.warn('Redis is not configured. Caching is disabled.');
      return;
    }

    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      this.redis = new Redis(redisUrl!, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      this.redis = null;
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      const expiration = ttl || this.ttl;
      await this.redis.setex(key, expiration, serialized);
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string | string[]): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      const keys = Array.isArray(key) ? key : [key];
      await this.redis.del(...keys);
    } catch (error) {
      this.logger.error(`Error deleting key(s):`, error);
    }
  }

  /**
   * Delete keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Error deleting pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration time for key
   */
  async expire(key: string, seconds: number): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      await this.redis.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Error setting expiration for key ${key}:`, error);
    }
  }

  /**
   * Increment numeric value
   */
  async incr(key: string): Promise<number> {
    if (!this.redis) {
      return 0;
    }

    try {
      return await this.redis.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Cache wrapper - get from cache or execute function and cache result
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Cache result
    await this.set(key, result, ttl);

    return result;
  }

  /**
   * Generate cache key for store-scoped data
   */
  storeKey(storeId: string, entity: string, id?: string): string {
    return id ? `store:${storeId}:${entity}:${id}` : `store:${storeId}:${entity}`;
  }

  /**
   * Invalidate all cache for a store
   */
  async invalidateStore(storeId: string): Promise<void> {
    await this.delPattern(`store:${storeId}:*`);
  }

  /**
   * Invalidate cache for specific entity in store
   */
  async invalidateStoreEntity(storeId: string, entity: string): Promise<void> {
    await this.delPattern(`store:${storeId}:${entity}:*`);
  }
}
