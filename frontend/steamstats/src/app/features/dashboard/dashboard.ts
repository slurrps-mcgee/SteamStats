import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { LibraryResponse, OwnedGame, RecentlyPlayedGame } from '@steamstats/shared';
import { SteamApiService } from '../../core/api/steam-api.service';
import { SteamSessionService } from '../../core/services/steam-session.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { GameCard } from '../../shared/components/game-card/game-card';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { PlaytimePipe } from '../../shared/pipes/playtime.pipe';
import { SearchBar } from '../search/search-bar/search-bar';
import { ProfileSummary } from '../profile/profile-summary/profile-summary';

/** Main dashboard page: search, profile summary, stat cards, and recent games. */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoadingSpinner, GameCard, StatCard, PlaytimePipe, SearchBar, ProfileSummary],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly api = inject(SteamApiService);
  protected readonly session = inject(SteamSessionService);

  protected readonly library = signal<LibraryResponse | null>(null);
  protected readonly recentGames = signal<RecentlyPlayedGame[]>([]);
  protected readonly randomGame = signal<OwnedGame | null>(null);
  protected readonly loadingLibrary = signal(false);

  constructor() {
    effect(() => {
      const steamId = this.session.steamId();
      if (!steamId) {
        this.library.set(null);
        this.recentGames.set([]);
        this.randomGame.set(null);
        return;
      }
      this.loadLibraryData(steamId);
    });
  }

  onSearch(input: string): void {
    this.session.resolveAndLoad(input);
  }

  private loadLibraryData(steamId: string): void {
    this.loadingLibrary.set(true);

    this.api.getLibrary(steamId).subscribe({
      next: (library) => {
        this.library.set(library);
        this.loadingLibrary.set(false);
      },
      error: () => this.loadingLibrary.set(false),
    });

    this.api.getRecentlyPlayed(steamId).subscribe({
      next: (games) => this.recentGames.set(games),
    });

    this.api.getRandomGame(steamId).subscribe({
      next: (game) => this.randomGame.set(game),
    });
  }
}
