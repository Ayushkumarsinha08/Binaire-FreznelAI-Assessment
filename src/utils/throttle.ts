/**
 * Throttle Utility
 *
 * PURPOSE & RATIONALE:
 * Throttling enforces a maximum rate at which a function can be executed.
 * Unlike debouncing (which waits for quiet periods before firing once),
 * throttling guarantees continuous, periodic execution at most once per `limit` ms
 * during an ongoing stream of events.
 *
 * GENUINE USE CASES IN THIS APPLICATION:
 * 1. Manual API Refresh Action (Cooldown Throttle):
 *    Prevents user double-clicking or rapid-firing the Refresh button, protecting
 *    the remote API and local IndexedDB from concurrent write contention.
 * 2. Network Service Heartbeat & Online/Offline Transitions:
 *    When network connections flicker, browser online/offline events can trigger in
 *    rapid bursts. Throttling ensures network status recalculations and ping checks
 *    execute at a controlled, stable frequency.
 * 3. Responsive Window Resize Handler:
 *    Window resize triggers dozens of events per second. Throttling limits responsive
 *    breakpoint checks (e.g., auto-collapsing the filter sidebar on tablet viewports)
 *    to once every 200ms, maintaining 60fps rendering without layout jank.
 *
 * DEBOUNCE VS THROTTLE DISTINCTION:
 * - Debounce: "Execute ONLY after the user STOPS for X ms" (e.g. search keystrokes).
 * - Throttle: "Execute AT MOST once every X ms" (e.g. refresh button clicks, window resize, network pings).
 */

export type ThrottledProcedure = (...args: any[]) => void;

export interface ThrottledFunction<T extends ThrottledProcedure> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `limit` milliseconds. Supports leading edge execution.
 *
 * @param func The function to throttle.
 * @param limit The time window in milliseconds.
 * @returns The throttled function with `cancel()` method.
 */
export function throttle<T extends ThrottledProcedure>(func: T, limit = 1000): ThrottledFunction<T> {
  let inThrottle = false;
  let lastRan = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;

  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    lastArgs = args;
    lastThis = this;

    if (!inThrottle) {
      func.apply(lastThis, lastArgs);
      lastRan = now;
      inThrottle = true;

      timeoutId = setTimeout(() => {
        inThrottle = false;
        if (lastArgs && lastRan + limit <= Date.now()) {
          // trailing edge execution if calls were made during the throttle window
          func.apply(lastThis, lastArgs);
          lastRan = Date.now();
          lastArgs = null;
          lastThis = null;
        }
      }, limit);
    }
  } as ThrottledFunction<T>;

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    inThrottle = false;
    lastArgs = null;
    lastThis = null;
  };

  return throttled;
}
