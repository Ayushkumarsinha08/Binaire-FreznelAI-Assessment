import { AvailableFilterOptions, FilterState, ModelData } from '../types/model';

/**
 * ModelFilterEngine
 *
 * Implements composable filtering across multiple dimensions:
 * - Dynamic generation of filter options & model counts directly from dataset
 * - Multi-select tag semantics:
 *   * WITHIN same category: OR (e.g., text-generation OR vision-language)
 *   * ACROSS different categories: AND (e.g., (pipeline A OR pipeline B) AND family Llama)
 * - Safe numeric range bounds for safetensor file counts
 * - Pure functions returning derived copies (never mutates source data)
 */
export class ModelFilterEngine {
  /**
   * Dynamically inspects all models to extract unique filter categories,
   * option frequencies (counts), and minimum/maximum safetensor bounds.
   */
  public extractAvailableFilters(models: ModelData[]): AvailableFilterOptions {
    const pipelineCountMap = new Map<string, number>();
    const familyCountMap = new Map<string, number>();
    const archCountMap = new Map<string, number>();
    const weightCountMap = new Map<string, number>();

    let minSafetensor = Number.MAX_SAFE_INTEGER;
    let maxSafetensor = 0;

    for (const m of models) {
      // Pipelines
      if (m.pipelineTag) {
        pipelineCountMap.set(m.pipelineTag, (pipelineCountMap.get(m.pipelineTag) ?? 0) + 1);
      }

      // Families
      if (m.family) {
        familyCountMap.set(m.family, (familyCountMap.get(m.family) ?? 0) + 1);
      }

      // Architecture
      if (m.architectureCategory) {
        archCountMap.set(m.architectureCategory, (archCountMap.get(m.architectureCategory) ?? 0) + 1);
      }

      // Weight formats
      if (m.weightFormat) {
        weightCountMap.set(m.weightFormat, (weightCountMap.get(m.weightFormat) ?? 0) + 1);
      }

      // Safetensors min/max
      if (m.safetensorFileCount < minSafetensor) {
        minSafetensor = m.safetensorFileCount;
      }
      if (m.safetensorFileCount > maxSafetensor) {
        maxSafetensor = m.safetensorFileCount;
      }
    }

    const toSortedArray = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return {
      pipelineTags: toSortedArray(pipelineCountMap),
      families: toSortedArray(familyCountMap),
      architectureCategories: toSortedArray(archCountMap),
      weightFormats: toSortedArray(weightCountMap),
      safetensorMinLimit: minSafetensor === Number.MAX_SAFE_INTEGER ? 0 : minSafetensor,
      safetensorMaxLimit: maxSafetensor,
    };
  }

  /**
   * Filters by pipeline tags (OR semantics within selected pipelines)
   */
  public filterByPipeline(models: ModelData[], selectedPipelines: string[]): ModelData[] {
    if (!selectedPipelines || selectedPipelines.length === 0) return models;
    const set = new Set(selectedPipelines);
    return models.filter((m) => set.has(m.pipelineTag));
  }

  /**
   * Filters by model families (OR semantics within selected families)
   */
  public filterByFamily(models: ModelData[], selectedFamilies: string[]): ModelData[] {
    if (!selectedFamilies || selectedFamilies.length === 0) return models;
    const set = new Set(selectedFamilies);
    return models.filter((m) => set.has(m.family));
  }

  /**
   * Filters by architecture category (OR semantics within selected architectures)
   */
  public filterByArchitecture(models: ModelData[], selectedArchitectures: string[]): ModelData[] {
    if (!selectedArchitectures || selectedArchitectures.length === 0) return models;
    const set = new Set(selectedArchitectures);
    return models.filter((m) => set.has(m.architectureCategory));
  }

  /**
   * Filters by weight formats (OR semantics within selected weight formats)
   */
  public filterByWeight(models: ModelData[], selectedWeights: string[]): ModelData[] {
    if (!selectedWeights || selectedWeights.length === 0) return models;
    const set = new Set(selectedWeights);
    return models.filter((m) => set.has(m.weightFormat));
  }

  /**
   * Filters by safetensor file count range: min <= count <= max
   */
  public filterBySafetensorRange(models: ModelData[], min: number, max: number): ModelData[] {
    return models.filter((m) => m.safetensorFileCount >= min && m.safetensorFileCount <= max);
  }

  /**
   * Applies all active filters composably:
   * (pipeline_1 OR ... OR pipeline_n)
   * AND (family_1 OR ... OR family_n)
   * AND (arch_1 OR ... OR arch_n)
   * AND (weight_1 OR ... OR weight_n)
   * AND (min <= count <= max)
   */
  public applyFilters(models: ModelData[], filters: FilterState): ModelData[] {
    let result = models;

    // Filter by Pipeline Tags
    if (filters.pipelineTags.length > 0) {
      result = this.filterByPipeline(result, filters.pipelineTags);
    }

    // Filter by Families
    if (filters.families.length > 0) {
      result = this.filterByFamily(result, filters.families);
    }

    // Filter by Architectures
    if (filters.architectureCategories.length > 0) {
      result = this.filterByArchitecture(result, filters.architectureCategories);
    }

    // Filter by Weights
    if (filters.weightFormats.length > 0) {
      result = this.filterByWeight(result, filters.weightFormats);
    }

    // Filter by Safetensor file count range
    if (filters.safetensorMin > 0 || filters.safetensorMax < Number.MAX_SAFE_INTEGER) {
      result = this.filterBySafetensorRange(result, filters.safetensorMin, filters.safetensorMax);
    }

    return result;
  }
}

// Default singleton instance
export const modelFilterEngine = new ModelFilterEngine();
