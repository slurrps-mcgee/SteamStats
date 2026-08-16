import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import type { OwnedGame } from '../../interfaces/api';
import { SteamSessionStore } from '../../stores/steam-session.store';
import { GameDetailsStore } from '../../stores/game-details.store';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { PlaytimePipe } from '../../pipes/playtime.pipe';

const TOP_GAMES_COUNT = 8;

type StatBar = { label: string; minutes: number };

/** Playtime distribution and platform split from already-cached Store hints. */
@Component({
  selector: 'app-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingSpinner, PlaytimePipe],
  templateUrl: './statistics.html',
})
export class Statistics {
  protected readonly session = inject(SteamSessionStore);
  private readonly catalog = inject(GameDetailsStore);

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

  protected readonly platformBars = computed(() => {
    this.catalog.hintsRevision();
    const minutes = new Map<string, number>();
    for (const game of this.games()) {
      const hint = this.catalog.peekHint(game.appId);
      if (!hint) {
        continue;
      }
      if (hint.platforms.windows) {
        this.addMinutes(minutes, 'Windows', game.playtimeForeverMinutes);
      }
      if (hint.platforms.mac) {
        this.addMinutes(minutes, 'Mac', game.playtimeForeverMinutes);
      }
      if (hint.platforms.linux) {
        this.addMinutes(minutes, 'Linux', game.playtimeForeverMinutes);
      }
    }
    return this.toBars(minutes);
  });

  protected readonly maxPlatformMinutes = computed(() =>
    Math.max(1, ...this.platformBars().map((bar) => bar.minutes)),
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

  statBarWidth(minutes: number, max: number): string {
    return `${Math.max(4, (minutes / max) * 100)}%`;
  }

  private addMinutes(map: Map<string, number>, label: string, minutes: number): void {
    map.set(label, (map.get(label) ?? 0) + minutes);
  }

  private toBars(map: Map<string, number>): StatBar[] {
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, minutes]) => ({ label, minutes }));
  }
}
