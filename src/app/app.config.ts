import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';
import { Configuration } from './api';
import { TokenStorageService } from './auth/token-storage.service';
import { environment } from 'environments/environment';
import { GlobalErrorInterceptor } from '@core/error-handling/global-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: GlobalErrorInterceptor, multi: true },
    {
      provide: Configuration,
      deps: [TokenStorageService],
      useFactory: (ts: TokenStorageService) =>
        new Configuration({
          basePath: environment.apiBase ?? '/api',
          accessToken: () => ts.getAccessToken() || '',
        }),
    },
  ],
};
