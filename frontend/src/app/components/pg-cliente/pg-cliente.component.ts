import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { NgFor, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { SolicitacaoService } from '../../services/solicitacao.service';

@Component({
  selector: 'app-pg-cliente',
  standalone: true,
  imports: [HeaderComponent, NgFor, CommonModule, RouterModule],
  templateUrl: './pg-cliente.component.html',
  styleUrls: ['./pg-cliente.component.css'],
})
export class PgClienteComponent implements OnInit {
  solicitacoes: Solicitacao[] = [];
  filteredRequests: Solicitacao[] = [];
  solicitacaoSelecionada: Solicitacao | null = null;
  historicoPassos: any[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private solicitacaoService: SolicitacaoService
  ) {}

  ngOnInit() {
    this.solicitacaoService.listarSolicitacoes().subscribe(
      (data: Solicitacao[]) => {
        this.solicitacoes = data;
        this.filteredRequests = [...data];
      },
      (error) => {
        console.error('Erro ao carregar as Ordens de serviço:', error);
      }
    );
  }

  abrirModal(solicitacao: Solicitacao): void {
    this.solicitacaoSelecionada = solicitacao;
  
    // Histórico dinâmico (substitua com dados reais se disponíveis)
    this.historicoPassos = [
      { dataHora: '2024-09-14 10:00', funcionario: solicitacao.funcionario.nome, estado: 'CRIADA' },
      { dataHora: '2024-09-15 14:30', funcionario: solicitacao.funcionario.nome, estado: 'ORÇADA' },
    ];
  
    const modal = document.getElementById('solicitacaoModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
    }
  }
  
  shouldShowActionButton(status: string): boolean {
    const allowedStatuses = ['ORÇADA', 'REJEITADA', 'ARRUMADA'];
    return allowedStatuses.includes(status);
  }

  fecharModal(): void {
    this.solicitacaoSelecionada = null;
    this.historicoPassos = [];
    const modal = document.getElementById('solicitacaoModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  efetuarAcao(solicitacao: Solicitacao) {
    switch (solicitacao.status) {
      case "REJEITADA":
        this.solicitacaoService.resgatarServico(solicitacao.id).subscribe({
          next: () => console.log(`Serviço ${solicitacao.id} resgatado com sucesso.`),
          error: (err) => console.error(`Erro ao resgatar o serviço: ${err.message}`)
        });
        window.location.reload();
        break;
      case "ABERTA":
        this.router.navigate(["efetuarorcamento", solicitacao.id]);
        break;
      case "ARRUMADA":
        this.router.navigate(["pagarservico", solicitacao.id])
        break;
      case "APROVADA":
        this.router.navigate(["aplicarmanutencao"]);
        break;
      case "PAGA":
        this.router.navigate(["finalizarsolicitacao"]);
        break;
      case "ORÇADA":
        this.router.navigate(["orcamentocliente", solicitacao.id]);
        break;
      default:
        break;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ORÇADA': return 'orcada';
      case 'REJEITADA': return 'rejeitada';
      case 'ABERTA': return 'aberta';
      case 'ARRUMADA': return 'arrumada';
      case 'APROVADA': return 'aprovada';
      case 'PAGA': return 'paga';
      case 'FINALIZADA': return 'finalizada';
      case 'REDIRECIONADA': return 'redirecionada';
      case 'AGUARDANDO PAGAMENTO': return 'aguardandoPagamento';
      default: return '';
    }
  }

  getActionButtonText(status: string): string {
    switch (status) {
      case 'ORÇADA': return 'Aprovar/Rejeitar serviço';
      case 'REJEITADA': return 'Resgatar Serviço';
      case 'ABERTA': return '';
      case 'ARRUMADA': return 'Pagar Serviço';
      case 'APROVADA': return '';
      case 'PAGA': return '';
      case 'AGUARDANDO PAGAMENTO': return 'Aguardando Pagamento';
      default: return 'Visualizar serviço';
    }
  }

  getActionButtonClass(status: string): string {
    switch (status) {
      case 'ORÇADA': return 'orcada';
      case 'REJEITADA': return 'rejeitar';
      case 'ABERTA': return 'aberta';
      case 'ARRUMADA': return 'arrumada';
      case 'PAGA': return 'paga';
      case 'FINALIZADA': return '';
      case 'AGUARDANDO PAGAMENTO': return 'aguardandoPagamento';
      default: return 'visualizarServico';
    }
  }
}
