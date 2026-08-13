import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'library',
    loadComponent: () => import('./pages/library/library').then((m) => m.Library),
  },
  {
    path: 'random',
    loadComponent: () => import('./pages/random/random-game').then((m) => m.RandomGame),
  },
  {
    path: 'statistics',
    loadComponent: () => import('./pages/statistics/statistics').then((m) => m.Statistics),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
  },
  {
    path: 'game-details/:id',
    loadComponent: () => import('./pages/gamedetails/game-details').then((m) => m.GameDetails),
  },
  { path: '**', redirectTo: 'dashboard' },
];
