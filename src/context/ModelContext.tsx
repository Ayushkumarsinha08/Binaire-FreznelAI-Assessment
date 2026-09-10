import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { modelFilterEngine } from '../filters/ModelFilterEngine';
import { useDebounce } from '../hooks/useDebounce';
import { modelRepository } from '../models/ModelRepository';
import { networkService } from '../offline/NetworkService';
import { modelSearchEngine } from '../search/ModelSearchEngine';
import { modelSortEngine } from '../sorting/ModelSortEngine';
import {
  AvailableFilterOptions,
  CacheMetadata,
  FilterState,
  ModelData,
  SearchMode,
  SortDirection,
  SortField,
  SortOption,
} from '../types/model';
import { throttle } from '../utils/throttle';

interface ModelContextType {
  // Raw Data & Metadata
  models: ModelData[];
  metadata: CacheMetadata | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  isOnline: boolean;
  lastUpdated: string | null;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;

  // Filters
  filters: FilterState;
  availableFilters: AvailableFilterOptions;
  setPipelineFilters: (pipelines: string[]) => void;
  setFamilyFilters: (families: string[]) => void;
  setArchitectureFilters: (archs: string[]) => void;
  setWeightFilters: (weights: string[]) => void;
  setSafetensorRange: (min: number, max: number) => void;
  clearFilterCategory: (category: keyof FilterState) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;

  // Sorting
  sortOption: SortOption;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  setSort: (field: SortField, direction: SortDirection) => void;

  // Selection
  selectedModel: ModelData | null;
  setSelectedModel: (model: ModelData | null) => void;

  // Filtered & Sorted derived view
  filteredModels: ModelData[];

  // Actions
  refreshModels: (force?: boolean) => void;
}

const defaultFilterState: FilterState = {
  pipelineTags: [],
  families: [],
  architectureCategories: [],
  weightFormats: [],
  safetensorMin: 0,
  safetensorMax: Number.MAX_SAFE_INTEGER,
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core Data States
  const [models, setModels] = useState<ModelData[]>([]);
  const [metadata, setMetadata] = useState<CacheMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() => networkService.getStatus());
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  // Debounce search query by 300ms to eliminate unnecessary keystroke filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter States
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

  // Sort State
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'name',
    direction: 'asc',
  });

  // Selection State
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);

  // In-flight refresh lock ref
  const inFlightRefreshRef = useRef<boolean>(false);

  /**
   * Background Refresh implementation
   */
  const performRefresh = useCallback(async (isManual = false) => {
    if (inFlightRefreshRef.current) {
      return;
    }

    inFlightRefreshRef.current = true;
    setIsRefreshing(true);
    if (isManual) {
      setError(null);
    }

    try {
      const result = await modelRepository.fetchAndCacheFreshModels();
      setModels(result.models);
      setMetadata(result.metadata);
      setLastUpdated(result.metadata.fetchedAt);
      setError(null);
      networkService.reportRequestSuccess();
    } catch (err: any) {
      // If we already have models in state (from cache), keep them and display recoverable notification
      if (models.length > 0) {
        setError(`Unable to refresh live data (${err.message || 'Network error'}). Showing your cached dataset.`);
      } else {
        setError(err.message || 'Failed to fetch models.');
      }
    } finally {
      setIsRefreshing(false);
      inFlightRefreshRef.current = false;
    }
  }, [models.length]);

  /**
   * Throttled manual refresh action (2000ms cooldown)
   * Prevents API and IndexedDB write contention caused by rapid clicks
   */
  const throttledRefresh = useMemo(() => {
    return throttle(() => {
      performRefresh(true);
    }, 2000);
  }, [performRefresh]);

  const refreshModels = useCallback(
    (_force = false) => {
      throttledRefresh();
    },
    [throttledRefresh]
  );

  /**
   * Initial App Startup Flow:
   * 1. Check IndexedDB cache.
   * 2. If valid cached data exists, render immediately for instant startup.
   * 3. If online, initiate non-blocking background refresh to fetch fresh data.
   * 4. If offline and no cache, surface actionable empty state.
   */
  useEffect(() => {
    let isCancelled = false;

    async function initializeData() {
      setIsLoading(true);

      try {
        // Step 1: Load from IndexedDB
        const cached = await modelRepository.getCachedData();
        if (cached && !isCancelled) {
          setModels(cached.models);
          setMetadata(cached.metadata);
          setLastUpdated(cached.metadata.fetchedAt);
          setIsLoading(false);
        }

        // Step 2: If online, background refresh
        if (networkService.getStatus()) {
          performRefresh(false).finally(() => {
            if (!isCancelled) {
              setIsLoading(false);
            }
          });
        } else {
          if (!cached && !isCancelled) {
            setError('You are offline and no cached model data is available yet.');
          }
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Failed to initialize data.');
          setIsLoading(false);
        }
      }
    }

    initializeData();

    return () => {
      isCancelled = true;
    };
  }, [performRefresh]);

  /**
   * Subscribe to network transitions:
   * When returning from OFFLINE -> ONLINE, automatically trigger background refresh.
   */
  useEffect(() => {
    const unsubscribe = networkService.subscribe((online) => {
      setIsOnline(online);
      if (online) {
        // Returned online! Refresh dataset in the background
        performRefresh(false);
      }
    });

    return unsubscribe;
  }, [performRefresh]);

  /**
   * Dynamic Filter Options derived from loaded models
   */
  const availableFilters: AvailableFilterOptions = useMemo(() => {
    return modelFilterEngine.extractAvailableFilters(models);
  }, [models]);

  /**
   * Filter State Setters
   */
  const setPipelineFilters = useCallback((pipelineTags: string[]) => {
    setFilters((prev) => ({ ...prev, pipelineTags }));
  }, []);

  const setFamilyFilters = useCallback((families: string[]) => {
    setFilters((prev) => ({ ...prev, families }));
  }, []);

  const setArchitectureFilters = useCallback((architectureCategories: string[]) => {
    setFilters((prev) => ({ ...prev, architectureCategories }));
  }, []);

  const setWeightFilters = useCallback((weightFormats: string[]) => {
    setFilters((prev) => ({ ...prev, weightFormats }));
  }, []);

  const setSafetensorRange = useCallback((safetensorMin: number, safetensorMax: number) => {
    setFilters((prev) => ({ ...prev, safetensorMin, safetensorMax }));
  }, []);

  const clearFilterCategory = useCallback((category: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [category]: defaultFilterState[category],
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilterState);
    setSearchQuery('');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.pipelineTags.length > 0 ||
      filters.families.length > 0 ||
      filters.architectureCategories.length > 0 ||
      filters.weightFormats.length > 0 ||
      filters.safetensorMin > 0 ||
      filters.safetensorMax < Number.MAX_SAFE_INTEGER ||
      searchQuery.trim().length > 0
    );
  }, [filters, searchQuery]);

  /**
   * Sorting Setters
   */
  const setSortField = useCallback((field: SortField) => {
    setSortOption((prev) => ({ ...prev, field }));
  }, []);

  const setSortDirection = useCallback((direction: SortDirection) => {
    setSortOption((prev) => ({ ...prev, direction }));
  }, []);

  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortOption({ field, direction });
  }, []);

  /**
   * DERIVED FILTERED & SORTED MODELS
   * Memoized with pure functional engines (ModelSearchEngine, ModelFilterEngine, ModelSortEngine)
   */
  const filteredModels = useMemo(() => {
    // 1. Search
    const searched = modelSearchEngine.search(models, debouncedSearchQuery, searchMode);

    // 2. Filter
    const filtered = modelFilterEngine.applyFilters(searched, filters);

    // 3. Sort
    return modelSortEngine.sort(filtered, sortOption.field, sortOption.direction);
  }, [models, debouncedSearchQuery, searchMode, filters, sortOption]);

  return (
    <ModelContext.Provider
      value={{
        models,
        metadata,
        isLoading,
        isRefreshing,
        error,
        isOnline,
        lastUpdated,
        searchQuery,
        setSearchQuery,
        searchMode,
        setSearchMode,
        filters,
        availableFilters,
        setPipelineFilters,
        setFamilyFilters,
        setArchitectureFilters,
        setWeightFilters,
        setSafetensorRange,
        clearFilterCategory,
        clearAllFilters,
        hasActiveFilters,
        sortOption,
        setSortField,
        setSortDirection,
        setSort,
        selectedModel,
        setSelectedModel,
        filteredModels,
        refreshModels,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export { ModelContext };
export type { ModelContextType };
