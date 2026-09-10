import React, { useState } from 'react';
import {
  ActionButton,
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogContainer,
  Divider,
  Flex,
  Heading,
  Link,
  StatusLight,
  Text,
  View,
} from '@adobe/react-spectrum';
import Copy from '@spectrum-icons/workflow/Copy';
import Checkmark from '@spectrum-icons/workflow/Checkmark';
import OpenIn from '@spectrum-icons/workflow/OpenIn';
import Code from '@spectrum-icons/workflow/Code';
import TagBold from '@spectrum-icons/workflow/TagBold';
import { useModels } from '../../hooks/useModels';

export const ModelDetails: React.FC = () => {
  const { selectedModel, setSelectedModel } = useModels();
  const [copied, setCopied] = useState(false);

  if (!selectedModel) return null;

  const handleCopyCommand = async () => {
    if (!selectedModel.cliDownloadCommand) return;
    try {
      await navigator.clipboard.writeText(selectedModel.cliDownloadCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const renderTagList = (title: string, tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    return (
      <View marginBottom="size-150">
        <Text UNSAFE_style={{ fontSize: '11px', fontWeight: 600, color: '#888888', textTransform: 'uppercase' }}>
          {title}
        </Text>
        <Flex wrap gap="size-75" marginTop="size-50">
          {tags.map((tag, idx) => (
            <span key={`${title}-${idx}-${tag}`} className="filter-chip" style={{ fontSize: '11px' }}>
              {tag}
            </span>
          ))}
        </Flex>
      </View>
    );
  };

  return (
    <DialogContainer onDismiss={() => setSelectedModel(null)}>
      <Dialog size="L">
        <Heading>
          <Flex alignItems="center" justifyContent="space-between" width="100%">
            <Flex direction="column" gap="size-25">
              <Text UNSAFE_style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                {selectedModel.displayName}
              </Text>
              <Text UNSAFE_style={{ fontSize: '12px', color: '#888888', fontFamily: 'var(--font-mono)' }}>
                {selectedModel.id}
              </Text>
            </Flex>
          </Flex>
        </Heading>

        <Divider />

        <Content>
          <Flex direction="column" gap="size-250" marginTop="size-100">
            {/* Top Quick Attributes */}
            <Flex wrap gap="size-200" alignItems="center">
              <StatusLight variant="indigo">{selectedModel.family}</StatusLight>
              <StatusLight variant="info">{selectedModel.architectureCategory}</StatusLight>
              {selectedModel.pipelineTag && (
                <StatusLight variant="positive">{selectedModel.pipelineTag}</StatusLight>
              )}
            </Flex>

            {/* Comprehensive Metadata Grid */}
            <View
              backgroundColor="gray-100"
              borderRadius="medium"
              padding="size-200"
              UNSAFE_style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                border: '1px solid #333333',
              }}
            >
              <div>
                <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase' }}>
                  Author Namespace
                </Text>
                <div style={{ fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                  {selectedModel.authorNamespace}
                </div>
              </div>

              <div>
                <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase' }}>
                  Use Case
                </Text>
                <div style={{ fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                  {selectedModel.useCase}
                </div>
              </div>

              <div>
                <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase' }}>
                  PyTorch Architecture
                </Text>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', marginTop: '2px', color: '#80caff' }}>
                  {selectedModel.pytorchArchitecture}
                </div>
              </div>

              <div>
                <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase' }}>
                  Weight Format
                </Text>
                <div style={{ fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                  {selectedModel.weightFormat}
                </div>
              </div>

              <div>
                <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase' }}>
                  Safetensor Files
                </Text>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px', color: '#68d391' }}>
                  {selectedModel.rawSafetensorDisplay} (count: {selectedModel.safetensorFileCount})
                </div>
              </div>

              <div>
                <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase' }}>
                  Repository Link
                </Text>
                <div style={{ marginTop: '2px' }}>
                  {selectedModel.repoUrl ? (
                    <Link>
                      <a
                        href={selectedModel.repoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                      >
                        Hugging Face Page <OpenIn size="XS" />
                      </a>
                    </Link>
                  ) : (
                    <Text UNSAFE_style={{ fontSize: '13px', color: '#666666' }}>Not provided</Text>
                  )}
                </div>
              </div>
            </View>

            {/* CLI Download Command */}
            {selectedModel.cliDownloadCommand && (
              <View>
                <Flex alignItems="center" justifyContent="space-between" marginBottom="size-75">
                  <Flex alignItems="center" gap="size-75">
                    <Code size="S" />
                    <Text UNSAFE_style={{ fontSize: '12px', fontWeight: 600, color: '#e0e0e0' }}>
                      CLI Download Command
                    </Text>
                  </Flex>

                  <ActionButton isQuiet onPress={handleCopyCommand}>
                    {copied ? <Checkmark size="S" /> : <Copy size="S" />}
                    <Text>{copied ? 'Copied!' : 'Copy'}</Text>
                  </ActionButton>
                </Flex>

                <div className="code-block">{selectedModel.cliDownloadCommand}</div>
              </View>
            )}

            {/* All Relevant Tags Categorized */}
            <View>
              <Flex alignItems="center" gap="size-75" marginBottom="size-100">
                <TagBold size="S" />
                <Text UNSAFE_style={{ fontSize: '12px', fontWeight: 600, color: '#e0e0e0' }}>
                  Tags & Classifications
                </Text>
              </Flex>

              <View
                backgroundColor="gray-50"
                borderRadius="medium"
                padding="size-200"
                UNSAFE_style={{ border: '1px solid #2d2d2d' }}
              >
                {renderTagList('Task Domains', selectedModel.taskDomainTags)}
                {renderTagList('Frameworks', selectedModel.frameworkTags)}
                {renderTagList('Quantization', selectedModel.quantizationTags)}
                {renderTagList('Inference Serving', selectedModel.inferenceServingTags)}
                {renderTagList('Adapter / Fine-tune', selectedModel.adapterFinetuneTags)}
                {renderTagList('Licenses', selectedModel.licenseTags)}
                {renderTagList('All HF Tags', selectedModel.allTags)}
              </View>
            </View>

            {/* Query Examples if available */}
            {selectedModel.queryExamples.length > 0 && (
              <View>
                <Text UNSAFE_style={{ fontSize: '12px', fontWeight: 600, color: '#e0e0e0', marginBottom: '6px' }}>
                  HF Query Examples
                </Text>
                {selectedModel.queryExamples.map((ex, idx) => (
                  <div key={idx} className="code-block" style={{ marginBottom: '6px' }}>
                    {ex}
                  </div>
                ))}
              </View>
            )}
          </Flex>
        </Content>

        <ButtonGroup>
          {selectedModel.repoUrl && (
            <Button
              variant="secondary"
              onPress={() => window.open(selectedModel.repoUrl, '_blank', 'noopener,noreferrer')}
            >
              <OpenIn />
              <Text>Open on Hugging Face</Text>
            </Button>
          )}
          <Button variant="primary" onPress={() => setSelectedModel(null)}>
            Close
          </Button>
        </ButtonGroup>
      </Dialog>
    </DialogContainer>
  );
};
