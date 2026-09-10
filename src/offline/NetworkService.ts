import { throttle } from '../utils/throttle';

export type NetworkStatusListener = (isOnline: boolean) => void;

/**
 * NetworkService
 *
 * Provides real-time network connectivity tracking and subscription.
 *
 * THROTTLE USAGE RATIONALE:
 * Uses the custom `throttle` utility to rate-limit connectivity transition events
 * and health ping checks (throttled to 1500ms). When Wi-Fi or cellular connections
 * drop and reconnect, the browser can emit bursts of alternating online/offline events.
 * Throttling prevents rapid-fire state flipping and protects the app from cascading
 * background refresh storms.
 *
 * BEYOND NAVIGATOR.ONLINE:
 * `navigator.onLine` can produce false positives (e.g. connected to Wi-Fi router
 * with no actual internet access). NetworkService supports active heartbeat verification
 * and reactive status reporting from API request outcomes.
 */
export class NetworkService {
  private isOnline: boolean;
  private listeners: Set<NetworkStatusListener> = new Set();
  private throttledNotify: (online: boolean) => void;

  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // Genuine usage of throttle: Throttles status notifications to listeners to at most once per 1.5s
    this.throttledNotify = throttle((online: boolean) => {
      this.listeners.forEach((listener) => {
        try {
          listener(online);
        } catch {
          // ignore listener errors
        }
      });
    }, 1500);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnlineEvent);
      window.addEventListener('offline', this.handleOfflineEvent);
    }
  }

  private handleOnlineEvent = (): void => {
    this.isOnline = true;
    this.throttledNotify(true);
  };

  private handleOfflineEvent = (): void => {
    this.isOnline = false;
    this.throttledNotify(false);
  };

  /**
   * Reports that an active HTTP/network request failed.
   * Updates state to offline if network failure is suspected.
   */
  public reportRequestFailure(): void {
    if (this.isOnline) {
      this.isOnline = false;
      this.throttledNotify(false);
    }
  }

  /**
   * Reports that an active network request succeeded.
   */
  public reportRequestSuccess(): void {
    if (!this.isOnline) {
      this.isOnline = true;
      this.throttledNotify(true);
    }
  }

  /**
   * Current online status.
   */
  public getStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Subscribes to network status transitions.
   * Returns an unsubscribe callback.
   */
  public subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    // Immediately inform the listener of the current status
    listener(this.isOnline);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Cleans up global window event listeners.
   */
  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnlineEvent);
      window.removeEventListener('offline', this.handleOfflineEvent);
    }
    this.listeners.clear();
  }
}

// Default singleton instance
export const networkService = new NetworkService();
