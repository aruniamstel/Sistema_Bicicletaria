/// <reference types="@angular/localize" />

import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes';

// IMPORTAÇÕES DO CALENDÁRIO (Essenciais aqui)
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// Se estiver em desenvolvimento, você pode comentar o enableProdMode()
// enableProdMode(); 

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(RouterModule.forRoot(routes)),
    
    // REGISTRO GLOBAL DO CALENDÁRIO
    importProvidersFrom(
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory,
      })
    )
  ]
}).catch(err => console.error(err));