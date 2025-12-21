import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Peca } from '../shared/models/peca.model';

@Injectable({
  providedIn: 'root'
})
export class PecaService {
private apiUrl = 'http://localhost:8081';
  private readonly API = `${this.apiUrl}/pecas`; // Ajuste conforme sua rota no Spring

  constructor(private http: HttpClient) {}

  getAll(): Observable<Peca[]> {
    return this.http.get<Peca[]>(this.API);
  }

  getById(id: number): Observable<Peca> {
    return this.http.get<Peca>(`${this.API}/${id}`);
  }

  create(peca: Peca): Observable<Peca> {
    return this.http.post<Peca>(this.API, peca);
  }
}