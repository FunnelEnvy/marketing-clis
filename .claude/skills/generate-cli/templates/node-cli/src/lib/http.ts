export interface HttpOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface ApiError {
  code: string;
  message: string;
  retry_after?: number;
}

/**
 * Makes an HTTP request with standard error handling.
 */
export async function request<T>(url: string, options: HttpOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, timeout = 30_000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      throw new HttpError('Rate limit exceeded', 'RATE_LIMITED', 429, retryAfter ? parseInt(retryAfter) : undefined);
    }

    if (response.status === 401 || response.status === 403) {
      throw new HttpError('Authentication failed. Check your API key or run auth login.', 'AUTH_FAILED', response.status);
    }

    if (!response.ok) {
      const text = await response.text();
      let message = `HTTP ${response.status}`;
      try {
        const json = JSON.parse(text);
        message = json.error?.message ?? json.message ?? text;
      } catch {
        message = text || message;
      }
      throw new HttpError(message, 'API_ERROR', response.status);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export class HttpError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Retries a function with exponential backoff.
 */
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries) break;
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
