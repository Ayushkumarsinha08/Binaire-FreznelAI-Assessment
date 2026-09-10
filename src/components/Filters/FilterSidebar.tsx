import React, { useState } from 'react';
import {
  ActionButton,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  Heading,
  RangeSlider,
  Text,
  View,
} from '@adobe/react-spectrum';
import ChevronDown from '@spectrum-icons/workflow/ChevronDown';
import ChevronRight from '@spectrum-icons/workflow/ChevronRight';
import Filter from '@spectrum-icons/workflow/Filter';
import Refresh from '@spectrum-icons/workflow/Refresh';
import { useModels } from '../../hooks/useModels';

interface FilterSectionProps {
  title: string;
  count: number;
  isOpenDefault?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<FilterSectionProps> = ({
  title,
  count,
  isOpenDefault = true,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <View marginBottom="size-200">
      <ActionButton
        isQuiet
        width="100%"
        onPress={() => setIsOpen(!isOpen)}
        UNSAFE_style={{ justifyContent: 'space-between', paddingLeft: 0, paddingRight: 0 }}
      >
        <Flex alignItems="center" gap="size-100">
          {isOpen ? <ChevronDown size="S" /> : <ChevronRight size="S" />}
          <Text UNSAFE_style={{ fontWeight: 600, fontSize: '13px', color: '#e0e0e0' }}>{title}</Text>
        </Flex>
        {count > 0 && (
          <View
            backgroundColor="blue-600"
            borderRadius="small"
            paddingX="size-75"
            paddingY="size-25"
            UNSAFE_style={{ fontSize: '10px', color: '#ffffff', borderRadius: '10px' }}
          >
            {count}
          </View>
        )}
      </ActionButton>

      {isOpen && <View marginTop="size-100" paddingStart="size-200">{children}</View>}
    </View>
  );
};

export const FilterSidebar: React.FC = () => {
  const {
    filters,
    availableFilters,
    setPipelineFilters,
    setFamilyFilters,
    setArchitectureFilters,
    setWeightFilters,
    setSafetensorRange,
    clearAllFilters,
    hasActiveFilters,
  } = useModels();

  const minLimit = availableFilters.safetensorMinLimit;
  const maxLimit = availableFilters.safetensorMaxLimit > minLimit ? availableFilters.safetensorMaxLimit : 500;

  const currentMin = Math.max(minLimit, filters.safetensorMin);
  const currentMax = Math.min(
    maxLimit,
    filters.safetensorMax === Number.MAX_SAFE_INTEGER ? maxLimit : filters.safetensorMax
  );

  return (
    <View
      padding="size-250"
      UNSAFE_className="sidebar-panel"
    >
      <Flex direction="column" gap="size-200">
        {/* Header with Title and Clear Button */}
        <Flex alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap="size-100">
            <Filter size="S" />
            <Heading level={4} margin={0}>
              Filters
            </Heading>
          </Flex>

          {hasActiveFilters && (
            <Button
              variant="secondary"
              isQuiet
              onPress={clearAllFilters}
              UNSAFE_style={{ fontSize: '12px' }}
            >
              <Refresh size="XS" />
              <Text>Reset</Text>
            </Button>
          )}
        </Flex>

        <Divider size="S" />

        {/* 1. Pipeline Tags */}
        <CollapsibleSection
          title="Pipeline Tags"
          count={filters.pipelineTags.length}
          isOpenDefault={true}
        >
          <CheckboxGroup
            aria-label="Filter by Pipeline Tags"
            value={filters.pipelineTags}
            onChange={setPipelineFilters}
          >
            {availableFilters.pipelineTags.map(({ name, count }) => (
              <Checkbox key={name} value={name}>
                <Flex alignItems="center" justifyContent="space-between" width="100%">
                  <Text UNSAFE_style={{ fontSize: '12px' }}>{name}</Text>
                  <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', marginLeft: '8px' }}>
                    ({count})
                  </Text>
                </Flex>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </CollapsibleSection>

        <Divider size="S" />

        {/* 2. Family Tags */}
        <CollapsibleSection
          title="Model Family"
          count={filters.families.length}
          isOpenDefault={true}
        >
          <CheckboxGroup
            aria-label="Filter by Model Family"
            value={filters.families}
            onChange={setFamilyFilters}
          >
            {availableFilters.families.map(({ name, count }) => (
              <Checkbox key={name} value={name}>
                <Flex alignItems="center" justifyContent="space-between" width="100%">
                  <Text UNSAFE_style={{ fontSize: '12px' }}>{name}</Text>
                  <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', marginLeft: '8px' }}>
                    ({count})
                  </Text>
                </Flex>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </CollapsibleSection>

        <Divider size="S" />

        {/* 3. Architecture Category */}
        <CollapsibleSection
          title="Architecture"
          count={filters.architectureCategories.length}
          isOpenDefault={false}
        >
          <CheckboxGroup
            aria-label="Filter by Architecture"
            value={filters.architectureCategories}
            onChange={setArchitectureFilters}
          >
            {availableFilters.architectureCategories.map(({ name, count }) => (
              <Checkbox key={name} value={name}>
                <Flex alignItems="center" justifyContent="space-between" width="100%">
                  <Text UNSAFE_style={{ fontSize: '12px' }}>{name}</Text>
                  <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', marginLeft: '8px' }}>
                    ({count})
                  </Text>
                </Flex>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </CollapsibleSection>

        <Divider size="S" />

        {/* 4. Weight Formats */}
        <CollapsibleSection
          title="Weight Format"
          count={filters.weightFormats.length}
          isOpenDefault={false}
        >
          <CheckboxGroup
            aria-label="Filter by Weight Format"
            value={filters.weightFormats}
            onChange={setWeightFilters}
          >
            {availableFilters.weightFormats.map(({ name, count }) => (
              <Checkbox key={name} value={name}>
                <Flex alignItems="center" justifyContent="space-between" width="100%">
                  <Text UNSAFE_style={{ fontSize: '12px' }}>{name}</Text>
                  <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', marginLeft: '8px' }}>
                    ({count})
                  </Text>
                </Flex>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </CollapsibleSection>

        <Divider size="S" />

        {/* 5. Safetensor File Count Range */}
        <CollapsibleSection
          title="Safetensor Files"
          count={
            filters.safetensorMin > minLimit || filters.safetensorMax < maxLimit ? 1 : 0
          }
          isOpenDefault={true}
        >
          <View marginTop="size-100">
            <RangeSlider
              label="File Count Bounds"
              minValue={minLimit}
              maxValue={maxLimit}
              value={{ start: currentMin, end: currentMax }}
              onChange={({ start, end }) => setSafetensorRange(start, end)}
              width="100%"
            />
            <Flex justifyContent="space-between" marginTop="size-100">
              <Text UNSAFE_style={{ fontSize: '11px', color: '#888888' }}>
                Min: <strong>{currentMin}</strong>
              </Text>
              <Text UNSAFE_style={{ fontSize: '11px', color: '#888888' }}>
                Max: <strong>{currentMax}</strong>
              </Text>
            </Flex>
          </View>
        </CollapsibleSection>
      </Flex>
    </View>
  );
};
