import React, { useState } from 'react';
import {
  Button,
  Divider,
  Flex,
  Form,
  Heading,
  InlineAlert,
  ProgressCircle,
  StatusLight,
  Text,
  TextField,
  View,
} from '@adobe/react-spectrum';
import Key from '@spectrum-icons/workflow/Key';
import LockClosed from '@spectrum-icons/workflow/LockClosed';
import User from '@spectrum-icons/workflow/User';
import { useAuth } from '../../hooks/useAuth';

export const AuthScreen: React.FC = () => {
  const { isConfigured, missingConfigKeys, signIn, signUp, isLoading, authError, clearError } =
    useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalError('Please enter both your email and password.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch {
      // Error handled in AuthContext
    }
  };

  return (
    <View
      backgroundColor="gray-100"
      height="100vh"
      width="100vw"
      UNSAFE_className="animate-fade-in"
      UNSAFE_style={{ overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <View
        backgroundColor="gray-50"
        borderRadius="medium"
        borderWidth="thin"
        borderColor="dark"
        width={{ base: '90%', M: '880px' }}
        UNSAFE_style={{
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        {/* Left Branding Panel */}
        <View
          backgroundColor="gray-200"
          padding="size-400"
          UNSAFE_style={{
            borderRight: '1px solid #333333',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Flex direction="column" gap="size-200">
            <Flex alignItems="center" gap="size-150">
              <View
                backgroundColor="blue-600"
                borderRadius="small"
                padding="size-100"
                UNSAFE_style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Key size="S" />
              </View>
              <Heading level={2} margin={0} UNSAFE_style={{ letterSpacing: '-0.5px' }}>
                Binaire
              </Heading>
            </Flex>

            <Text UNSAFE_style={{ fontSize: '13px', color: '#999999', lineHeight: '1.5' }}>
              Short-form media desktop AI model browser and metadata exploration engine.
            </Text>

            <Divider size="S" marginY="size-200" />

            <Flex direction="column" gap="size-150">
              <Flex alignItems="center" gap="size-100">
                <StatusLight variant="positive">Direct Hugging Face API integration</StatusLight>
              </Flex>
              <Flex alignItems="center" gap="size-100">
                <StatusLight variant="info">IndexedDB atomic offline cache</StatusLight>
              </Flex>
              <Flex alignItems="center" gap="size-100">
                <StatusLight variant="neutral">Pure Promise-chaining async flow</StatusLight>
              </Flex>
              <Flex alignItems="center" gap="size-100">
                <StatusLight variant="indigo">Adobe React Spectrum UI</StatusLight>
              </Flex>
            </Flex>
          </Flex>

          <View marginTop="size-400">
            <Text UNSAFE_style={{ fontSize: '11px', color: '#666666' }}>
              Javascript Developer Assessment — Binaire Private Limited
            </Text>
          </View>
        </View>

        {/* Right Authentication Form / Config Guidance */}
        <View padding="size-400" UNSAFE_style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {!isConfigured ? (
            /* Strict Firebase Configuration Guidance */
            <Flex direction="column" gap="size-200">
              <Heading level={3} margin={0} UNSAFE_style={{ color: '#e6e6e6' }}>
                Firebase Setup Required
              </Heading>
              <Text UNSAFE_style={{ fontSize: '13px', color: '#bbbbbb', lineHeight: '1.4' }}>
                This application strictly enforces <strong>Firebase Authentication</strong> as required by the assessment specification. No mock or bypass mode is permitted.
              </Text>

              <InlineAlert variant="info">
                <Heading>Environment Configuration</Heading>
                <Text>
                  Please add your Firebase Web App credentials to your <code>.env</code> file:
                </Text>
              </InlineAlert>

              <View
                backgroundColor="gray-100"
                borderRadius="small"
                padding="size-150"
                UNSAFE_className="code-block"
                UNSAFE_style={{ fontSize: '11px', maxHeight: '140px', overflowY: 'auto' }}
              >
                {missingConfigKeys.map((key) => (
                  <div key={key}>{key}=your_value_here</div>
                ))}
              </View>

              <Text UNSAFE_style={{ fontSize: '12px', color: '#888888' }}>
                Refer to <code>.env.example</code> for template keys, then restart the development server.
              </Text>
            </Flex>
          ) : (
            /* Live Firebase Authentication Form */
            <Flex direction="column" gap="size-200">
              <Flex direction="column" gap="size-50">
                <Heading level={3} margin={0}>
                  {mode === 'signin' ? 'Sign In to Model Explorer' : 'Create an Account'}
                </Heading>
                <Text UNSAFE_style={{ fontSize: '13px', color: '#999999' }}>
                  {mode === 'signin'
                    ? 'Enter your Firebase credentials to access the explorer.'
                    : 'Register with Firebase Authentication to get started.'}
                </Text>
              </Flex>

              {(localError || authError) && (
                <InlineAlert variant="negative">
                  <Heading>Authentication Notice</Heading>
                  <Text>{localError || authError}</Text>
                </InlineAlert>
              )}

              <Form onSubmit={handleSubmit}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoFocus
                  isRequired
                  width="100%"
                  icon={<User />}
                />

                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  isRequired
                  width="100%"
                  icon={<LockClosed />}
                />

                <View marginTop="size-200">
                  <Button
                    variant="cta"
                    type="submit"
                    isDisabled={isLoading}
                    width="100%"
                  >
                    {isLoading ? (
                      <Flex alignItems="center" justifyContent="center" gap="size-100">
                        <ProgressCircle size="S" isIndeterminate />
                        <Text>Authenticating...</Text>
                      </Flex>
                    ) : mode === 'signin' ? (
                      'Sign In'
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </View>
              </Form>

              <Divider size="S" marginY="size-150" />

              <Flex justifyContent="center" alignItems="center" gap="size-100">
                <Text UNSAFE_style={{ fontSize: '13px', color: '#888888' }}>
                  {mode === 'signin' ? "Don't have an account?" : 'Already registered?'}
                </Text>
                <Button
                  variant="secondary"
                  isQuiet
                  onPress={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setLocalError(null);
                    clearError();
                  }}
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </Button>
              </Flex>
            </Flex>
          )}
        </View>
      </View>
    </View>
  );
};
