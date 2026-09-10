import { describe, expect, it } from 'vitest';
import { ModelService } from '../src/api/ModelService';

describe('ModelService (Promise Chaining without async/await)', () => {
  it('fetches and normalizes models using pure Promise chaining', () => {
    // Fulfills the requirement: test that fetchModelsWithoutAsyncAwait returns a Promise and executes through .then()
    const service = new ModelService();
    const promise = service.fetchModelsWithoutAsyncAwait();

    expect(promise).toBeInstanceOf(Promise);

    return promise.then((models) => {
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      const first = models[0];
      expect(first.id).toBeDefined();
      expect(first.displayName).toBeDefined();
      expect(typeof first.safetensorFileCount).toBe('number');
      expect(typeof first.searchText).toBe('string');
    });
  });

  it('rejects with descriptive error on HTTP failure', () => {
    const brokenService = new ModelService('https://binaire.app/non-existent-endpoint-404.json');
    return brokenService
      .fetchModelsWithoutAsyncAwait()
      .then(() => {
        throw new Error('Should have failed');
      })
      .catch((err) => {
        expect(err.message).toMatch(/HTTP 404|Failed to download/);
      });
  });
});
