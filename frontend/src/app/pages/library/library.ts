import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SteamSessionStore } from '../../stores/steam-session.store';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { GameCard } from '../../components/game-card/game-card';

type SortBy = 'playtime' | 'name' | 'recent';

/** Full, filterable/sortable grid of the player's game library. */
@Component({
  selector: 'app-library',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    LoadingSpinner,
    GameCard,
  ],
  templateUrl: './library.html',
})
export class Library {
  protected readonly session = inject(SteamSessionStore);

  protected readonly filterControl = new FormControl('', { nonNullable: true });
  protected readonly sortControl = new FormControl<SortBy>('playtime', { nonNullable: true });

  private readonly filterText = signal('');
  private readonly sortBy = signal<SortBy>('playtime');

  private readonly games = computed(() => this.session.library()?.games ?? []);

  protected readonly loading = computed(
    () => this.session.libraryLoading() || (!!this.session.steamId() && !this.session.library()),
  );

  protected readonly filteredGames = computed(() => {
    const filter = this.filterText().toLowerCase();
    const sort = this.sortBy();

    const filtered = this.games().filter((game) => game.name.toLowerCase().includes(filter));

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0);
        case 'playtime':
        default:
          return b.playtimeForeverMinutes - a.playtimeForeverMinutes;
      }
    });
  });

  constructor() {
    this.filterControl.valueChanges.subscribe((value) => this.filterText.set(value));
    this.sortControl.valueChanges.subscribe((value) => this.sortBy.set(value));

    effect(() => {
      if (this.session.steamId()) {
        this.session.ensureLibrary();
      }
    });
  }
}
