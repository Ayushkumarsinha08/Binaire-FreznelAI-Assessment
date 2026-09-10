import React, { useEffect, useState } from 'react';
import {
  defaultTheme,
  Flex,
  InlineAlert,
  ProgressCircle,
  Provider,
  Text,
  View,
} from '@adobe/react-spectrum';
import { useAuth } from '../../hooks/useAuth';
import { useModels } from '../../hooks/useModels';
import { throttle } from '../../utils/throttle';
import { AuthScreen } from '../Auth/AuthScreen';
import { ActiveFilters } from '../Filters/ActiveFilters';
import { FilterSidebar } from '../Filters/FilterSidebar';
import { ModelDetails } from '../Models/ModelDetails';
import { ModelTable } from '../Models/ModelTable';
import { SearchToolbar } from '../Search/SearchToolbar';
import { Header } from './Header';

export const AppShell: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { error } = useModels();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  /**
   * THROTTLE USAGE RATIONALE:
   * Window resize events fire continuously during user drag/maximize operations.
   * We throttle the resize handler to 200ms so responsive layout breakpoint calculations
   * (e.g. collapsing the sidebar on smaller viewports) do not trigger frame drops or layout thrashing.
   */
  useEffect(() => {
    const handleResize = throttle(() => {
      const width = window.innerWidth;
      const compact = width < 900;
      setIsCompact(compact);
      if (compact) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    }, 200);

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Provider theme={defaultTheme} colorScheme="dark">
      {/* 1. Authentication Loading State */}
      {isAuthLoading ? (
        <View
          height="100vh"
          width="100vw"
          UNSAFE_style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Flex direction="column" alignItems="center" gap="size-200">
            <ProgressCircle size="L" isIndeterminate aria-label="Authenticating session" />
            <Text UNSAFE_style={{ color: '#aaaaaa' }}>Initializing Binaire Model Explorer...</Text>
          </Flex>
        </View>
      ) : !user ? (
        /* 2. Unauthenticated Gate: Show AuthScreen (strictly Firebase) */
        <AuthScreen />
      ) : (
        /* 3. Authenticated Desktop Application Shell */
        <div className="app-container animate-fade-in">
          {/* Top Navigation Bar */}
          <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          {/* Non-fatal Error / Offline Notification Banner */}
          {error && (
            <View paddingX="size-300" paddingY="size-75" backgroundColor="gray-100">
              <InlineAlert variant="info">
                <Text>{error}</Text>
              </InlineAlert>
            </View>
          )}

          {/* Main Workspace Layout */}
          <div className="app-workspace">
            {/* Collapsible Left Filter Sidebar */}
            {isSidebarOpen && <FilterSidebar />}

            {/* Right Main Content Area */}
            <div className="content-panel">
              <SearchToolbar />
              <ActiveFilters />
              <ModelTable />
            </div>
          </div>

          {/* Model Details Inspector Modal / Dialog */}
          <ModelDetails />
        </div>
      )}
    </Provider>
  );
};
