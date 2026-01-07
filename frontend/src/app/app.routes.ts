import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CadastroComponent } from './components/cadastro/cadastro.component';
import { OrcamentoclienteComponent } from './components/orcamentocliente/orcamentocliente.component';
import { PagarservicoComponent } from './components/pagarservico/pagarservico.component';
import { ListarFuncionarioComponent } from './components/listar-funcionario/listar-funcionario.component';
import { InserirFuncionarioComponent } from './components/inserir-funcionario/inserir-funcionario.component';
import { EditarFuncionarioComponent } from './components/editar-funcionario/editar-funcionario.component';
import { ListarCategoriaComponent } from './components/listar-categoria/listar-categoria.component';
import { InserirCategoriaComponent } from './components/inserir-categoria/inserir-categoria.component';
// import { ExcluirCategoriaComponent } from './components/excluir-categoria/excluir-categoria.component';
import { AtualizarCategoriaComponent } from './components/atualizar-categoria/atualizar-categoria.component';
import { authGuard } from './auth/auth.guard';
import { ClienteListComponent } from './components/clientes/cliente-list/cliente-list.component';
import { ClienteFormComponent } from './components/clientes/cliente-form/cliente-form.component';
import { ClienteDetailsComponent } from './components/clientes/cliente-details/cliente-details.component';
import { BicicletaFormComponent } from './components/bicicletas/bicicleta-form/bicicleta-form.component';
import { OrdemListComponent } from './components/ordens-servico/ordem-list/ordem-list.component';
import { OrdemFormComponent } from './components/ordens-servico/ordem-form/ordem-form.component';
import { OrdemDetailsComponent } from './components/ordens-servico/ordem-details/ordem-details.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AgendaComponent } from './components/agenda/agenda.component';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { 'path': 'login', component: LoginComponent },
    { 'path': 'cadastro', component: CadastroComponent },
    {
        'path': 'orcamentocliente',
        component: OrcamentoclienteComponent,
        data: {
            role: ['CLIENTE']
        }

    },
    {
        'path': 'pagarservico/:id',
        component: PagarservicoComponent,
        canActivate: [authGuard],
        data: {
            role: ['CLIENTE']
        }
    },
    {
        'path': 'crud-funcionario', redirectTo: 'funcionarios/listar', pathMatch: 'full'
    },
    {
        'path': 'funcionarios/listar',
        component: ListarFuncionarioComponent,
        canActivate: [authGuard],
        data: {
            role: [ 'FUNCIONARIO']
        }
    },
    {
        'path': 'funcionarios/novo',
        component: InserirFuncionarioComponent,
        canActivate: [authGuard],
        data: {
            role: [ 'FUNCIONARIO']
        }
    },
    {
        'path': 'funcionarios/editar/:id',
        component: EditarFuncionarioComponent,
        canActivate: [authGuard],
        data: {
            role: ['FUNCIONARIO']
        }
    },
    {
        'path': 'categorias/listar',
        component: ListarCategoriaComponent,
        canActivate: [authGuard],
        data: {
            role: [ 'FUNCIONARIO']
        }
    },
    {
        'path': 'categorias/novo',
        component: InserirCategoriaComponent,
        canActivate: [authGuard],
        data: {
            role: [ 'FUNCIONARIO']
        }
    },
    // {'path': 'categorias/excluir', component: ExcluirCategoriaComponent},
    {
        'path': 'categorias/editar/:id',
        component: AtualizarCategoriaComponent,
        canActivate: [authGuard],
        data: {
            role: [ 'FUNCIONARIO']
        }
    },

    {
        'path': 'orcamentocliente/:id',
        component: OrcamentoclienteComponent,
        canActivate: [authGuard],
        data: {
            role: [ 'CLIENTE']
        }
    },
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
    // Ordens de Serviço (listar, criar, detalhes)
    {
        path: 'ordens-servico',
        children: [
            { path: '', component: OrdemListComponent },
            { path: 'novo', component: OrdemFormComponent },
            { path: ':id', component: OrdemDetailsComponent }
        ],
        canActivate: [authGuard],
        data: { role: ['ADMIN', 'FUNCIONARIO', 'CLIENTE'] }
    },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'agenda', component: AgendaComponent }
];
