import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import type { OwnedGame } from '@steamstats/shared';
import { SteamApiService } from '../../core/api/steam-api.service';
import { SteamSessionService } from '../../core/services/steam-session.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { PlaytimePipe } from '../../shared/pipes/playtime.pipe';

const TOP_GAMES_COUNT = 8;

/** Playtime distribution chart and other library-wide statistics. */
@Component({
  selector: 'app-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingSpinner, PlaytimePipe],
  templateUrl: './statistics.html',
})
export class Statistics {
  private readonly api = inject(SteamApiService);
  protected readonly session = inject(SteamSessionService);

  protected readonly games = signal<OwnedGame[]>([]);
  protected readonly loading = signal(false);

  protected readonly topGames = computed(() =>
    [...this.games()]
      .sort((a, b) => b.playtimeForeverMinutes - a.playtimeForeverMinutes)
      .slice(0, TOP_GAMES_COUNT),
  );

  protected readonly maxPlaytime = computed(() =>
    Math.max(1, ...this.topGames().map((game) => game.playtimeForeverMinutes)),
  );

  constructor() {
    effect(() => {
      const steamId = this.session.steamId();
      if (!steamId) {
        this.games.set([]);
        return;
      }
      this.loadLibrary(steamId);
    });
  }

  barWidth(game: OwnedGame): string {
    return `${Math.max(4, (game.playtimeForeverMinutes / this.maxPlaytime()) * 100)}%`;
  }

  private loadLibrary(steamId: string): void {
    this.loading.set(true);
    this.api.getLibrary(steamId).subscribe({
      next: (library) => {
        this.games.set(library.games);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
