import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { errorInterceptor } from './interceptors/error.interceptor';
import { retryInterceptor } from './interceptors/retry.interceptor';
import { provideApiConfiguration } from './api/generated/api-configuration';
import { SteamStatsTitleStrategy } from './seo/page-meta';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: TitleStrategy, useClass: SteamStatsTitleStrategy },
    provideHttpClient(withInterceptors([errorInterceptor, retryInterceptor])),
    provideApiConfiguration('/api/v1'),
    provideAnimationsAsync(),
  ],
};
