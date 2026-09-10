/**
 * Debounce Utility
 *
 * PURPOSE & RATIONALE:
 * Debouncing postpones the execution of a function until after a specific duration
 * (`wait` ms) has elapsed since the last time it was invoked.
 *
 * WHY DEBOUNCE IS USED (e.g. for Search Input):
 * When a user types into the search field, keystrokes occur in rapid succession
 * (e.g. 50-150ms apart). Running expensive string searches or filtering across
 * hundreds of records on every individual keystroke causes unnecessary CPU cycles,
 * frame drops, and intermediate rendering thrash.
 * Debounce ensures the filtering logic runs ONLY once the user has paused typing
 * (typically 300ms), delivering a smooth and responsive typing experience.
 */

export type Procedure = (...args: any[]) => void;

export interface DebouncedFunction<T extends Procedure> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay (default: 300ms).
 * @returns The new debounced function with `cancel()` and `flush()` methods.
 */
export function debounce<T extends Procedure>(func: T, wait = 300): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (lastArgs !== null) {
        func.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }
    }, wait);
  } as DebouncedFunction<T>;

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = () => {
    if (timeoutId !== null && lastArgs !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  };

  return debounced;
}
