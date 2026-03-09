import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdemServicoService } from '../../services/ordem-servico.service';
import { OrdemServico } from '../../shared/models/ordem-servico.model';
import { HeaderComponent } from "../header/header.component";

// Interface para representar cada linha do histórico
interface HistoricoItem {
  ordemId: number;
  dataEntrega: string;  // Formato: 'DD/MM/YYYY HH:mm' ou 'Em aberto'
  nomeCliente: string;
  telefone: string;
  modeloBicicleta: string;
  descricaoItem: string;  // "Serviço: Nome" ou "Peça: Nome"
  valor: number;
  tipo: 'servico' | 'peca';
}

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css']
})
export class HistoricoComponent implements OnInit, OnDestroy {
  // Dados originais
  allHistorico: HistoricoItem[] = [];
  
  // Dados filtrados (exibidos na tabela)
  historicoFiltrado: HistoricoItem[] = [];
  
  // Estados
  loading = true;
  error = '';
  
  // Filtros
  filtroCliente = '';
  filtroServicoOuPeca = '';
  filtroData = '';  // Data no formato YYYY-MM-DD (input type="date")
  filtroTelefone = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private ordemServicoService: OrdemServicoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarHistorico();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega e processa todas as ordens para gerar o histórico
   */
    carregarHistorico(): void {
        this.loading = true;
        this.error = null;

        this.ordemServicoService.getAll()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (response: any) => {
            // AJUSTE AQUI: Verifica se a lista está em 'response', 'response.content' ou se é o próprio response
            // Tratar null ou undefined como array vazio
            let listaOrdens = [];
            if (response) {
              listaOrdens = Array.isArray(response) ? response : (response.content || []);
            }
            
            console.log('📦 Ordens recebidas:', listaOrdens);
            
            this.allHistorico = this.processarOrdens(listaOrdens);
            this.historicoFiltrado = [...this.allHistorico];
            this.loading = false;
        },
        error: (err) => {
            console.error('❌ Erro ao carregar histórico:', err);
            this.error = 'Não foi possível carregar o histórico de serviços.';
            this.allHistorico = [];
            this.historicoFiltrado = [];
            this.loading = false;
        }
        });
    }

  /**
   * Processa array de OrdemServico para gerar array achatado de HistoricoItem
   * Cada serviço/peça gera uma linha no histórico
   */
  private processarOrdens(ordens: OrdemServico[]): HistoricoItem[] {
    const items: HistoricoItem[] = [];

    // Proteção contra dados nulos ou inválidos
     if (!ordens || !Array.isArray(ordens)) return [];

    for (const ordem of ordens) {
      if (!ordem.bicicletas || ordem.bicicletas.length === 0) {
        continue;
      }

      const dataEntrega = this.formatarData(ordem.dataSaidaReal);
      const nomeCliente = ordem.cliente?.nome || 'Cliente desconhecido';
      const telefone = ordem.cliente?.telefone || '';

      // Iterar sobre cada bicicleta com itens da ordem
      for (const bikeItem of ordem.bicicletas) {
        const modeloBicicleta = `${bikeItem.marca} ${bikeItem.modelo} ${bikeItem.cor || ''}`.trim();

        // Processar serviços desta bicicleta
        if (bikeItem.servicos && bikeItem.servicos.length > 0) {
          for (const itemServico of bikeItem.servicos) {
            if (itemServico.servico) {
              items.push({
                ordemId: ordem.id as number,
                dataEntrega,
                nomeCliente,
                telefone,
                modeloBicicleta,
                descricaoItem: `Serviço: ${itemServico.servico.descricao}`,
                valor: itemServico.servico.valor ? Number(itemServico.servico.valor) : 0,
                tipo: 'servico'
              });
            }
          }
        }

        // Processar peças desta bicicleta
        if (bikeItem.pecas && bikeItem.pecas.length > 0) {
          for (const itemPeca of bikeItem.pecas) {
            if (itemPeca.peca) {
              items.push({
                ordemId: ordem.id as number,
                dataEntrega,
                nomeCliente,
                telefone,
                modeloBicicleta,
                descricaoItem: `Peça: ${itemPeca.peca.descricao}`,
                valor: itemPeca.peca.valor ? Number(itemPeca.peca.valor) : 0,
                tipo: 'peca'
              });
            }
          }
        }
      }
    }

    return items;
  }

  /**
   * Formata data para exibição
   */
  private formatarData(data: any): string {
    if (!data) {
      return 'Em aberto';
    }

    try {
      // Se é string no formato ISO
      if (typeof data === 'string') {
        const d = new Date(data);
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }

      // Se for outro formato
      const d = new Date(data);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }

      return 'Em aberto';
    } catch {
      return 'Em aberto';
    }
  }

  /**
   * Aplica os filtros ao array allHistorico
   * Executada em tempo real quando filtros mudam
   */
  aplicarFiltros(): void {
    this.historicoFiltrado = this.allHistorico.filter(item => {
      // Filtro por cliente (case-insensitive)
      if (this.filtroCliente && !item.nomeCliente.toLowerCase().includes(this.filtroCliente.toLowerCase())) {
        return false;
      }

      // Filtro por serviço ou peça (case-insensitive)
      if (this.filtroServicoOuPeca && !item.descricaoItem.toLowerCase().includes(this.filtroServicoOuPeca.toLowerCase())) {
        return false;
      }

      // Filtro por telefone
      if (this.filtroTelefone && !item.telefone.includes(this.filtroTelefone)) {
        return false;
      }

      // Filtro por data (realizados após)
      if (this.filtroData) {
        const dataFiltro = new Date(this.filtroData);
        const dataItem = this.extrairDataDoTexto(item.dataEntrega);
        
        if (dataItem !== null && dataItem < dataFiltro) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Extrai a data do texto formatado "DD/MM/YYYY HH:mm"
   */
  private extrairDataDoTexto(textoData: string): Date | null {
    if (textoData === 'Em aberto') {
      return null;
    }

    try {
      // Formato: "DD/MM/YYYY HH:mm"
      const partes = textoData.split(' ')[0].split('/');
      if (partes.length === 3) {
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;  // Mês é 0-indexed
        const ano = parseInt(partes[2], 10);
        return new Date(ano, mes, dia);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Handlers para mudanças em filtros
   */
  onFiltroClienteChange(): void {
    this.aplicarFiltros();
  }

  onFiltroServicoOuPecaChange(): void {
    this.aplicarFiltros();
  }

  onFiltroDataChange(): void {
    this.aplicarFiltros();
  }

  onFiltroTelefoneChange(): void {
    this.aplicarFiltros();
  }

  /**
   * Limpa todos os filtros
   */
  limparFiltros(): void {
    this.filtroCliente = '';
    this.filtroServicoOuPeca = '';
    this.filtroData = '';
    this.filtroTelefone = '';
    this.aplicarFiltros();
  }

  /**
   * Navega para os detalhes da ordem de serviço
   */
  verOrdem(ordemId: number): void {
    this.router.navigate(['/ordens-servico/detalhes', ordemId]);
  }

  /**
   * Retorna a classe CSS baseada no tipo de item
   */
  getClasseTipo(tipo: 'servico' | 'peca'): string {
    return tipo === 'servico' ? 'badge-servico' : 'badge-peca';
  }

  /**
   * Conta os resultados
   */
  get totalResultados(): number {
    return this.historicoFiltrado.length;
  }

  get totalRegistros(): number {
    return this.allHistorico.length;
  }
}
