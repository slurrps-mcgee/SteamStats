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
import { SteamSessionService } from '../../services/steam-session.service';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { PlaytimePipe } from '../../pipes/playtime.pipe';
import { steamHeaderCandidates } from '../../utils/steam-artwork';

/** Picks and displays a random game from the player's library. */
@Component({
  selector: 'app-random-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, LoadingSpinner, PlaytimePipe],
  templateUrl: './random-game.html',
})
export class RandomGame {
  private readonly api = inject(Api);
  protected readonly session = inject(SteamSessionService);

  protected readonly game = signal<OwnedGame | null>(null);
  protected readonly loading = signal(false);

  private readonly candidates = computed(() => {
    const game = this.game();
    return game ? steamHeaderCandidates(game.appId) : [];
  });

  private readonly srcIndex = linkedSignal({
    source: () => this.game()?.appId ?? 0,
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
