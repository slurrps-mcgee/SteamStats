import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SteamSessionService } from '../../core/services/steam-session.service';
import { NotificationService } from '../../core/services/notification.service';

/** Settings page. Currently just session management; more to come. */
@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly session = inject(SteamSessionService);
  private readonly notifications = inject(NotificationService);

  clearSession(): void {
    this.session.clear();
    this.notifications.success('Cleared the active Steam profile.');
  }
}
