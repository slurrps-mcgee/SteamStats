import type { HttpInterceptorFn } from '@angular/common/http';
import { defer, from, lastValueFrom } from 'rxjs';
import { defaultPolicy } from '../services/resilience.service';

/**
 * Retry / circuit-break /api/v1 calls (5xx and network errors only).
 *
 * Generated clients use `HttpClient.request(HttpRequest)`, which emits
 * `HttpEvent`s (`Sent`, then `Response`). `firstValueFrom` would take `Sent`
 * and unsubscribe, which aborts the XHR (Firefox `NS_BINDING_ABORTED`).
 */
export const retryInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.includes('/api/v1')) {
    return next(request);
  }

  return defer(() => from(defaultPolicy.execute(() => lastValueFrom(next(request.clone())))));
};
