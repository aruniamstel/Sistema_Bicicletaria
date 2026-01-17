import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  CalendarModule, 
  CalendarEvent, 
  CalendarView, 
  DateAdapter 
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { addMonths, subMonths, startOfToday } from 'date-fns'; // Importações necessárias
import { OrdemServico } from '../../shared/models/ordem-servico.model';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent,
    CalendarModule // Removido o .forRoot daqui para evitar conflitos em standalone
  ],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css'],
})
export class AgendaComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.carregarOrdensServico();
  }

  carregarOrdensServico(): void {
    const ordensData = localStorage.getItem('ordens-servico');
    if (ordensData) {
      const ordens: OrdemServico[] = JSON.parse(ordensData);
      this.events = ordens.map(os => this.mapearParaCalendarEvent(os));
    }
  }

  // FUNÇÕES DE NAVEGAÇÃO (Faltavam no seu código)
  next(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  previous(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  today(): void {
    this.viewDate = startOfToday();
  }

  mapearParaCalendarEvent(os: OrdemServico): CalendarEvent {
    // Lógica para definir a data de entrega (previsão ou entrada + 3 dias)
    let dataEntrega: Date;
    
    // Se tem dataPrevisaoSaida e ela é uma string válida
    if (os.dataPrevisaoSaida && os.dataPrevisaoSaida.trim()) {
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

  eventClicked({ event }: { event: CalendarEvent }): void {
  if (event.id) {
    this.router.navigate(['/ordens-servico', event.id]);
  }
  }
}