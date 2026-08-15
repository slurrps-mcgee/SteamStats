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
  templateUrl: './game-card.html',
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
