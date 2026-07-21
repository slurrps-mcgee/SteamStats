import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { label: 'Library', icon: 'videogame_asset', path: '/library' },
  { label: 'Random Game', icon: 'casino', path: '/random' },
  { label: 'Statistics', icon: 'bar_chart', path: '/statistics' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
];

/** App shell: sidebar navigation + top toolbar wrapping every page. */
@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  protected readonly navItems = NAV_ITEMS;
}
