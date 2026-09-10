import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { IndexedDBCacheService } from '../src/offline/IndexedDBCacheService';
import { normalizeModel } from '../src/utils/normalization';

describe('IndexedDBCacheService & Corruption Protection', () => {
  let cacheService: IndexedDBCacheService;

  beforeEach(async () => {
    cacheService = new IndexedDBCacheService();
    await cacheService.clearCache();
  });

  const validModels = [
    normalizeModel({
      id: 'model-a',
      display_name: 'Model A',
      safetensor_file_count: 10,
    }),
    normalizeModel({
      id: 'model-b',
      display_name: 'Model B',
      safetensor_file_count: 20,
    }),
  ];

  it('saves and loads a valid dataset with complete metadata', async () => {
    const metadata = await cacheService.saveDataset(validModels);

    expect(metadata.status).toBe('valid');
    expect(metadata.modelCount).toBe(2);
    expect(metadata.checksum).toBeDefined();

    const loaded = await cacheService.loadDataset();
    expect(loaded).not.toBeNull();
    expect(loaded!.models).toHaveLength(2);
    expect(loaded!.models[0].id).toBe('model-a');
    expect(loaded!.metadata.modelCount).toBe(2);
  });

  it('rejects corrupted or malformed datasets before writing to cache', async () => {
    // Attempting to save an empty array or invalid structure throws an error
    await expect(cacheService.saveDataset([])).rejects.toThrow(/Corruption Prevention/);
    await expect(cacheService.saveDataset([{} as any])).rejects.toThrow(/Corruption Prevention/);
  });

  it('retains previous valid cache when a new corrupted dataset is rejected', async () => {
    // 1. Write known-good cache
    await cacheService.saveDataset(validModels);
    const initial = await cacheService.loadDataset();
    expect(initial!.models).toHaveLength(2);

    // 2. Attempt to write corrupt dataset
    try {
      await cacheService.saveDataset([{} as any]);
    } catch {
      // Expected rejection
    }

    // 3. Verify original cache is still 100% intact and undamaged
    const afterFailedWrite = await cacheService.loadDataset();
    expect(afterFailedWrite).not.toBeNull();
    expect(afterFailedWrite!.models).toHaveLength(2);
    expect(afterFailedWrite!.models[0].id).toBe('model-a');
  });
});
