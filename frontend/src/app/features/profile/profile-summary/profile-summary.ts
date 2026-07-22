import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { SteamProfile } from '@steamstats/shared';
import { SteamDatePipe } from '../../../shared/pipes/steamdate.pipe';
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
  template: `
    <div class="flex items-center gap-4">
      <img
        [src]="profile().avatarFull"
        [alt]="profile().personaName"
        class="w-16 h-16 rounded-xl border-2 border-steam-primary/50 shadow-lg"
      />
      <div>
        <a
          [href]="profile().profileUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-lg font-semibold text-white hover:text-steam-primary transition-colors"
        >
          {{ profile().personaName }}
        </a>
        <div class="flex items-center gap-2 text-sm text-slate-400">
          <span class="inline-block w-2 h-2 rounded-full" [class]="statusDotClass()"></span>
          {{ statusLabel() }}
        </div>
      </div>
      <div>
        <p>Created On: {{ profile().createdAt| steamDate | date:'medium' }}</p>
        <p>Last Login: {{ profile().lastLogoffAt| steamDate | date:'medium' }}</p>
        <!-- Additional profile actions or information can go here -->
      </div>
    </div>
  `,
  imports: [SteamDatePipe, DatePipe],
})
export class ProfileSummary {
  readonly profile = input.required<SteamProfile>();

  readonly statusLabel = computed(() => STATUS_LABELS[this.profile().personaState] ?? 'Unknown');
  readonly statusDotClass = computed(() =>
    this.profile().personaState === 0 ? 'bg-slate-500' : 'bg-emerald-400',
  );
}
