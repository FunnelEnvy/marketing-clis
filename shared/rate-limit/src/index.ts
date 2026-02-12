export interface RetryOptions {
  /** Maximum number of retries. Default: 3 */
  maxRetries?: number;
  /** Initial delay in ms. Default: 1000 */
  initialDelay?: number;
  /** Maximum delay in ms. Default: 60000 */
  maxDelay?: number;
  /** Backoff multiplier. Default: 2 */
  multiplier?: number;
  /** Called before each retry with the delay in ms */
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

export interface HttpResponse {
  status: number;
  headers: {
    get(name: string): string | null;
  };
}

/**
 * Detects if an HTTP response indicates a rate limit.
 * Returns the retry-after delay in ms, or null if not rate-limited.
 */
export function detectRateLimit(response: HttpResponse): number | null {
  if (response.status !== 429) return null;

  const retryAfter = response.headers.get('retry-after');
  if (!retryAfter) return 60_000; // Default 60s if no header

  const seconds = Number(retryAfter);
  if (!isNaN(seconds)) return seconds * 1000;

  // Try parsing as HTTP date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return 60_000;
}

/**
 * Determines if an HTTP status code is retryable.
 */
export function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

/**
 * Calculates delay with exponential backoff and jitter.
 */
export function calculateDelay(
  attempt: number,
  initialDelay: number,
  multiplier: number,
  maxDelay: number,
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt);
  const jitter = delay * 0.1 * Math.random();
  return Math.min(delay + jitter, maxDelay);
}

/**
 * Sleeps for the given duration in ms.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes an async function with automatic retry on rate limits and transient errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 60_000,
    multiplier = 2,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt >= maxRetries) break;

      const delayMs = calculateDelay(attempt, initialDelay, multiplier, maxDelay);
      onRetry?.(attempt + 1, delayMs, error);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

/**
 * Wraps a fetch-like function with rate limit detection and retry.
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options?: RetryOptions,
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, init);

    if (isRetryableStatus(response.status)) {
      const retryDelay = detectRateLimit(response);
      const error = new RateLimitError(
        `Request failed with status ${response.status}`,
        response.status,
        retryDelay,
      );
      throw error;
    }

    return response;
  }, options);
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfterMs: number | null,
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
