import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdemServico } from '../../../shared/models/ordem-servico.model';

@Component({
  selector: 'app-historico-bicicleta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-bicicleta.component.html',
  styleUrls: ['./historico-bicicleta.component.css']
})
export class HistoricoBicicletaComponent implements OnChanges {
  @Input() idBicicleta: number | null = null;
  historico: OrdemServico[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idBicicleta'] && this.idBicicleta) {
      this.carregarHistorico();
    }
  }

  carregarHistorico(): void {
    if (!this.idBicicleta) return;

    const ordens = localStorage.getItem('ordens-servico');
    if (ordens) {
      const todasOrdens: OrdemServico[] = JSON.parse(ordens);
      this.historico = todasOrdens.filter(os => os.bicicleta.id === this.idBicicleta);
    }
  }

  getServicosRealizados(os: OrdemServico): string {
    if (!os.servicos || os.servicos.length === 0) return 'Nenhum serviço';
    return os.servicos.map(s => s.servico.descricao).join(', ');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ABERTA': return 'aberta';
      case 'EM_ANDAMENTO': return 'em-andamento';
      case 'CONCLUIDA': return 'concluida';
      case 'ENTREGUE': return 'entregue';
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
}