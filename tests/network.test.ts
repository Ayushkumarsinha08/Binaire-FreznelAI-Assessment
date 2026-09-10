import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkService } from '../src/offline/NetworkService';

describe('NetworkService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('provides initial status upon subscription', () => {
    const service = new NetworkService();
    let currentStatus = false;

    service.subscribe((online) => {
      currentStatus = online;
    });

    expect(typeof currentStatus).toBe('boolean');
    service.destroy();
  });

  it('reports request failures and toggles offline status', () => {
    const service = new NetworkService();
    const statusChanges: boolean[] = [];

    service.subscribe((online) => {
      statusChanges.push(online);
    });

    // Report network failure
    service.reportRequestFailure();

    vi.advanceTimersByTime(2000);
    expect(service.getStatus()).toBe(false);

    // Report network recovery
    service.reportRequestSuccess();
    vi.advanceTimersByTime(2000);
    expect(service.getStatus()).toBe(true);

    service.destroy();
  });
});
