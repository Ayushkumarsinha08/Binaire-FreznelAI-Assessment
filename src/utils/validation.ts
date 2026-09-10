import { RawApiResponse, ModelData } from '../types/model';

/**
 * Validates the raw JSON payload downloaded from the API.
 * Ensures the root object contains a non-empty `models` array with well-formed objects.
 */
export function validateRawApiResponse(data: unknown): data is RawApiResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const payload = data as Record<string, unknown>;
  if (!Array.isArray(payload.models)) {
    return false;
  }

  // Ensure there is at least one model, and inspect the first few items
  if (payload.models.length === 0) {
    return false;
  }

  const sampleCount = Math.min(payload.models.length, 5);
  for (let i = 0; i < sampleCount; i++) {
    const item = payload.models[i];
    if (!item || typeof item !== 'object') {
      return false;
    }
    // Must have at least an id or a display_name
    const record = item as Record<string, unknown>;
    const hasId = typeof record.id === 'string' && record.id.trim().length > 0;
    const hasName = typeof record.display_name === 'string' && record.display_name.trim().length > 0;
    if (!hasId && !hasName) {
      return false;
    }
  }

  return true;
}

/**
 * Validates that normalized models meet basic domain integrity requirements.
 */
export function validateNormalizedModels(models: unknown): models is ModelData[] {
  if (!Array.isArray(models) || models.length === 0) {
    return false;
  }

  return models.every((m) => {
    return (
      typeof m === 'object' &&
      m !== null &&
      typeof m.id === 'string' &&
      typeof m.displayName === 'string' &&
      typeof m.safetensorFileCount === 'number' &&
      !Number.isNaN(m.safetensorFileCount) &&
      typeof m.searchText === 'string'
    );
  });
}
