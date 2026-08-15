import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SteamSessionStore } from '../../stores/steam-session.store';
import { NotificationService } from '../../services/notification.service';

/** Settings page. Currently just session management; more to come. */
@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly session = inject(SteamSessionStore);
  private readonly notifications = inject(NotificationService);

  clearSession(): void {
    this.session.clear();
    this.notifications.success('Cleared the active Steam profile.');
  }
}
