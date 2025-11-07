import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrdemServico } from '../../../shared/models/ordem-servico.model';
import { OrdemServicoService } from '../../../services/ordem-servico.service';

@Component({
  selector: 'app-ordem-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    this.loadOrdensServico();
  }

  loadOrdensServico(): void {
    this.loading = true;
    this.ordemService.getAll().subscribe({
      next: (data) => {
        this.ordensServico = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar ordens de serviço: ' + error.message;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = this.ordensServico;

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(ordem => ordem.status === this.statusFilter);
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ordem => 
        ordem.bicicleta.cliente.nome.toLowerCase().includes(term) ||
        ordem.bicicleta.marca.toLowerCase().includes(term) ||
        ordem.bicicleta.modelo.toLowerCase().includes(term) ||
        ordem.problemaRelatado.toLowerCase().includes(term)
      );
    }

    this.filteredOrdens = filtered;
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