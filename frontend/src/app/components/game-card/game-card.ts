import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { OwnedGame } from '@steamstats/shared';
import { PlaytimePipe } from '../../pipes/playtime.pipe';
import { steamHeaderCandidates } from '../../utils/steam-artwork';

/** Displays a single game's artwork, name, and playtime. Navigates to game details on click. */
@Component({
  selector: 'app-game-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [routerLink]="['/game-details', game().appId]"
      class="group block rounded-xl overflow-hidden bg-steam-card border border-white/5 shadow-md hover:shadow-xl hover:border-steam-primary/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-steam-primary/60"
    >
      <div class="aspect-[460/215] bg-steam-accent overflow-hidden">
        @if (headerSrc()) {
          <img
            [src]="headerSrc()"
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
    </a>
  `,
  imports: [PlaytimePipe, RouterLink],
})
export class GameCard {
  readonly game = input.required<OwnedGame>();

  private readonly candidates = computed(() => {
    const game = this.game();
    return steamHeaderCandidates(game.appId);
  });

  private readonly srcIndex = linkedSignal({
    source: () => this.game().appId,
    computation: () => 0,
  });

  protected readonly headerSrc = computed(
    () => this.candidates()[this.srcIndex()] ?? '',
  );

  onImageError(event: Event): void {
    const next = this.srcIndex() + 1;
    if (next < this.candidates().length) {
      this.srcIndex.set(next);
      return;
    }

    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }
}
