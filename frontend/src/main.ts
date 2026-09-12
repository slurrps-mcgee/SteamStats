import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Drop the production service worker. ngsw intercepts Steam CDN <img> fetches
// and was serving stale CSP/HTML after deploys. Snippy does not register one.
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
    await Promise.all(registrations.map((registration) => registration.unregister()));
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith('ngsw:')).map((key) => caches.delete(key)),
    );
  });
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
