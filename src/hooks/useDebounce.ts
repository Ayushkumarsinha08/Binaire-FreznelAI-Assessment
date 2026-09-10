import { useEffect, useState } from 'react';
import { debounce } from '../utils/debounce';

/**
 * useDebounce
 *
 * Custom React hook that delays updating the debounced value until
 * after `delay` milliseconds have elapsed since the last change.
 *
 * Uses the custom `debounce` utility under the hood.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = debounce((val: T) => {
      setDebouncedValue(val);
    }, delay);

    handler(value);

    return () => {
      handler.cancel();
    };
  }, [value, delay]);

  return debouncedValue;
}
