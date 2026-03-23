import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
// import { ExcluirCategoriaComponent } from './components/excluir-categoria/excluir-categoria.component';
import { authGuard } from './auth/auth.guard';
import { ClienteListComponent } from './components/clientes/cliente-list/cliente-list.component';
import { ClienteFormComponent } from './components/clientes/cliente-form/cliente-form.component';
import { ClienteDetailsComponent } from './components/clientes/cliente-details/cliente-details.component';
import { BicicletaFormComponent } from './components/bicicletas/bicicleta-form/bicicleta-form.component';
import { BicicletasEmServicoComponent } from './components/bicicletas-em-servico/bicicletas-em-servico.component';
import { OrdemListComponent } from './components/ordens-servico/ordem-list/ordem-list.component';
import { OrdemFormComponent } from './components/ordens-servico/ordem-form/ordem-form.component';
import { OrdemDetailsComponent } from './components/ordens-servico/ordem-details/ordem-details.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AgendaComponent } from './components/agenda/agenda.component';
import { OrdemFormNovoComponent } from './components/ordens-servico/ordem-form/ordem-form-novo.component';
import { HistoricoComponent } from './components/historico/historico.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { 'path': 'login', component: LoginComponent },
    // Clientes (lista, cadastro rápido, detalhes, edição)
    {
        path: 'clientes',
        children: [
            { path: '', component: ClienteListComponent },
            { path: 'novo', component: ClienteFormComponent },
            { path: ':id', component: ClienteDetailsComponent },
            { path: ':id/editar', component: ClienteFormComponent }
        ],
        canActivate: [authGuard],
        data: { role: ['ADMIN', 'FUNCIONARIO', 'CLIENTE'] }
    },
    // Bicicletas (vincular bicicleta a cliente)
    {
        path: 'bicicletas',
        children: [
            { path: 'novo', component: BicicletaFormComponent }
        ],
        canActivate: [authGuard],
        data: { role: ['ADMIN', 'FUNCIONARIO', 'CLIENTE'] }
    },
    // Bicicletas em Serviço (novo componente)
    {
        path: 'bicicletas-em-servico',
        component: BicicletasEmServicoComponent,
        canActivate: [authGuard],
        data: { role: ['ADMIN', 'FUNCIONARIO'] }
    },
    // Ordens de Serviço (listar, criar, detalhes)
    {
        path: 'ordens-servico',
        children: [
            { path: '', component: OrdemListComponent },
            { path: 'novo', component: OrdemFormNovoComponent },
            { path: 'detalhes/:id', component: OrdemDetailsComponent },
            { path: ':id', component: OrdemDetailsComponent }
        ],
        canActivate: [authGuard],
        data: { role: ['ADMIN', 'FUNCIONARIO', 'CLIENTE'] }
    },
    // Histórico de Serviços (componente analítico)
    {
        path: 'historico',
        component: HistoricoComponent,
        canActivate: [authGuard],
        data: { role: ['ADMIN', 'FUNCIONARIO'] }
    },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'agenda', component: AgendaComponent }
];
