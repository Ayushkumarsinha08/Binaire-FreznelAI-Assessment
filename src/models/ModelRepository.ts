import { ModelService, modelService as defaultModelService } from '../api/ModelService';
import {
  IndexedDBCacheService,
  indexedDBCacheService as defaultCacheService,
} from '../offline/IndexedDBCacheService';
import { CachedDataset, CacheMetadata, ModelData } from '../types/model';

/**
 * ModelRepository
 *
 * Single point of access for model data following Repository Pattern (OOP).
 * Coordinates between:
 * - Remote network layer (ModelService)
 * - Local persistent storage (IndexedDBCacheService)
 *
 * Implements cache-first loading, online background refresh, and metadata inspection.
 */
export class ModelRepository {
  private modelService: ModelService;
  private cacheService: IndexedDBCacheService;

  constructor(
    modelService: ModelService = defaultModelService,
    cacheService: IndexedDBCacheService = defaultCacheService
  ) {
    this.modelService = modelService;
    this.cacheService = cacheService;
  }

  /**
   * Reads the currently cached dataset from IndexedDB.
   */
  public async getCachedData(): Promise<CachedDataset | null> {
    return this.cacheService.loadDataset();
  }

  /**
   * Fetches the latest models from the remote API via Promise-chaining
   * and atomically commits them to IndexedDB after validation.
   */
  public async fetchAndCacheFreshModels(signal?: AbortSignal): Promise<{
    models: ModelData[];
    metadata: CacheMetadata;
  }> {
    // 1. Fetch via pure Promise chaining
    const freshModels = await this.modelService.fetchModelsWithoutAsyncAwait(signal);

    // 2. Commit atomically to IndexedDB
    const metadata = await this.cacheService.saveDataset(freshModels);

    return {
      models: freshModels,
      metadata,
    };
  }

  /**
   * Retrieves cache metadata.
   */
  public async getCacheMetadata(): Promise<CacheMetadata | null> {
    return this.cacheService.getMetadata();
  }

  /**
   * Clears the persistent cache.
   */
  public async clearCache(): Promise<void> {
    await this.cacheService.clearCache();
  }
}

// Default singleton instance
export const modelRepository = new ModelRepository();
