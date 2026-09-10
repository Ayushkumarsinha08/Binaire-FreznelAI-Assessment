import { describe, expect, it } from 'vitest';
import { ModelFilterEngine } from '../src/filters/ModelFilterEngine';
import { normalizeModel } from '../src/utils/normalization';

describe('ModelFilterEngine', () => {
  const filterEngine = new ModelFilterEngine();

  const mockModels = [
    normalizeModel({
      id: 'm1',
      display_name: 'Model 1',
      family: 'Llama (Meta)',
      architecture_category: 'Dense',
      weight_format: 'BF16',
      safetensor_file_count: '15',
      hf_tags: { pipeline_tag: 'text-generation' },
    }),
    normalizeModel({
      id: 'm2',
      display_name: 'Model 2',
      family: 'Llama (Meta)',
      architecture_category: 'MoE',
      weight_format: 'FP16',
      safetensor_file_count: '5',
      hf_tags: { pipeline_tag: 'vision-language' },
    }),
    normalizeModel({
      id: 'm3',
      display_name: 'Model 3',
      family: 'Qwen (Alibaba)',
      architecture_category: 'Dense',
      weight_format: 'BF16',
      safetensor_file_count: '100',
      hf_tags: { pipeline_tag: 'text-generation' },
    }),
  ];

  it('filters by pipeline tag with OR semantics within category', () => {
    const result = filterEngine.filterByPipeline(mockModels, ['text-generation']);
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.id)).toEqual(['m1', 'm3']);

    const multiResult = filterEngine.filterByPipeline(mockModels, [
      'text-generation',
      'vision-language',
    ]);
    expect(multiResult).toHaveLength(3);
  });

  it('filters by family tag', () => {
    const result = filterEngine.filterByFamily(mockModels, ['Llama (Meta)']);
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.id)).toEqual(['m1', 'm2']);
  });

  it('filters by architecture category', () => {
    const result = filterEngine.filterByArchitecture(mockModels, ['MoE']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m2');
  });

  it('filters by weight format', () => {
    const result = filterEngine.filterByWeight(mockModels, ['FP16']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m2');
  });

  it('filters by safetensor file count range: min <= count <= max', () => {
    const result = filterEngine.filterBySafetensorRange(mockModels, 10, 50);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m1');
  });

  it('applies composable filters with AND across categories and OR within category', () => {
    const filtered = filterEngine.applyFilters(mockModels, {
      pipelineTags: ['text-generation'],
      families: ['Llama (Meta)'],
      architectureCategories: ['Dense'],
      weightFormats: ['BF16'],
      safetensorMin: 10,
      safetensorMax: 200,
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('m1');
  });

  it('dynamically extracts available filter options and safetensor bounds', () => {
    const options = filterEngine.extractAvailableFilters(mockModels);
    expect(options.pipelineTags).toContainEqual({ name: 'text-generation', count: 2 });
    expect(options.pipelineTags).toContainEqual({ name: 'vision-language', count: 1 });
    expect(options.families).toContainEqual({ name: 'Llama (Meta)', count: 2 });
    expect(options.safetensorMinLimit).toBe(5);
    expect(options.safetensorMaxLimit).toBe(100);
  });
});
