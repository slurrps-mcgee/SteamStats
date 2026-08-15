import { inject } from '@angular/core';
import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { isAbortedError } from '../api/resilience.service';
import { NotificationService } from '../services/notification.service';

/**
 * Global HTTP error interceptor. Shows a user-facing notification for failed
 * API calls and re-throws the error so feature code can still react to it
 * (e.g. to show inline "not found" states). Cancelled requests are silent.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(NotificationService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!isAbortedError(error)) {
        const message = error.error?.message ?? 'Something went wrong. Please try again.';
        notifications.error(message);
      }
      return throwError(() => error);
    }),
  );
};
