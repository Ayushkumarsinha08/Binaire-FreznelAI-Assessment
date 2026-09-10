import React from 'react';
import { ActionButton, Button, Flex, Text, View } from '@adobe/react-spectrum';
import Close from '@spectrum-icons/workflow/Close';
import { useModels } from '../../hooks/useModels';

export const ActiveFilters: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setPipelineFilters,
    setFamilyFilters,
    setArchitectureFilters,
    setWeightFilters,
    setSafetensorRange,
    clearAllFilters,
    availableFilters,
    hasActiveFilters,
  } = useModels();

  if (!hasActiveFilters) {
    return null;
  }

  const isRangeActive =
    filters.safetensorMin > availableFilters.safetensorMinLimit ||
    (filters.safetensorMax < availableFilters.safetensorMaxLimit &&
      filters.safetensorMax < Number.MAX_SAFE_INTEGER);

  return (
    <View
      paddingX="size-300"
      paddingY="size-150"
      backgroundColor="gray-50"
      UNSAFE_style={{ borderBottom: '1px solid #2e2e2e' }}
      UNSAFE_className="animate-fade-in"
    >
      <Flex alignItems="center" wrap gap="size-100">
        <Text UNSAFE_style={{ fontSize: '11px', fontWeight: 600, color: '#888888', textTransform: 'uppercase' }}>
          Active Filters:
        </Text>

        {/* Search Query Chip */}
        {searchQuery.trim().length > 0 && (
          <span className="filter-chip">
            <span>Query: "{searchQuery}"</span>
            <ActionButton
              isQuiet
              aria-label="Remove Search Filter"
              onPress={() => setSearchQuery('')}
              UNSAFE_style={{ minWidth: 0, width: '16px', height: '16px', padding: 0 }}
            >
              <Close size="XS" />
            </ActionButton>
          </span>
        )}

        {/* Pipelines */}
        {filters.pipelineTags.map((tag) => (
          <span key={`p-${tag}`} className="filter-chip">
            <span>Pipeline: {tag}</span>
            <ActionButton
              isQuiet
              aria-label={`Remove pipeline filter ${tag}`}
              onPress={() => setPipelineFilters(filters.pipelineTags.filter((t) => t !== tag))}
              UNSAFE_style={{ minWidth: 0, width: '16px', height: '16px', padding: 0 }}
            >
              <Close size="XS" />
            </ActionButton>
          </span>
        ))}

        {/* Families */}
        {filters.families.map((fam) => (
          <span key={`f-${fam}`} className="filter-chip">
            <span>Family: {fam}</span>
            <ActionButton
              isQuiet
              aria-label={`Remove family filter ${fam}`}
              onPress={() => setFamilyFilters(filters.families.filter((f) => f !== fam))}
              UNSAFE_style={{ minWidth: 0, width: '16px', height: '16px', padding: 0 }}
            >
              <Close size="XS" />
            </ActionButton>
          </span>
        ))}

        {/* Architecture */}
        {filters.architectureCategories.map((arch) => (
          <span key={`a-${arch}`} className="filter-chip">
            <span>Arch: {arch}</span>
            <ActionButton
              isQuiet
              aria-label={`Remove architecture filter ${arch}`}
              onPress={() =>
                setArchitectureFilters(filters.architectureCategories.filter((a) => a !== arch))
              }
              UNSAFE_style={{ minWidth: 0, width: '16px', height: '16px', padding: 0 }}
            >
              <Close size="XS" />
            </ActionButton>
          </span>
        ))}

        {/* Weights */}
        {filters.weightFormats.map((w) => (
          <span key={`w-${w}`} className="filter-chip">
            <span>Weight: {w}</span>
            <ActionButton
              isQuiet
              aria-label={`Remove weight filter ${w}`}
              onPress={() => setWeightFilters(filters.weightFormats.filter((wt) => wt !== w))}
              UNSAFE_style={{ minWidth: 0, width: '16px', height: '16px', padding: 0 }}
            >
              <Close size="XS" />
            </ActionButton>
          </span>
        ))}

        {/* Safetensors range */}
        {isRangeActive && (
          <span className="filter-chip">
            <span>
              Safetensors: [{filters.safetensorMin} - {filters.safetensorMax}]
            </span>
            <ActionButton
              isQuiet
              aria-label="Reset Safetensor Range"
              onPress={() =>
                setSafetensorRange(
                  availableFilters.safetensorMinLimit,
                  availableFilters.safetensorMaxLimit
                )
              }
              UNSAFE_style={{ minWidth: 0, width: '16px', height: '16px', padding: 0 }}
            >
              <Close size="XS" />
            </ActionButton>
          </span>
        )}

        {/* Clear All Action */}
        <Button
          variant="secondary"
          isQuiet
          onPress={clearAllFilters}
          UNSAFE_style={{ fontSize: '11px', height: '24px', padding: '0 8px' }}
        >
          Clear All
        </Button>
      </Flex>
    </View>
  );
};
