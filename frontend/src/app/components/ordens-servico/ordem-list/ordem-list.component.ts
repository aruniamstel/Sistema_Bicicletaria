import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrdemServico } from '../../../shared/models/ordem-servico.model';
import { OrdemServicoService } from '../../../services/ordem-servico.service';
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
    private router: Router
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
        console.log('📊 Número de ordens:', data.length);
        
        this.ordensServico = data;
        this.applyFilters();
        this.loading = false;
        
        console.log('🎯 Ordens após filtro:', this.filteredOrdens.length);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar ordens:', error);
        this.error = 'Erro ao carregar ordens de serviço: ' + error.message;
        this.loading = false;
        this.ordensServico = [];
        this.filteredOrdens = [];
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
      filtered = filtered.filter(ordem => 
        ordem.bicicleta.cliente.nome.toLowerCase().includes(term) ||
        ordem.bicicleta.marca.toLowerCase().includes(term) ||
        ordem.bicicleta.modelo.toLowerCase().includes(term)
      );
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
      next: (updatedOrdem) => {
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
}