import React from 'react';
import {
  ActionButton,
  Divider,
  Flex,
  Heading,
  ProgressCircle,
  StatusLight,
  Text,
  Tooltip,
  TooltipTrigger,
  View,
} from '@adobe/react-spectrum';
import Refresh from '@spectrum-icons/workflow/Refresh';
import LogOut from '@spectrum-icons/workflow/LogOut';
import User from '@spectrum-icons/workflow/User';
import DevicePhone from '@spectrum-icons/workflow/DevicePhone';
import { useAuth } from '../../hooks/useAuth';
import { useModels } from '../../hooks/useModels';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, signOut } = useAuth();
  const { isOnline, isRefreshing, refreshModels, lastUpdated, metadata } = useModels();

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <View
      backgroundColor="gray-100"
      paddingX="size-300"
      paddingY="size-150"
      UNSAFE_className="app-header"
    >
      <Flex alignItems="center" justifyContent="space-between" width="100%">
        {/* Left: Branding & Model Explorer Title */}
        <Flex alignItems="center" gap="size-200">
          {onToggleSidebar && (
            <ActionButton
              isQuiet
              aria-label="Toggle Filters Sidebar"
              onPress={onToggleSidebar}
              UNSAFE_style={{ display: 'none' }}
              UNSAFE_className="sidebar-toggle-btn"
            >
              <DevicePhone />
            </ActionButton>
          )}

          <Flex alignItems="center" gap="size-150">
            <View
              backgroundColor="blue-600"
              borderRadius="small"
              padding="size-50"
              UNSAFE_style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              B
            </View>
            <Flex direction="column">
              <Heading level={4} margin={0} UNSAFE_style={{ letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Binaire
              </Heading>
              <Text UNSAFE_style={{ fontSize: '11px', color: '#888888', lineHeight: 1 }}>
                Model Explorer
              </Text>
            </Flex>
          </Flex>
        </Flex>

        {/* Center: Online/Offline Connection Status & Cache Metadata */}
        <Flex alignItems="center" gap="size-300">
          <Flex alignItems="center" gap="size-100">
            <StatusLight
              variant={isOnline ? 'positive' : 'negative'}
              UNSAFE_className={isOnline ? 'online-pulse' : undefined}
            >
              {isOnline ? 'Connected' : 'Offline — using cached data'}
            </StatusLight>
          </Flex>

          {formattedTime && (
            <Text UNSAFE_style={{ fontSize: '11px', color: '#777777', display: 'none' }} UNSAFE_className="header-timestamp">
              Cached: {formattedTime} ({metadata?.modelCount ?? 0} models)
            </Text>
          )}
        </Flex>

        {/* Right: Actions, Throttled Refresh, Authenticated User & Sign Out */}
        <Flex alignItems="center" gap="size-200">
          {/* Refresh ActionButton with Tooltip */}
          <TooltipTrigger delay={400}>
            <ActionButton
              isQuiet
              aria-label="Refresh Models from API"
              isDisabled={isRefreshing}
              onPress={() => refreshModels(true)}
            >
              {isRefreshing ? (
                <ProgressCircle size="S" isIndeterminate aria-label="Refreshing data" />
              ) : (
                <Refresh />
              )}
              <Text>{isRefreshing ? 'Refreshing...' : 'Refresh'}</Text>
            </ActionButton>
            <Tooltip>
              {isOnline
                ? 'Download fresh model dataset from remote API (Throttled)'
                : 'Offline: Refresh will activate when network reconnects'}
            </Tooltip>
          </TooltipTrigger>

          <Divider orientation="vertical" size="S" />

          {/* User Email & Sign Out */}
          {user && (
            <Flex alignItems="center" gap="size-150">
              <Flex alignItems="center" gap="size-75">
                <User size="S" />
                <Text UNSAFE_style={{ fontSize: '12px', fontWeight: 500, color: '#cccccc' }}>
                  {user.email || user.displayName}
                </Text>
              </Flex>

              <TooltipTrigger delay={400}>
                <ActionButton
                  isQuiet
                  aria-label="Sign Out"
                  onPress={signOut}
                >
                  <LogOut />
                  <Text>Sign Out</Text>
                </ActionButton>
                <Tooltip>Sign out of Firebase session</Tooltip>
              </TooltipTrigger>
            </Flex>
          )}
        </Flex>
      </Flex>
    </View>
  );
};
