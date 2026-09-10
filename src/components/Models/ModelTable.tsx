import React from 'react';
import {
  ActionButton,
  Button,
  Cell,
  Column,
  Flex,
  Heading,
  IllustratedMessage,
  ProgressCircle,
  Row,
  TableBody,
  TableHeader,
  TableView,
  Text,
  View,
} from '@adobe/react-spectrum';
import Info from '@spectrum-icons/workflow/Info';
import ViewDetail from '@spectrum-icons/workflow/ViewDetail';
import { useModels } from '../../hooks/useModels';
import { ModelData } from '../../types/model';

export const ModelTable: React.FC = () => {
  const {
    filteredModels,
    isLoading,
    selectedModel,
    setSelectedModel,
    clearAllFilters,
  } = useModels();

  if (isLoading && filteredModels.length === 0) {
    return (
      <View
        height="100%"
        width="100%"
        UNSAFE_style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Flex direction="column" alignItems="center" gap="size-200">
          <ProgressCircle size="L" isIndeterminate aria-label="Loading models" />
          <Text UNSAFE_style={{ color: '#aaaaaa', fontSize: '14px' }}>
            Loading AI models from Hugging Face...
          </Text>
        </Flex>
      </View>
    );
  }

  if (filteredModels.length === 0) {
    return (
      <View
        height="100%"
        width="100%"
        padding="size-600"
        UNSAFE_style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        UNSAFE_className="animate-fade-in"
      >
        <IllustratedMessage>
          <Info />
          <Heading>No matching models</Heading>
          <Text>
            No models match your current search query or active filter criteria.
          </Text>
          <View marginTop="size-200">
            <Button variant="cta" onPress={clearAllFilters}>
              Clear All Filters
            </Button>
          </View>
        </IllustratedMessage>
      </View>
    );
  }

  const selectedKeys = selectedModel ? new Set([selectedModel.id]) : new Set([]);

  return (
    <View height="100%" width="100%" padding="size-200" UNSAFE_style={{ overflow: 'hidden' }}>
      <TableView
        aria-label="AI Model Repository Table"
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => {
          if (keys !== 'all') {
            const selectedKey = Array.from(keys)[0] as string | undefined;
            if (selectedKey) {
              const found = filteredModels.find((m) => m.id === selectedKey);
              if (found) setSelectedModel(found);
            }
          }
        }}
        density="compact"
        overflowMode="truncate"
        height="100%"
        width="100%"
      >
        <TableHeader>
          <Column key="model" minWidth={240} width="2fr">
            Model & Repository
          </Column>
          <Column key="family" width="1fr">
            Family
          </Column>
          <Column key="architecture" width="1fr">
            Architecture
          </Column>
          <Column key="pipeline" width="1.2fr">
            Pipeline
          </Column>
          <Column key="weight" width="1fr">
            Weight
          </Column>
          <Column key="safetensors" width={110} align="end">
            Safetensors
          </Column>
          <Column key="action" width={90} align="center">
            Inspect
          </Column>
        </TableHeader>

        <TableBody items={filteredModels}>
          {(model: ModelData) => (
            <Row key={model.id}>
              {/* Model Name & ID */}
              <Cell>
                <Flex direction="column" gap="size-25" UNSAFE_style={{ padding: '4px 0' }}>
                  <Text UNSAFE_style={{ fontWeight: 600, color: '#ffffff', fontSize: '13px' }}>
                    {model.displayName}
                  </Text>
                  <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', fontFamily: 'var(--font-mono)' }}>
                    {model.id}
                  </Text>
                </Flex>
              </Cell>

              {/* Family */}
              <Cell>
                <Text UNSAFE_style={{ fontSize: '12px', color: '#cccccc' }}>{model.family}</Text>
              </Cell>

              {/* Architecture */}
              <Cell>
                <Text UNSAFE_style={{ fontSize: '12px', color: '#bbbbbb' }}>
                  {model.architectureCategory}
                </Text>
              </Cell>

              {/* Pipeline Tag */}
              <Cell>
                {model.pipelineTag ? (
                  <View
                    backgroundColor="gray-200"
                    borderRadius="small"
                    paddingX="size-75"
                    paddingY="size-25"
                    UNSAFE_style={{ display: 'inline-block', fontSize: '11px', color: '#58a6ff' }}
                  >
                    {model.pipelineTag}
                  </View>
                ) : (
                  <Text UNSAFE_style={{ fontSize: '11px', color: '#666666' }}>—</Text>
                )}
              </Cell>

              {/* Weight */}
              <Cell>
                <Text UNSAFE_style={{ fontSize: '11px', color: '#aaaaaa' }}>{model.weightFormat}</Text>
              </Cell>

              {/* Safetensors */}
              <Cell>
                <Text
                  UNSAFE_style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: '12px',
                    color: model.safetensorFileCount > 0 ? '#68d391' : '#888888',
                  }}
                >
                  {model.rawSafetensorDisplay}
                </Text>
              </Cell>

              {/* Action: Select / View Details */}
              <Cell>
                <ActionButton
                  isQuiet
                  aria-label={`View details for ${model.displayName}`}
                  onPress={() => setSelectedModel(model)}
                >
                  <ViewDetail size="S" />
                </ActionButton>
              </Cell>
            </Row>
          )}
        </TableBody>
      </TableView>
    </View>
  );
};
