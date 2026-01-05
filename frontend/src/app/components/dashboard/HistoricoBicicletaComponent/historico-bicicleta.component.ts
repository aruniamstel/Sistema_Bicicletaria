import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Nota: Certifique-se que o caminho da interface está correto para o seu projeto
export interface OrdemServico {
  id?: number;
  status: string;
  dataEntrada: string;
  valorTotal: number;
  bicicleta: { id: number };
  servicos?: any[];
}

@Component({
  selector: 'app-historico-bicicleta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-bicicleta.component.html',
  styleUrls: ['./historico-bicicleta.component.css']
})
export class HistoricoBicicletaComponent implements OnChanges {
  @Input() idBicicleta: number | null = null;
  @Output() fechar = new EventEmitter<void>(); // Necessário para o botão de fechar funcionar

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
      // Filtra as ordens que pertencem a esta bicicleta específica
      this.historico = todasOrdens.filter(os => os.bicicleta && os.bicicleta.id === this.idBicicleta);
      
      // Ordena pelas mais recentes
      this.historico.sort((a, b) => new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime());
    }
  }

  getServicosRealizados(os: OrdemServico): string {
    if (!os.servicos || os.servicos.length === 0) return 'Nenhum serviço';
    return os.servicos.map(s => s.servico?.descricao || 'Serviço').join(', ');
  }

  // Corrigido para retornar as classes que você provavelmente tem no CSS
  getStatusClass(status: string): string {
    switch (status) {
      case 'ABERTA': return 'status-aberta';
      case 'EM_ANDAMENTO': return 'status-andamento';
      case 'CONCLUIDA': return 'status-concluida';
      case 'ENTREGUE': return 'status-entregue';
      default: return '';
    }
  }

  // Função que faltava e estava quebrando o HTML
  formatStatus(status: string): string {
    switch (status) {
      case 'ABERTA': return 'Aberta';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'CONCLUIDA': return 'Concluída';
      case 'ENTREGUE': return 'Entregue';
      default: return status;
    }
  }

  fecharModal(): void {
    this.fechar.emit();
  }
}