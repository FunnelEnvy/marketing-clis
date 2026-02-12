import { describe, it, expect, vi } from 'vitest';
import {
  detectRateLimit,
  isRetryableStatus,
  calculateDelay,
  withRetry,
} from '../index.js';

describe('detectRateLimit', () => {
  it('returns null for non-429 status', () => {
    const response = {
      status: 200,
      headers: { get: () => null },
    };
    expect(detectRateLimit(response)).toBeNull();
  });

  it('returns retry-after in ms for 429 with seconds header', () => {
    const response = {
      status: 429,
      headers: { get: (name: string) => (name === 'retry-after' ? '30' : null) },
    };
    expect(detectRateLimit(response)).toBe(30_000);
  });

  it('returns default 60s for 429 without header', () => {
    const response = {
      status: 429,
      headers: { get: () => null },
    };
    expect(detectRateLimit(response)).toBe(60_000);
  });
});

describe('isRetryableStatus', () => {
  it('returns true for retryable codes', () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(502)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(504)).toBe(true);
  });

  it('returns false for non-retryable codes', () => {
    expect(isRetryableStatus(200)).toBe(false);
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(401)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
  });
});

describe('calculateDelay', () => {
  it('increases exponentially', () => {
    // Due to jitter, we check ranges
    const d0 = calculateDelay(0, 1000, 2, 60000);
    const d1 = calculateDelay(1, 1000, 2, 60000);
    const d2 = calculateDelay(2, 1000, 2, 60000);
    expect(d0).toBeGreaterThanOrEqual(1000);
    expect(d0).toBeLessThanOrEqual(1100);
    expect(d1).toBeGreaterThanOrEqual(2000);
    expect(d2).toBeGreaterThanOrEqual(4000);
  });

  it('caps at maxDelay', () => {
    const delay = calculateDelay(10, 1000, 2, 5000);
    expect(delay).toBeLessThanOrEqual(5000);
  });
});

describe('withRetry', () => {
  it('returns result on success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const result = await withRetry(fn, { initialDelay: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fail'));
    await expect(
      withRetry(fn, { maxRetries: 2, initialDelay: 10 }),
    ).rejects.toThrow('always fail');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('calls onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    await withRetry(fn, { initialDelay: 10, onRetry });
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
