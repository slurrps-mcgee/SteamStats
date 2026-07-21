import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SteamSessionService } from '../../core/services/steam-session.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { GameCard } from '../../shared/components/game-card/game-card';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { PlaytimePipe } from '../../shared/pipes/playtime.pipe';
import { SearchBar } from '../search/search-bar/search-bar';
import { ProfileSummary } from '../profile/profile-summary/profile-summary';

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

  protected readonly session =
    inject(SteamSessionService);


  constructor() {

    effect(() => {

      const steamId =
        this.session.steamId();

      if (steamId) {
        this.session.loadDashboardData();
      }

    });

  }


  onSearch(input: string): void {
    this.session.resolveAndLoad(input);
  }

}