import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClienteListComponent } from './components/clientes/cliente-list/cliente-list.component';
import { ClienteFormComponent } from './components/clientes/cliente-form/cliente-form.component';
import { BicicletaFormComponent } from './components/bicicletas/bicicleta-form/bicicleta-form.component';
import { OrdemListComponent } from './components/ordens-servico/ordem-list/ordem-list.component';
import { OrdemFormComponent } from './components/ordens-servico/ordem-form/ordem-form.component';
import { OrdemDetailsComponent } from './components/ordens-servico/ordem-details/ordem-details.component';
import { AgendaComponent } from './components/agenda/agenda.component';
import { authGuard } from './auth/auth.guard';

const routes: Routes = [
  { 
    path: 'clientes',
    children: [
      { path: '', component: ClienteListComponent },
      { path: 'novo', component: ClienteFormComponent },
      { path: ':id/editar', component: ClienteFormComponent },
    ],
    canActivate: [authGuard]
  },
  {
    path: 'bicicletas',
    children: [
      { path: 'novo', component: BicicletaFormComponent },
    ],
    canActivate: [authGuard]
  },
  {
    path: 'ordens-servico',
    children: [
      { path: '', component: OrdemListComponent },
      { path: 'novo', component: OrdemFormComponent },
      { path: ':id', component: OrdemDetailsComponent },
    ],
    canActivate: [authGuard]
  },
  {
    path: 'agenda',
    component: AgendaComponent,
    canActivate: [authGuard]
  },
  {
    path: '', redirectTo: '/ordens-servico', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }