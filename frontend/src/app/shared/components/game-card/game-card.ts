import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { OwnedGame } from '@steamstats/shared';
import { PlaytimePipe } from '../../pipes/playtime.pipe';

/** Displays a single game's artwork, name, and playtime. */
@Component({
  selector: 'app-game-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="group rounded-xl overflow-hidden bg-steam-card border border-white/5 shadow-md hover:shadow-xl hover:border-steam-primary/40 transition-all"
    >
      <div class="aspect-[460/215] bg-steam-accent overflow-hidden">
        @if (game().headerUrl) {
          <img
            [src]="game().headerUrl"
            [alt]="game().name"
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            (error)="onImageError($event)"
          />
        }
      </div>
      <div class="p-3">
        <div class="text-sm font-medium text-white truncate" [title]="game().name">
          {{ game().name }}
        </div>
        <div class="text-xs text-steam-primary mt-1">
          {{ game().playtimeForeverMinutes | playtime }} played
        </div>
      </div>
    </div>
  `,
  imports: [PlaytimePipe],
})
export class GameCard {
  readonly game = input.required<OwnedGame>();

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }
}
