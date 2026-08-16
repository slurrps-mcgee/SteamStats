import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { OwnedGame } from '../../interfaces/api';
import { Api } from '../../api/generated/api';
import { getRandomGame } from '../../api/generated/functions';
import { SteamSessionStore } from '../../stores/steam-session.store';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { PlaytimePipe } from '../../pipes/playtime.pipe';
import { steamHeaderCandidates } from '../../utils/steam-artwork';
import { GameDetailsStore } from '../../stores/game-details.store';

/** Picks and displays a random game from the player's library. */
@Component({
  selector: 'app-random-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, LoadingSpinner, PlaytimePipe],
  templateUrl: './random-game.html',
})
export class RandomGame {
  private readonly api = inject(Api);
  private readonly catalog = inject(GameDetailsStore);
  protected readonly session = inject(SteamSessionStore);

  protected readonly game = signal<OwnedGame | null>(null);
  protected readonly loading = signal(false);

  private readonly candidates = computed(() => {
    this.catalog.hintsRevision();
    const game = this.game();
    if (!game) {
      return [];
    }
    return steamHeaderCandidates(game.appId, this.catalog.peekHint(game.appId)?.headerImage);
  });

  private readonly srcIndex = linkedSignal({
    source: () => `${this.game()?.appId ?? 0}:${this.candidates()[0] ?? ''}`,
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

  constructor() {
    effect(() => {
      const steamId = this.session.steamId();
      if (steamId) {
        this.pickRandomGame(steamId);
      }
    });
  }

  randomize(): void {
    const steamId = this.session.steamId();
    if (steamId) {
      this.pickRandomGame(steamId);
    }
  }

  private pickRandomGame(steamId: string): void {
    this.loading.set(true);
    void this.api.invoke(getRandomGame, { steamId }).then(
      (game) => {
        this.game.set(game);
        this.loading.set(false);
      },
      () => this.loading.set(false),
    );
  }
}
