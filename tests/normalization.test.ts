import { describe, expect, it } from 'vitest';
import {
  normalizeArray,
  normalizeModel,
  normalizeModels,
  parseSafetensorCount,
} from '../src/utils/normalization';

describe('Normalization Utility', () => {
  describe('normalizeArray', () => {
    it('handles arrays, strings, nulls and empty values safely', () => {
      expect(normalizeArray(['pytorch', '  transformers '])).toEqual(['pytorch', 'transformers']);
      expect(normalizeArray('single-tag')).toEqual(['single-tag']);
      expect(normalizeArray('')).toEqual([]);
      expect(normalizeArray(null)).toEqual([]);
      expect(normalizeArray(undefined)).toEqual([]);
      expect(normalizeArray(['', null, 'valid'])).toEqual(['valid']);
    });
  });

  describe('parseSafetensorCount', () => {
    it('parses numeric values and strings properly', () => {
      expect(parseSafetensorCount(42)).toBe(42);
      expect(parseSafetensorCount('201')).toBe(201);
      expect(parseSafetensorCount('  128 ')).toBe(128);
    });

    it('safely handles non-numeric values such as "TBD"', () => {
      expect(parseSafetensorCount('TBD')).toBe(0);
      expect(parseSafetensorCount(null)).toBe(0);
      expect(parseSafetensorCount(undefined)).toBe(0);
      expect(parseSafetensorCount(-5)).toBe(0);
    });
  });

  describe('normalizeModel', () => {
    it('defensively normalizes complete and incomplete models', () => {
      const raw = {
        id: 'meta-llama/Llama-3.1-8B',
        display_name: 'Llama 3.1 8B (Instruct)',
        safetensor_file_count: 'TBD',
        hf_tags: {
          pipeline_tag: 'text-generation',
          framework: ['pytorch', 'safetensors'],
        },
      };

      const normalized = normalizeModel(raw);
      expect(normalized.id).toBe('meta-llama/Llama-3.1-8B');
      expect(normalized.displayName).toBe('Llama 3.1 8B (Instruct)');
      expect(normalized.safetensorFileCount).toBe(0);
      expect(normalized.rawSafetensorDisplay).toBe('TBD');
      expect(normalized.authorNamespace).toBe('meta-llama');
      expect(normalized.pipelineTag).toBe('text-generation');
      expect(normalized.frameworkTags).toEqual(['pytorch', 'safetensors']);
      expect(normalized.searchText).toContain('llama-3.1-8b');
      expect(normalized.searchText).toContain('meta-llama');
    });

    it('handles completely empty or missing optional fields without crashing', () => {
      const emptyRaw = {};
      const normalized = normalizeModel(emptyRaw);
      expect(normalized.displayName).toBe('Unnamed Model');
      expect(normalized.family).toBe('Unknown');
      expect(normalized.safetensorFileCount).toBe(0);
      expect(normalized.frameworkTags).toEqual([]);
    });
  });

  describe('normalizeModels', () => {
    it('filters out non-object and completely empty records', () => {
      const list = [null, undefined, 'string', { id: 'valid-1' }, { id: '', display_name: '' }];
      const normalized = normalizeModels(list);
      expect(normalized).toHaveLength(1);
      expect(normalized[0].id).toBe('valid-1');
    });
  });
});
