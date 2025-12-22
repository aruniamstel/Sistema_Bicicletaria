import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Servico } from '../shared/models/servico.model';

@Injectable({ providedIn: 'root' })
export class ServicoService {
  getAll(): Observable<Servico[]> {
    const data = localStorage.getItem('servicos');
    return of(data ? JSON.parse(data) : []);
  }
}