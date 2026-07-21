import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Thin wrapper around Angular Material's snackbar for user-facing
 * notifications (errors, confirmations, etc.).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly snackBar: MatSnackBar) {}

  error(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 5000, panelClass: 'notification-error' });
  }

  success(message: string): void {
    this.snackBar.open(message, undefined, { duration: 3000 });
  }
}
