import { describe, expect, it } from 'vitest';
import { ModelSortEngine } from '../src/sorting/ModelSortEngine';
import { normalizeModel } from '../src/utils/normalization';

describe('ModelSortEngine', () => {
  const sortEngine = new ModelSortEngine();

  const mockModels = [
    normalizeModel({ id: '2', display_name: 'Beta Model', safetensor_file_count: 50 }),
    normalizeModel({ id: '1', display_name: 'Alpha Model', safetensor_file_count: 200 }),
    normalizeModel({ id: '3', display_name: 'Gamma Model', safetensor_file_count: 10 }),
  ];

  it('sorts by model name A to Z', () => {
    const sorted = sortEngine.sort(mockModels, 'name', 'asc');
    expect(sorted.map((m) => m.displayName)).toEqual([
      'Alpha Model',
      'Beta Model',
      'Gamma Model',
    ]);
  });

  it('sorts by model name Z to A', () => {
    const sorted = sortEngine.sort(mockModels, 'name', 'desc');
    expect(sorted.map((m) => m.displayName)).toEqual([
      'Gamma Model',
      'Beta Model',
      'Alpha Model',
    ]);
  });

  it('sorts by safetensor file count ascending (low to high)', () => {
    const sorted = sortEngine.sort(mockModels, 'safetensors', 'asc');
    expect(sorted.map((m) => m.safetensorFileCount)).toEqual([10, 50, 200]);
  });

  it('sorts by safetensor file count descending (high to low)', () => {
    const sorted = sortEngine.sort(mockModels, 'safetensors', 'desc');
    expect(sorted.map((m) => m.safetensorFileCount)).toEqual([200, 50, 10]);
  });

  it('does not mutate the source array (immutable sorting)', () => {
    const originalNames = mockModels.map((m) => m.displayName);
    sortEngine.sort(mockModels, 'name', 'asc');
    expect(mockModels.map((m) => m.displayName)).toEqual(originalNames);
  });
});
