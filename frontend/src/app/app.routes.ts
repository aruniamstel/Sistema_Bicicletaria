import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PgClienteComponent } from './components/pg-cliente/pg-cliente.component';
import { NovaSolicitacaoComponent } from './components/nova-solicitacao/nova-solicitacao.component';
import { CadastroComponent } from './components/cadastro/cadastro.component';
import { PgFuncionarioComponent } from './components/pg-funcionario/pg-funcionario.component';
import { OrcamentoclienteComponent } from './components/orcamentocliente/orcamentocliente.component';
import { SolicitabertafuncComponent } from './components/solicitabertafunc/solicitabertafunc.component';
import { AplicarmanutencaoComponent } from './components/aplicarmanutencao/aplicarmanutencao.component';
import { EfetuarorcamentoComponent } from './components/efetuarorcamento/efetuarorcamento.component';
import { FinalizarsolicitComponent } from './components/finalizarsolicit/finalizarsolicit.component';
import { VisualizarservicosComponent } from './components/visualizarservicos/visualizarservicos.component';
import { PagarservicoComponent } from './components/pagarservico/pagarservico.component';
import { ListarFuncionarioComponent } from './components/listar-funcionario/listar-funcionario.component';
import { InserirFuncionarioComponent } from './components/inserir-funcionario/inserir-funcionario.component';
import { EditarFuncionarioComponent } from './components/editar-funcionario/editar-funcionario.component';
import { ListarCategoriaComponent } from './components/listar-categoria/listar-categoria.component';
import { InserirCategoriaComponent } from './components/inserir-categoria/inserir-categoria.component';
import { RelatoriodataComponent } from './components/relatoriodata/relatoriodata.component';
import { RelatorioCategoriaComponent } from './components/relatoriocategoria/relatoriocategoria.component';
// import { ExcluirCategoriaComponent } from './components/excluir-categoria/excluir-categoria.component';
import { AtualizarCategoriaComponent } from './components/atualizar-categoria/atualizar-categoria.component';
import { authGuard } from './auth/auth.guard';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { 'path': 'login', component: LoginComponent },
    {

        'path': 'pgcliente',
        component: PgClienteComponent,
        // o que precisa add permissoes de rotas
        canActivate: [authGuard],
        data: {
            role: ['CLIENTE']
        }
    },
    // 
    { 'path': 'cadastro', component: CadastroComponent },
    {
        'path': 'pgfuncionario',
        component: PgFuncionarioComponent,
        canActivate: [authGuard],
        data: {
            role: ["ADMIN", "FUNCIONARIO"]

        }
    },
    {
        'path': 'orcamentocliente',
        component: OrcamentoclienteComponent,
        data: {
            role: ['CLIENTE']
        }

    },
    {
        'path': 'solicitabertas',
        component: SolicitabertafuncComponent,
        data: {
            role: ['FUNCIONARIO']
        }
    },
    {
        'path': 'aplicarmanutencao/:id',
        component: AplicarmanutencaoComponent,
        data: {
            role: ['FUNCIONARIO']
        }
    },
    {
        'path': 'solicitacao/redirecionar/:id',
        component: AplicarmanutencaoComponent,
        data: {
            role: ['FUNCIONARIO']
        }
    },
    {
        'path': 'efetuarorcamento/:id',
        component: EfetuarorcamentoComponent,
        canActivate: [authGuard],
        data: {
            role: [ 'FUNCIONARIO']
        }
    },
    {
        'path': 'finalizarsolicitacao',
        component: FinalizarsolicitComponent,
        canActivate: [authGuard],
        data: {
            role: [ 'FUNCIONARIO']
        }
    },

    {
        'path': 'finalizarsolicitacao/:id',
        component: FinalizarsolicitComponent,
        canActivate: [authGuard],
        data: {
            role: [ 'FUNCIONARIO']
        }
    },
    {
        'path': 'visualizarservicos',
        component: VisualizarservicosComponent,
        canActivate: [authGuard],
        data: {
            role: [ 'FUNCIONARIO', 'CLIENTE']
        }
    },
    {
        'path': 'novasolicitacao',
        component: NovaSolicitacaoComponent,
        canActivate: [authGuard],
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
        'path': 'relatoriodata',
        component: RelatoriodataComponent,
        canActivate: [authGuard],
        data: {
            role: ['FUNCIONARIO']
        }
    },
    {
        'path': 'relatorioCategoria',
        component: RelatorioCategoriaComponent,
        canActivate: [authGuard],
        data: {
            role: ['FUNCIONARIO']

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
];
