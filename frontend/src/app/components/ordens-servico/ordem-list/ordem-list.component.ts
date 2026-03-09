import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrdemServico } from '../../../shared/models/ordem-servico.model';
import { OrdemServicoService } from '../../../services/ordem-servico.service';
import { ExportarService } from '../../../services/exportar.service';
import { HeaderComponent } from "../../header/header.component";

@Component({
  selector: 'app-ordem-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './ordem-list.component.html',
  styleUrls: ['./ordem-list.component.css']
})
export class OrdemListComponent implements OnInit {
  ordensServico: OrdemServico[] = [];
  filteredOrdens: OrdemServico[] = [];
  statusFilter: string = '';
  searchTerm: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(
    private ordemService: OrdemServicoService,
    private router: Router,
    private exportarService: ExportarService
  ) { }

   ngOnInit(): void {
    console.log('🔄 OrdemListComponent iniciado');
    this.loadOrdensServico();
  }

  loadOrdensServico(): void {
    this.loading = true;
    this.error = '';
    console.log('📡 Buscando ordens de serviço...');
    
    this.ordemService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Dados recebidos:', data);
        
        // Tratar null ou undefined como array vazio
        const ordensRecebidas = data && Array.isArray(data) ? data : [];
        console.log('📊 Número de ordens:', ordensRecebidas.length);
        
        // ⭐ Debug: Logar valorTotal de cada ordem
        ordensRecebidas.forEach(ordem => {
          console.log(`Ordem #${ordem.id}: valorTotal = ${ordem.valorTotal}, servicos = ${ordem.servicos?.length || 0}, pecas = ${ordem.pecas?.length || 0}`);
        });
        
        this.ordensServico = ordensRecebidas;
        this.applyFilters();
        this.loading = false;
        
        console.log('🎯 Ordens após filtro:', this.filteredOrdens.length);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar ordens:', error);
        this.error = 'Erro ao carregar ordens de serviço: ' + error.message;
        this.ordensServico = [];
        this.filteredOrdens = [];
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    console.log('🔍 Aplicando filtros...');
    console.log('📋 Total de ordens:', this.ordensServico.length);
    
    let filtered = this.ordensServico;

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(ordem => ordem.status === this.statusFilter);
      console.log('🎯 Após filtro de status:', filtered.length);
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ordem => {
        // Buscar no cliente (sempre existe)
        const matchCliente = ordem.cliente?.nome?.toLowerCase().includes(term) || false;
        
        // Buscar nas bicicletas (agora é array)
        const matchBicicleta = ordem.bicicletas && ordem.bicicletas.length > 0
          ? ordem.bicicletas.some(bike => 
              bike.marca?.toLowerCase().includes(term) ||
              bike.modelo?.toLowerCase().includes(term))
          : false;
        
        return matchCliente || matchBicicleta;
      });
      console.log('🔎 Após filtro de busca:', filtered.length);
    }

    this.filteredOrdens = filtered;
    console.log('✅ Filtros aplicados. Ordens filtradas:', this.filteredOrdens.length);
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ABERTA': return 'status-aberta';
      case 'EM_ANDAMENTO': return 'status-andamento';
      case 'CONCLUIDA': return 'status-concluida';
      case 'ENTREGUE': return 'status-entregue';
      default: return '';
    }
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'ABERTA': return 'Aberta';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'CONCLUIDA': return 'Concluída';
      case 'ENTREGUE': return 'Entregue';
      default: return status;
    }
  }

  navigateToDetails(id: number): void {
    this.router.navigate(['/ordens-servico', id]);
  }

  updateStatus(ordem: OrdemServico, newStatus: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE'): void {
    this.ordemService.updateStatus(ordem.id!, newStatus).subscribe({
      next: (response) => {
        // Handle both old format (direct order) and new format ({ message, ordem })
        const updatedOrdem = response.ordem || response;
        const index = this.ordensServico.findIndex(o => o.id === ordem.id);
        if (index !== -1) {
          this.ordensServico[index] = updatedOrdem;
          this.applyFilters();
        }
      },
      error: (error) => {
        this.error = 'Erro ao atualizar status: ' + error.message;
      }
    });
  }

  /**
   * Exporta dados de ordens de serviço em CSV
   */
  exportarOrdensCSV(): void {
    this.loading = true;
    this.error = '';
    
    this.exportarService.exportarEBaixar('ordens', `ordens_servico_${new Date().getTime()}.csv`)
      .subscribe({
        next: () => {
          this.loading = false;
          // Recarrega para resetar o estado
          this.loadOrdensServico();
        },
        error: (error) => {
          console.error('❌ Erro ao exportar ordens:', error);
          this.error = 'Erro ao exportar ordens. Tente novamente.';
          this.loading = false;
        }
      });
  }

  /**
   * Gera e baixa o PDF de uma ordem de serviço
   */
  gerarPDF(ordemId: number): void {
    
    console.log('📄 Gerando PDF para ordem #' + ordemId);
    
    this.ordemService.downloadPdf(ordemId).subscribe({
      next: (blob) => {
        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ordem-servico-${ordemId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('✅ PDF baixado com sucesso');
      },
      error: (error) => {
        console.error('❌ Erro ao gerar PDF:', error);
        this.error = 'Erro ao gerar PDF. Tente novamente.';
      }
    });
  }

  /**
   * Reverte o status de ENTREGUE para EM_ANDAMENTO
   */
  revertStatus(ordem: OrdemServico): void {
    if (ordem.status !== 'ENTREGUE') {
      this.error = 'Apenas ordens entregues podem ser revertidas.';
      return;
    }

    const confirmacao = confirm(
      `Tem certeza que deseja reverter a ordem #${ordem.id} de ENTREGUE para EM ANDAMENTO?`
    );

    if (!confirmacao) {
      return;
    }

    this.ordemService.updateStatus(ordem.id!, 'EM_ANDAMENTO').subscribe({
      next: (response) => {
        const updatedOrdem = response.ordem || response;
        const index = this.ordensServico.findIndex(o => o.id === ordem.id);
        if (index !== -1) {
          this.ordensServico[index] = updatedOrdem;
          this.applyFilters();
          console.log('✅ Status revertido com sucesso');
        }
      },
      error: (error) => {
        console.error('❌ Erro ao reverter status:', error);
        this.error = 'Erro ao reverter status: ' + error.message;
      }
    });
  }
}