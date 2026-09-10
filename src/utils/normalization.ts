import { ModelData, RawModelRecord } from '../types/model';

/**
 * Defensively normalizes any value (array, string, null, undefined) into a clean string array.
 * Trims whitespace and filters out empty elements.
 */
export function normalizeArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string | number => item !== null && item !== undefined)
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }
  return [String(value).trim()];
}

/**
 * Safely parses safetensor_file_count to an integer.
 * Handles strings like "201", numbers like 128, and non-numeric values like "TBD" (parsed as 0).
 */
export function parseSafetensorCount(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Defensively normalizes a raw API model record into a strongly-typed, indexed ModelData object.
 */
export function normalizeModel(raw: RawModelRecord): ModelData {
  const id = String(raw.id ?? '').trim();
  const displayName = String(raw.display_name ?? raw.id ?? 'Unnamed Model').trim();
  const huggingfaceRepo = String(raw.huggingface_repo ?? raw.id ?? '').trim();
  const repoUrl = String(raw.repo_url ?? (huggingfaceRepo ? `https://huggingface.co/${huggingfaceRepo}` : '')).trim();
  const family = String(raw.family ?? 'Unknown').trim();
  const authorNamespace = String(raw.author_namespace ?? (id.includes('/') ? id.split('/')[0] : 'Community')).trim();
  const architectureCategory = String(raw.architecture_category ?? 'Unknown').trim();
  const useCase = String(raw.use_case ?? 'General AI').trim();
  const pytorchArchitecture = String(raw.pytorch_architecture ?? 'Unknown').trim();
  const weightFormat = String(raw.weight_format ?? 'Standard').trim();

  const rawSafetensorDisplay = raw.safetensor_file_count !== null && raw.safetensor_file_count !== undefined
    ? String(raw.safetensor_file_count).trim()
    : '0';
  const safetensorFileCount = parseSafetensorCount(raw.safetensor_file_count);

  const cliDownloadCommand = String(
    raw.cli_download_command ??
    (huggingfaceRepo ? `huggingface-cli download ${huggingfaceRepo}` : '')
  ).trim();

  const tags = raw.hf_tags ?? {};
  const pipelineTag = String(tags.pipeline_tag ?? '').trim();
  const frameworkTags = normalizeArray(tags.framework);
  const licenseTags = normalizeArray(tags.license);
  const quantizationTags = normalizeArray(tags.quantization);
  const architectureTags = normalizeArray(tags.architecture);
  const taskDomainTags = normalizeArray(tags.task_domain);
  const modalityTags = normalizeArray(tags.modality);
  const applicationTags = normalizeArray(tags.application);
  const adapterFinetuneTags = normalizeArray(tags.adapter_finetune);
  const safetyPolicyTags = normalizeArray(tags.safety_policy);
  const inferenceServingTags = normalizeArray(tags.inference_serving);
  const allTags = normalizeArray(tags.all_tags);
  const queryExamples = normalizeArray(raw.hf_query_examples);

  // Pre-indexed search text in lowercase for O(1) string checks during filtering
  const searchText = `${id} ${displayName} ${huggingfaceRepo} ${authorNamespace}`.toLowerCase();
  const familySearchText = family.toLowerCase();

  return {
    id,
    displayName,
    huggingfaceRepo,
    repoUrl,
    family,
    authorNamespace,
    architectureCategory,
    useCase,
    pytorchArchitecture,
    weightFormat,
    safetensorFileCount,
    rawSafetensorDisplay,
    cliDownloadCommand,
    pipelineTag,
    frameworkTags,
    licenseTags,
    quantizationTags,
    architectureTags,
    taskDomainTags,
    modalityTags,
    applicationTags,
    adapterFinetuneTags,
    safetyPolicyTags,
    inferenceServingTags,
    allTags,
    queryExamples,
    searchText,
    familySearchText,
  };
}

/**
 * Normalizes an entire array of raw models, filtering out completely invalid records.
 */
export function normalizeModels(rawModels: unknown[]): ModelData[] {
  if (!Array.isArray(rawModels)) return [];
  return rawModels
    .filter((m): m is RawModelRecord => typeof m === 'object' && m !== null)
    .map(normalizeModel)
    .filter((m) => m.id.length > 0 || m.displayName.length > 0);
}
