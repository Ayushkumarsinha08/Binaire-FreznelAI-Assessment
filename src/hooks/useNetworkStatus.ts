import { useEffect, useState } from 'react';
import { networkService } from '../offline/NetworkService';

/**
 * useNetworkStatus
 *
 * React hook that subscribes to NetworkService updates.
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => networkService.getStatus());

  useEffect(() => {
    const unsubscribe = networkService.subscribe((status) => {
      setIsOnline(status);
    });

    return unsubscribe;
  }, []);

  return isOnline;
}
