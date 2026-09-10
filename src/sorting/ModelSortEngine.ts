import { ModelData, SortField, SortDirection } from '../types/model';

/**
 * ModelSortEngine
 *
 * Implements immutable, stable sorting algorithms for models.
 * Guarantees that the input array is never mutated.
 */
export class ModelSortEngine {
  /**
   * Sorts models by specified field and direction.
   *
   * @param models Array of models to sort
   * @param field 'name' or 'safetensors'
   * @param direction 'asc' or 'desc'
   * @returns Newly allocated sorted array (non-mutating)
   */
  public sort(
    models: ModelData[],
    field: SortField = 'name',
    direction: SortDirection = 'asc'
  ): ModelData[] {
    // Return a shallow copy so original array is not mutated
    const copy = [...models];

    copy.sort((a, b) => {
      let comparison = 0;

      if (field === 'safetensors') {
        comparison = a.safetensorFileCount - b.safetensorFileCount;
        // Secondary stable tie-breaker: display name
        if (comparison === 0) {
          comparison = a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' });
        }
      } else {
        // Sort by displayName (A-Z or Z-A)
        comparison = a.displayName.localeCompare(b.displayName, undefined, {
          sensitivity: 'base',
          numeric: true,
        });
        // Secondary stable tie-breaker: ID
        if (comparison === 0) {
          comparison = a.id.localeCompare(b.id);
        }
      }

      return direction === 'desc' ? -comparison : comparison;
    });

    return copy;
  }
}

// Default singleton instance
export const modelSortEngine = new ModelSortEngine();
