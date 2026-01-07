import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarModule, CalendarEvent, CalendarView, CalendarDateFormatter, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { OrdemServico } from '../../shared/models/ordem-servico.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
    CalendarDateFormatter,
  ],
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

  mapearParaCalendarEvent(os: OrdemServico): CalendarEvent {
    // Usar dataPrevisaoSaida ou dataEntrada + 3 dias
    let dataEntrega = os.dataPrevisaoSaida ? new Date(os.dataPrevisaoSaida) : new Date(os.dataEntrada);
    if (!os.dataPrevisaoSaida) {
      dataEntrega.setDate(dataEntrega.getDate() + 3);
    }

    const titulo = `${os.bicicleta.marca} ${os.bicicleta.modelo} - Cliente: ${os.cliente.nome}`;

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
        return { primary: '#FFC107', secondary: '#FFF3CD' }; // Amarelo
      case 'CONCLUIDA':
        return { primary: '#28A745', secondary: '#D4EDDA' }; // Verde
      case 'ENTREGUE':
        return { primary: '#6C757D', secondary: '#E2E3E5' }; // Cinza
      default:
        return { primary: '#007BFF', secondary: '#CCE5FF' }; // Azul
    }
  }

  eventClicked(event: CalendarEvent): void {
    if (event.id) {
      this.router.navigate(['/ordem-servico', event.id]);
    }
  }

  setView(view: CalendarView): void {
    this.view = view;
  }

  today(): void {
    this.viewDate = new Date();
  }

  previous(): void {
    const current = new Date(this.viewDate);
    current.setMonth(current.getMonth() - 1);
    this.viewDate = current;
  }

  next(): void {
    const current = new Date(this.viewDate);
    current.setMonth(current.getMonth() + 1);
    this.viewDate = current;
  }
}
