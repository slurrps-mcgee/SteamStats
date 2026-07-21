import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { OwnedGame } from '@steamstats/shared';
import { SteamApiService } from '../../core/api/steam-api.service';
import { SteamSessionService } from '../../core/services/steam-session.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { PlaytimePipe } from '../../shared/pipes/playtime.pipe';

/** Picks and displays a random game from the player's library. */
@Component({
  selector: 'app-random-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, LoadingSpinner, PlaytimePipe],
  templateUrl: './random-game.html',
})
export class RandomGame {
  private readonly api = inject(SteamApiService);
  protected readonly session = inject(SteamSessionService);

  protected readonly game = signal<OwnedGame | null>(null);
  protected readonly loading = signal(false);

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
    this.api.getRandomGame(steamId).subscribe({
      next: (game) => {
        this.game.set(game);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
