import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  CalendarModule, 
  CalendarEvent, 
  CalendarView, 
  DateAdapter 
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { addMonths, subMonths, startOfToday } from 'date-fns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdemServico } from '../../shared/models/ordem-servico.model';
import { OrdemServicoService } from '../../services/ordem-servico.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent,
    CalendarModule
  ],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css'],
})
export class AgendaComponent implements OnInit, OnDestroy {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];

  // Controle de estado
  loading = false;
  errorMessage = '';
  
  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private ordemServicoService: OrdemServicoService
  ) {}

  ngOnInit(): void {
    this.carregarOrdensServico();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega as ordens de serviço do backend
   */
  carregarOrdensServico(): void {
    this.loading = true;
    this.errorMessage = '';

    this.ordemServicoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ordens: OrdemServico[]) => {
          console.log('✅ Ordens carregadas:', ordens);
          this.events = ordens.map(os => this.mapearParaCalendarEvent(os));
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar ordens:', error);
          this.errorMessage = 'Erro ao carregar ordens de serviço. Tente novamente.';
          this.loading = false;
        }
      });
  }

  /**
   * Converte uma ordem de serviço para evento de calendário
   */
  mapearParaCalendarEvent(os: OrdemServico): CalendarEvent {
    let dataEntrega: Date;
    
    // Se tem dataPrevisaoSaida e ela é uma string válida
    if (os.dataPrevisaoSaida && os.dataPrevisaoSaida.toString().trim()) {
      dataEntrega = new Date(os.dataPrevisaoSaida);
      // Valida se a data é válida
      if (isNaN(dataEntrega.getTime())) {
        // Se a data for inválida, usa a dataEntrada + 3 dias
        dataEntrega = new Date(os.dataEntrada);
        dataEntrega.setDate(dataEntrega.getDate() + 3);
      }
    } else {
      // Se não tem dataPrevisaoSaida, usa dataEntrada + 3 dias
      dataEntrega = new Date(os.dataEntrada);
      dataEntrega.setDate(dataEntrega.getDate() + 3);
    }

    const bicicletaInfo = os.bicicleta 
      ? `${os.bicicleta.marca} ${os.bicicleta.modelo}` 
      : 'Serviço Avulso';
    
    const clienteNome = os.cliente?.nome || 'Cliente';
    const titulo = `${bicicletaInfo} - Cliente: ${clienteNome}`;

    return {
      id: os.id,
      start: dataEntrega,
      title: titulo,
      color: this.getCorPorStatus(os.status),
      meta: { os }
    };
  }

  /**
   * Retorna a cor do evento baseado no status
   */
  getCorPorStatus(status: string): any {
    switch (status) {
      case 'EM_ANDAMENTO':
        return { primary: '#FFC107', secondary: '#FFF3CD' };
      case 'CONCLUIDA':
        return { primary: '#28A745', secondary: '#D4EDDA' };
      case 'ENTREGUE':
        return { primary: '#6C757D', secondary: '#E2E3E5' };
      default:
        return { primary: '#007BFF', secondary: '#CCE5FF' };
    }
  }

  /**
   * Navega para o próximo mês
   */
  next(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  /**
   * Navega para o mês anterior
   */
  previous(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  /**
   * Volta para hoje
   */
  today(): void {
    this.viewDate = startOfToday();
  }

  /**
   * Navega para os detalhes da ordem quando clicado
   */
  eventClicked({ event }: { event: CalendarEvent }): void {
    if (event.id) {
      this.router.navigate(['/ordens-servico', event.id]);
    }
  }
}