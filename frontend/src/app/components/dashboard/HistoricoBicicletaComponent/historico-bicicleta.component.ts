import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdemServico } from '../../../shared/models/ordem-servico.model';
import { OrdemServicoService } from '../../../services/ordem-servico.service';

@Component({
  selector: 'app-historico-bicicleta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-bicicleta.component.html',
  styleUrls: ['./historico-bicicleta.component.css']
})
export class HistoricoBicicletaComponent implements OnChanges, OnDestroy {
  @Input() idBicicleta: number | null = null;
  @Output() fechar = new EventEmitter<void>();

  historico: OrdemServico[] = [];
  loading: boolean = false;
  errorMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(private ordemServicoService: OrdemServicoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idBicicleta'] && this.idBicicleta) {
      this.carregarHistorico();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega ordens de serviço para uma bicicleta específica via API
   * Usa endpoint específico: GET /ordens-servico/bicicleta/{id}
   */
  carregarHistorico(): void {
    if (!this.idBicicleta) return;

    this.loading = true;
    this.errorMessage = '';

    this.ordemServicoService.getByBicicleta(this.idBicicleta)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ordens: OrdemServico[]) => {
          console.log(`✅ Histórico carregado para bicicleta ${this.idBicicleta}:`, ordens.length);
          
          // Ordena pelas mais recentes
          this.historico = ordens.sort((a, b) => {
            const dataA = new Date(a.dataEntrada).getTime();
            const dataB = new Date(b.dataEntrada).getTime();
            return dataB - dataA; // Descendente: mais recentes primeiro
          });
          
          this.loading = false;
        },
        error: (error) => {
          console.error(`❌ Erro ao carregar histórico da bicicleta ${this.idBicicleta}:`, error);
          this.errorMessage = 'Erro ao carregar histórico da bicicleta. Tente novamente.';
          this.historico = [];
          this.loading = false;
        }
      });
  }

  /**
   * Formata serviços realizados na ordem
   */
  getServicosRealizados(os: OrdemServico): string {
    if (!os.servicos || os.servicos.length === 0) {
      return 'Nenhum serviço';
    }
    return os.servicos
      .map((s: any) => s.servico?.descricao || 'Serviço')
      .join(', ');
  }

  /**
   * Retorna classe CSS baseada no status
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'ABERTA': return 'status-aberta';
      case 'EM_ANDAMENTO': return 'status-andamento';
      case 'CONCLUIDA': return 'status-concluida';
      case 'ENTREGUE': return 'status-entregue';
      default: return '';
    }
  }

  /**
   * Formata status em português
   */
  formatStatus(status: string): string {
    switch (status) {
      case 'ABERTA': return 'Aberta';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'CONCLUIDA': return 'Concluída';
      case 'ENTREGUE': return 'Entregue';
      default: return status;
    }
  }

  /**
   * Emite evento para fechar o modal no componente pai
   */
  fecharModal(): void {
    this.fechar.emit();
  }
}