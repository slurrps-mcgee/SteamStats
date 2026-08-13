import type { CanActivateFn } from '@angular/router';

/**
 * Placeholder route guard for future Steam OpenID authentication.
 *
 * The app currently works without login (any public SteamID/profile can be
 * looked up). This guard is a no-op today, but gives feature routes a single
 * place to opt into requiring an authenticated session once Steam OpenID
 * login is implemented.
 */
export const authGuard: CanActivateFn = () => {
  return true;
};
