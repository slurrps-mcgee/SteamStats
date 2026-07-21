import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'library',
    loadComponent: () => import('./features/library/library').then((m) => m.Library),
  },
  {
    path: 'random',
    loadComponent: () => import('./features/random/random-game').then((m) => m.RandomGame),
  },
  {
    path: 'statistics',
    loadComponent: () => import('./features/statistics/statistics').then((m) => m.Statistics),
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
  },
  { path: '**', redirectTo: 'dashboard' },
];
