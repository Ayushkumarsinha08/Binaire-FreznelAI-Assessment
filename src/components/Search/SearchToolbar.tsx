import React from 'react';
import {
  Flex,
  Heading,
  Item,
  Picker,
  SearchField,
  Text,
  View,
} from '@adobe/react-spectrum';
import SortOrderDown from '@spectrum-icons/workflow/SortOrderDown';
import { useModels } from '../../hooks/useModels';
import { SearchMode, SortDirection, SortField } from '../../types/model';

export const SearchToolbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchMode,
    setSearchMode,
    sortOption,
    setSort,
    filteredModels,
    models,
  } = useModels();

  // Combine field and direction into a single composite key for the Picker
  const currentSortKey = `${sortOption.field}-${sortOption.direction}`;

  const handleSortChange = (key: React.Key) => {
    const [field, direction] = String(key).split('-') as [SortField, SortDirection];
    setSort(field, direction);
  };

  return (
    <View
      paddingX="size-300"
      paddingY="size-200"
      backgroundColor="gray-100"
      UNSAFE_style={{ borderBottom: '1px solid #2e2e2e' }}
    >
      <Flex direction="column" gap="size-150">
        {/* Title and Subtitle */}
        <Flex direction="column" gap="size-50">
          <Heading level={2} margin={0} UNSAFE_style={{ letterSpacing: '-0.5px' }}>
            Model Explorer
          </Heading>
          <Text UNSAFE_style={{ fontSize: '13px', color: '#999999' }}>
            Search, filter and compare available Hugging Face models for short-form media applications.
          </Text>
        </Flex>

        {/* Search Input Bar & Controls */}
        <Flex alignItems="center" justifyContent="space-between" wrap gap="size-200">
          {/* Search Inputs */}
          <Flex alignItems="center" gap="size-150" flex="1 1 420px">
            {/* SearchField with Debounced Filtering */}
            <SearchField
              label="Search Query"
              labelPosition="side"
              aria-label="Search models"
              placeholder={
                searchMode === 'name'
                  ? 'Search by model name, ID, or repo...'
                  : 'Search by family (e.g. Llama, Qwen, Mistral)...'
              }
              value={searchQuery}
              onChange={setSearchQuery}
              width="100%"
            />

            {/* Search Mode Selector */}
            <Picker
              label="Mode"
              labelPosition="side"
              aria-label="Search Mode"
              selectedKey={searchMode}
              onSelectionChange={(key) => setSearchMode(key as SearchMode)}
              width="size-2000"
            >
              <Item key="name">Model Name</Item>
              <Item key="family">Model Family</Item>
            </Picker>
          </Flex>

          {/* Results Count & Sorting Selector */}
          <Flex alignItems="center" gap="size-200" wrap>
            <Text UNSAFE_style={{ fontSize: '13px', color: '#aaaaaa', whiteSpace: 'nowrap' }}>
              Showing <strong>{filteredModels.length}</strong> of <strong>{models.length}</strong> models
            </Text>

            <Flex alignItems="center" gap="size-100">
              <SortOrderDown size="S" />
              <Picker
                aria-label="Sort models by"
                selectedKey={currentSortKey}
                onSelectionChange={(key) => {
                  if (key) handleSortChange(key);
                }}
                width="size-2800"
              >
                <Item key="name-asc">Model Name (A → Z)</Item>
                <Item key="name-desc">Model Name (Z → A)</Item>
                <Item key="safetensors-asc">Safetensor Files (Low → High)</Item>
                <Item key="safetensors-desc">Safetensor Files (High → Low)</Item>
              </Picker>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </View>
  );
};
