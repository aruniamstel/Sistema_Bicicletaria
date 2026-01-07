import { ApplicationConfig, importProvidersFrom } from '@angular/core'; // <-- Adicionado importProvidersFrom
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideNgxMask } from 'ngx-mask';
import { provideHttpClient } from '@angular/common/http';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideNgxMask(),
    provideHttpClient(),
    // Agora o parêntese está fechado corretamente abaixo
    importProvidersFrom(
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory,
      })
    ) 
  ]
};