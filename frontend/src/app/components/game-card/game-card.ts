import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { OwnedGame } from '../../interfaces/api';
import { PlaytimePipe } from '../../pipes/playtime.pipe';
import { steamHeaderCandidates } from '../../utils/steam-artwork';
import { GameDetailsStore } from '../../stores/game-details.store';

/** Displays a single game's artwork, name, and playtime. Navigates to game details on click. */
@Component({
  selector: 'app-game-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-card.html',
  imports: [PlaytimePipe, RouterLink],
})
export class GameCard {
  private readonly catalog = inject(GameDetailsStore);

  readonly game = input.required<OwnedGame>();

  private readonly candidates = computed(() => {
    this.catalog.hintsRevision();
    const game = this.game();
    return steamHeaderCandidates(game.appId, this.catalog.peekHint(game.appId)?.headerImage);
  });

  private readonly srcIndex = linkedSignal({
    source: () => `${this.game().appId}:${this.candidates()[0] ?? ''}`,
    computation: () => 0,
  });

  protected readonly headerSrc = computed(() => this.candidates()[this.srcIndex()] ?? '');

  onImageError(event: Event): void {
    const next = this.srcIndex() + 1;
    if (next < this.candidates().length) {
      this.srcIndex.set(next);
      return;
    }

    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }
}
