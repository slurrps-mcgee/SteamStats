import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { SteamProfile } from '@steamstats/shared';
import { SteamDatePipe } from '../../../pipes/steamdate.pipe';
import { DatePipe } from '@angular/common';

const STATUS_LABELS: Record<number, string> = {
  0: 'Offline',
  1: 'Online',
  2: 'Busy',
  3: 'Away',
  4: 'Snooze',
  5: 'Looking to trade',
  6: 'Looking to play',
};

/** Compact profile header showing the player's avatar, name, and status. */
@Component({
  selector: 'app-profile-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-summary.html',
  imports: [SteamDatePipe, DatePipe],
})
export class ProfileSummary {
  readonly profile = input.required<SteamProfile>();

  readonly statusLabel = computed(() => STATUS_LABELS[this.profile().personaState] ?? 'Unknown');
  readonly statusDotClass = computed(() =>
    this.profile().personaState === 0 ? 'bg-slate-500' : 'bg-emerald-400',
  );
}
