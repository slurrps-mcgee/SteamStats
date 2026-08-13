import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SteamSessionService } from '../../services/steam-session.service';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { GameCard } from '../../components/game-card/game-card';
import { StatCard } from '../../components/stat-card/stat-card';
import { PlaytimePipe } from '../../pipes/playtime.pipe';
import { SearchBar } from '../search/search-bar/search-bar';
import { ProfileSummary } from '../../components/profile/profile-summary/profile-summary';

/**
 * Main dashboard page.
 *
 * Dashboard state is owned by SteamSessionService so data survives
 * navigation and can be restored after browser refresh.
 */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LoadingSpinner,
    GameCard,
    StatCard,
    PlaytimePipe,
    SearchBar,
    ProfileSummary,
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly session = inject(SteamSessionService);

  /** Games with recent playtime, derived from the cached library. */
  protected readonly recentGames = computed(() => {
    const games = this.session.library()?.games ?? [];
    return [...games]
      .filter((game) => game.playtimeRecentMinutes > 0)
      .sort((a, b) => b.playtimeRecentMinutes - a.playtimeRecentMinutes)
      .slice(0, 10);
  });

  constructor() {
    effect(() => {
      const steamId = this.session.steamId();

      if (steamId) {
        this.session.ensureLibrary();
      }
    });
  }

  onSearch(input: string): void {
    this.session.resolveAndLoad(input);
  }
}
