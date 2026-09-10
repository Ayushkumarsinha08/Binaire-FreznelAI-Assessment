import { describe, expect, it } from 'vitest';
import { ModelSearchEngine } from '../src/search/ModelSearchEngine';
import { normalizeModel } from '../src/utils/normalization';

describe('ModelSearchEngine', () => {
  const searchEngine = new ModelSearchEngine();

  const mockModels = [
    normalizeModel({
      id: 'meta-llama/Llama-3.1-8B',
      display_name: 'Llama 3.1 8B (Instruct)',
      family: 'Llama (Meta)',
      huggingface_repo: 'meta-llama/Llama-3.1-8B',
    }),
    normalizeModel({
      id: 'google/gemma-2-9b',
      display_name: 'Gemma 2 9B (IT)',
      family: 'Gemma (Google)',
      huggingface_repo: 'google/gemma-2-9b',
    }),
    normalizeModel({
      id: 'Qwen/Qwen2.5-Coder-7B',
      display_name: 'Qwen 2.5 Coder 7B',
      family: 'Qwen (Alibaba)',
      huggingface_repo: 'Qwen/Qwen2.5-Coder-7B',
    }),
  ];

  it('matches beginning substring case-insensitively in Model Name mode', () => {
    const results = searchEngine.search(mockModels, 'llama', 'name');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('meta-llama/Llama-3.1-8B');
  });

  it('matches middle substring in Model Name mode', () => {
    const results = searchEngine.search(mockModels, '3.1', 'name');
    expect(results).toHaveLength(1);
    expect(results[0].displayName).toBe('Llama 3.1 8B (Instruct)');
  });

  it('matches author/repo namespace in Model Name mode', () => {
    const results = searchEngine.search(mockModels, 'google', 'name');
    expect(results).toHaveLength(1);
    expect(results[0].displayName).toBe('Gemma 2 9B (IT)');
  });

  it('searches by Model Family in family mode', () => {
    const results = searchEngine.search(mockModels, 'alibaba', 'family');
    expect(results).toHaveLength(1);
    expect(results[0].family).toBe('Qwen (Alibaba)');
  });

  it('returns all models when query is empty or whitespace', () => {
    expect(searchEngine.search(mockModels, '', 'name')).toHaveLength(3);
    expect(searchEngine.search(mockModels, '   ', 'name')).toHaveLength(3);
  });
});
