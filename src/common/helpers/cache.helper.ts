import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheHelper {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  get<T>(key: string) {
    return this.cacheManager.get<T>(key);
  }

  set<T>(key: string, value: T) {
    return this.cacheManager.set(key, value);
  }

  del(cacheKeys: RegExp[]) {
    this.cacheManager.store.keys().then((keys) => {
      console.log(keys);
      keys.forEach((key) => {
        for (const cacheKey of cacheKeys) {
          if (key.match(cacheKey)) {
            this.cacheManager.del(key);
          }
        }
      });
    });
  }

  reset() {
    return this.cacheManager.reset();
  }
}
