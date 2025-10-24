import { Component, OnInit } from '@angular/core';
import { HeaderfuncionarioComponent } from "../headerfuncionario/headerfuncionario.component";
import { Router } from '@angular/router';
import { NgFor, CommonModule } from '@angular/common';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { SolicitacaoService } from '../../services/solicitacao.service';

@Component({
  selector: 'app-solicitabertafunc',
  standalone: true,
  imports: [HeaderfuncionarioComponent, NgFor, CommonModule],
  templateUrl: './solicitabertafunc.component.html',
  styleUrls: ['./solicitabertafunc.component.css']
})

export class SolicitabertafuncComponent implements OnInit {

  requests: Solicitacao[] = [];
  filteredRequests: Solicitacao[] = [];
  isModalOpen: boolean = false; // Controla a exibição do modal
  selectedRequest: Solicitacao | null = null; // Solicitação selecionada para exibição no modal

  constructor(
    private router: Router, 
    private solicitacaoService: SolicitacaoService
  ) {}

  ngOnInit() {
    this.solicitacaoService.listarSolicitacoesAbertas().subscribe({
      next: (solicitacoes: Solicitacao[]) => {
        this.requests = solicitacoes;
        this.filteredRequests = [...this.requests]; // Inicializa o filtro com os dados carregados
      },
      error: (err) => {
        console.error('Erro ao carregar Ordens de serviço abertas:', err);
      }
    });

    const statusAtualizado = localStorage.getItem("statusSolicitacao");
    if (statusAtualizado) {
      const index = this.requests.findIndex(req => req.status === statusAtualizado);
      if (index !== -1) {
        this.requests[index].status = statusAtualizado;
      }
      localStorage.removeItem("statusSolicitacao");
    }
  }

  abrirModal(request: Solicitacao): void {
    this.selectedRequest = request;
    this.isModalOpen = true;
  }

  fecharModal(): void {
    this.isModalOpen = false;
    this.selectedRequest = null;
  }

  efetuarOrcamento(solicitacao: Solicitacao): void {
    this.router.navigate(['efetuarorcamento', solicitacao.id]);
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
      case 'AGUARDANDO PAGAMENTO': return 'aguardandoPagamento';
      default: return '';
    }
  }

  getActionButtonText(status: string): string {
    switch (status) {
      case 'ORÇADA': return 'Em espera de aprovação';
      case 'REJEITADA': return 'Resgatar Serviço';
      case 'ABERTA': return 'Efetuar Orçamento';
      case 'ARRUMADA': return 'Efetuar Manutenção?';
      case 'APROVADA': return 'Efetuar Manutenção';
      case 'PAGA': return 'Finalizar Solicitação';
      case 'FINALIZADA': return 'finalizada';
      case 'AGUARDANDO PAGAMENTO': return 'Aguarde Pagamento';
      default: return 'Ação Indefinida';
    }
  }

  getButtonProperties(solicitacao: Solicitacao) {
    switch (solicitacao.status) {
      case 'ABERTA':
        return {
          text: 'Efetuar Orçamento',
          class: 'aprovar',
          action: () => this.efetuarOrcamento(solicitacao)
        }; 
      case 'ARRUMADA':
        return {
          text: 'Finalizar',
          class: 'finalizar',
          action: () => alert('Serviço finalizado!')
        };
      case 'REJEITADA':
        return {
          text: 'Rejeitada',
          class: 'rejeitada',
          action: () => { }
        };
      default:
        return {
          text: 'Ação Desconhecida',
          class: '',
          action: () => { }
        };
    }
  }
}
