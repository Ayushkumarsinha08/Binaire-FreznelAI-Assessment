import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/utils/debounce';
import { throttle } from '../src/utils/throttle';

describe('Timing Utilities: Debounce & Throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debounce', () => {
    it('executes only once after the wait duration elapses', () => {
      const spy = vi.fn();
      const debounced = debounce(spy, 300);

      // Rapid consecutive keystrokes
      debounced('a');
      debounced('ab');
      debounced('abc');

      // Not executed yet
      expect(spy).not.toHaveBeenCalled();

      // Fast forward time less than debounce delay
      vi.advanceTimersByTime(200);
      expect(spy).not.toHaveBeenCalled();

      // Complete the debounce delay
      vi.advanceTimersByTime(100);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('abc');
    });

    it('can be cancelled before execution', () => {
      const spy = vi.fn();
      const debounced = debounce(spy, 300);

      debounced('test');
      debounced.cancel();

      vi.advanceTimersByTime(500);
      expect(spy).not.toHaveBeenCalled();
    });

    it('can be flushed immediately', () => {
      const spy = vi.fn();
      const debounced = debounce(spy, 300);

      debounced('immediate');
      debounced.flush();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('immediate');
    });
  });

  describe('throttle', () => {
    it('executes immediately on leading call, then restricts rate', () => {
      const spy = vi.fn();
      const throttled = throttle(spy, 1000);

      // First call executes immediately (leading edge)
      throttled('first');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('first');

      // Intermediate rapid calls during throttle window
      throttled('second');
      throttled('third');
      expect(spy).toHaveBeenCalledTimes(1);

      // Advance timers by full limit
      vi.advanceTimersByTime(1000);

      // Trailing execution fires with the latest arguments
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith('third');
    });

    it('can be cancelled to prevent trailing call', () => {
      const spy = vi.fn();
      const throttled = throttle(spy, 1000);

      throttled('call 1');
      expect(spy).toHaveBeenCalledTimes(1);

      throttled('call 2');
      throttled.cancel();

      vi.advanceTimersByTime(1500);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
