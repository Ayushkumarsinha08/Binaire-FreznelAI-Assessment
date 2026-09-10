/**
 * Raw model entity as delivered by https://binaire.app/hf-models-api.json
 */
export interface RawHfTags {
  pipeline_tag?: string | null;
  framework?: string[] | string | null;
  license?: string[] | string | null;
  quantization?: string[] | string | null;
  architecture?: string[] | string | null;
  task_domain?: string[] | string | null;
  modality?: string[] | string | null;
  application?: string[] | string | null;
  adapter_finetune?: string[] | string | null;
  safety_policy?: string[] | string | null;
  inference_serving?: string[] | string | null;
  all_tags?: string[] | string | null;
}

export interface RawModelRecord {
  id?: string | null;
  display_name?: string | null;
  huggingface_repo?: string | null;
  repo_url?: string | null;
  family?: string | null;
  author_namespace?: string | null;
  architecture_category?: string | null;
  use_case?: string | null;
  pytorch_architecture?: string | null;
  weight_format?: string | null;
  safetensor_file_count?: string | number | null;
  cli_download_command?: string | null;
  hf_tags?: RawHfTags | null;
  hf_query_examples?: string[] | string | null;
}

export interface RawApiResponse {
  models: RawModelRecord[];
}

/**
 * Normalized model entity used throughout the application.
 * Precomputes search index fields for high-performance zero-recalculation search.
 */
export interface ModelData {
  id: string;
  displayName: string;
  huggingfaceRepo: string;
  repoUrl: string;
  family: string;
  authorNamespace: string;
  architectureCategory: string;
  useCase: string;
  pytorchArchitecture: string;
  weightFormat: string;
  safetensorFileCount: number;
  rawSafetensorDisplay: string;
  cliDownloadCommand: string;
  pipelineTag: string;
  frameworkTags: string[];
  licenseTags: string[];
  quantizationTags: string[];
  architectureTags: string[];
  taskDomainTags: string[];
  modalityTags: string[];
  applicationTags: string[];
  adapterFinetuneTags: string[];
  safetyPolicyTags: string[];
  inferenceServingTags: string[];
  allTags: string[];
  queryExamples: string[];
  
  // Pre-indexed lowercase search strings for high performance
  searchText: string;
  familySearchText: string;
}

export type SearchMode = 'name' | 'family';

export type SortField = 'name' | 'safetensors';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

export interface FilterState {
  pipelineTags: string[];
  families: string[];
  architectureCategories: string[];
  weightFormats: string[];
  safetensorMin: number;
  safetensorMax: number;
}

export interface AvailableFilterOptions {
  pipelineTags: { name: string; count: number }[];
  families: { name: string; count: number }[];
  architectureCategories: { name: string; count: number }[];
  weightFormats: { name: string; count: number }[];
  safetensorMinLimit: number;
  safetensorMaxLimit: number;
}

export interface CacheMetadata {
  key: string;
  status: 'valid' | 'corrupt' | 'staging';
  fetchedAt: string;
  modelCount: number;
  schemaVersion: number;
  checksum: string;
}

export interface CachedDataset {
  metadata: CacheMetadata;
  models: ModelData[];
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}
