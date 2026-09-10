import { ModelData, SearchMode } from '../types/model';

/**
 * ModelSearchEngine
 *
 * Encapsulates full-text and family search logic using object-oriented principles.
 * Supports:
 * - Substring matching from the beginning of strings
 * - Substring matching from the middle of strings
 * - Case-insensitive comparisons
 * - High-speed search using pre-indexed normalized lowercase text
 */
export class ModelSearchEngine {
  /**
   * Searches an array of models based on query and search mode.
   *
   * @param models Array of normalized models to search across
   * @param query Raw search query string from user input
   * @param mode 'name' to search model display name/id/repo; 'family' to search family
   * @returns Derived filtered array of matching models (pure function, does not mutate input)
   */
  public search(models: ModelData[], query: string, mode: SearchMode = 'name'): ModelData[] {
    if (!query || typeof query !== 'string') {
      return models;
    }

    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length === 0) {
      return models;
    }

    if (mode === 'family') {
      return models.filter((m) => m.familySearchText.includes(cleanQuery));
    }

    // Default 'name' mode searches across id, displayName, huggingfaceRepo, and authorNamespace
    return models.filter((m) => m.searchText.includes(cleanQuery));
  }
}

// Default singleton instance for convenience
export const modelSearchEngine = new ModelSearchEngine();
