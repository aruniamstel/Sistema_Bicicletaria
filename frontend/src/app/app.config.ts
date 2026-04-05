import { ApplicationConfig, importProvidersFrom } from '@angular/core'; // <-- Adicionado importProvidersFrom
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideNgxMask } from 'ngx-mask';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor'; // a função acima


import { provideAnimations } from '@angular/platform-browser/animations'; // Adicione isso
import { DatePipe, CurrencyPipe } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), // Essencial para o Material que estava no AppModule
    provideNgxMask(),
    provideHttpClient(
      withInterceptors([authInterceptor]) // ESSENCIAL para aceitar interceptores de classe
    ),
    // Agora o parêntese está fechado corretamente abaixo
    importProvidersFrom(
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory,
      })
    ) 
  ]
};