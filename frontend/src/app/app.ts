import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';

import { MediaMatcher } from '@angular/cdk/layout';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Footer } from './components/footer/footer';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    path: '/dashboard',
  },
  {
    label: 'Library',
    icon: 'videogame_asset',
    path: '/library',
  },
  {
    label: 'Random Game',
    icon: 'casino',
    path: '/random',
  },
  {
    label: 'Statistics',
    icon: 'bar_chart',
    path: '/statistics',
  },
  {
    label: 'Settings',
    icon: 'settings',
    path: '/settings',
  },
];

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,

    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatTooltipModule,
    Footer,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  @ViewChild('snav')
  protected sidenav!: MatSidenav;

  private readonly media = inject(MediaMatcher);

  private readonly mobileQuery = this.media.matchMedia('(max-width: 768px)');

  protected readonly navItems = NAV_ITEMS;

  /**
   * Desktop starts collapsed.
   */
  protected readonly expanded = signal(false);

  protected readonly isMobile = signal(this.mobileQuery.matches);

  protected readonly sidenavOpen = signal(!this.mobileQuery.matches);

  protected readonly navRailCollapsed = computed(() => !this.expanded() && !this.isMobile());

  protected readonly menuExpanded = computed(() =>
    this.isMobile() ? this.sidenavOpen() : this.expanded(),
  );

  protected readonly menuButtonLabel = computed(() => {
    if (this.isMobile()) {
      return this.sidenavOpen() ? 'Close navigation' : 'Open navigation';
    }

    return this.expanded() ? 'Collapse navigation' : 'Expand navigation';
  });

  private readonly mobileListener = (event: MediaQueryListEvent) => {
    this.isMobile.set(event.matches);

    if (event.matches) {
      this.expanded.set(false);
    }
  };

  constructor() {
    this.mobileQuery.addEventListener('change', this.mobileListener);
  }

  toggleNav(): void {
    if (this.isMobile()) {
      this.sidenav.toggle();
      return;
    }

    this.expanded.update((value) => !value);
  }

  closeMobile(): void {
    if (this.isMobile()) {
      this.sidenav.close();
    }
  }

  onSidenavOpenedChange(opened: boolean): void {
    this.sidenavOpen.set(opened);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileListener);
  }
}
