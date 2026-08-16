import {
  ConsecutiveBreaker,
  ExponentialBackoff,
  retry,
  handleWhen,
  circuitBreaker,
  wrap,
} from 'cockatiel';

/** Navigation, interceptor unsubscribe, or Firefox NS_BINDING_ABORTED. */
export function isAbortedError(err: unknown): boolean {
  const anyErr = err as {
    name?: string;
    message?: string;
    status?: number;
    error?: { type?: string; message?: string };
  };

  if (anyErr?.name === 'AbortError' || anyErr?.name === 'CanceledError') {
    return true;
  }

  const message = `${anyErr?.message ?? ''} ${anyErr?.error?.message ?? ''}`;
  if (message.includes('NS_BINDING_ABORTED') || /abort/i.test(message)) {
    return true;
  }

  return anyErr?.status === 0 && anyErr?.error?.type === 'abort';
}

/** Retry / break only on network failures and HTTP 5xx — not on 4xx or aborts. */
export function isRetriableError(err: unknown): boolean {
  if (isAbortedError(err)) {
    return false;
  }

  const anyErr = err as {
    name?: string;
    status?: number;
    statusCode?: number;
    response?: { status?: number };
    error?: { status?: number };
  };

  const status: number | undefined =
    anyErr?.status ?? anyErr?.statusCode ?? anyErr?.response?.status ?? anyErr?.error?.status;

  if (typeof status === 'number') {
    if (status === 0) {
      return true;
    }
    return status >= 500 && status < 600;
  }

  if (anyErr?.name === 'TimeoutError') {
    return true;
  }
  if (typeof status !== 'number' && err instanceof Error) {
    return true;
  }

  return false;
}

const retryPolicy = retry(handleWhen(isRetriableError), {
  maxAttempts: 3,
  backoff: new ExponentialBackoff({ initialDelay: 500, maxDelay: 5_000 }),
});

const breakerPolicy = circuitBreaker(handleWhen(isRetriableError), {
  halfOpenAfter: 10 * 1000,
  breaker: new ConsecutiveBreaker(5),
});

const defaultPolicy = wrap(breakerPolicy, retryPolicy);

export { defaultPolicy };
