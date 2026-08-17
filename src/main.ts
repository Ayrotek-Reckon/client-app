import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, PreloadAllModules, withPreloading, withDebugTracing } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ErrorHandler } from '@angular/core';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { jwtInterceptor } from './app/core/auth/interceptors/jwt.interceptor';
import { errorInterceptor } from './app/core/auth/interceptors/error.interceptor';
import { ErrorHandlerService } from './app/core/services/error-handler.service';
import { AuthService } from './app/core/auth/services/auth.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor])
    ),
    provideAnimations(),
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService
    },
    AuthService
  ]
}).catch(err => console.error('Bootstrap error:', err));
