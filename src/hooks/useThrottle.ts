import { useCallback, useEffect, useRef } from 'react';
import { throttle } from '../utils/throttle';

/**
 * useThrottle
 *
 * Custom React hook returning a throttled callback memoized across renders.
 * Uses the custom `throttle` utility under the hood.
 */
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  limit = 1000
): (...args: Parameters<T>) => void {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  const throttledRef = useRef(
    throttle((...args: Parameters<T>) => {
      cbRef.current(...args);
    }, limit)
  );

  useEffect(() => {
    return () => {
      throttledRef.current.cancel();
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    throttledRef.current(...args);
  }, []);
}
