/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // Importamos a config que tem o interceptor

bootstrapApplication(AppComponent, appConfig) // Usamos a config aqui!
  .catch(err => console.error(err));