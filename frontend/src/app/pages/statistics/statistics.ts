import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import type { OwnedGame } from '@steamstats/shared';
import { SteamSessionService } from '../../services/steam-session.service';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { PlaytimePipe } from '../../pipes/playtime.pipe';

const TOP_GAMES_COUNT = 8;

/** Playtime distribution chart and other library-wide statistics. */
@Component({
  selector: 'app-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingSpinner, PlaytimePipe],
  templateUrl: './statistics.html',
})
export class Statistics {
  protected readonly session = inject(SteamSessionService);

  private readonly games = computed(() => this.session.library()?.games ?? []);

  protected readonly loading = computed(
    () => this.session.libraryLoading() || (!!this.session.steamId() && !this.session.library()),
  );

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
      if (this.session.steamId()) {
        this.session.ensureLibrary();
      }
    });
  }

  barWidth(game: OwnedGame): string {
    return `${Math.max(4, (game.playtimeForeverMinutes / this.maxPlaytime()) * 100)}%`;
  }
}
