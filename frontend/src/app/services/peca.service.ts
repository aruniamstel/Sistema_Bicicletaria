import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Peca } from '../shared/models/peca.model';

@Injectable({ providedIn: 'root' })
export class PecaService {
  getAll(): Observable<Peca[]> {
    const data = localStorage.getItem('pecas');
    return of(data ? JSON.parse(data) : []);
  }
}