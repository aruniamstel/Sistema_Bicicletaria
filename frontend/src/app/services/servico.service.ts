import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servico } from '../shared/models/servico.model';
//import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {
  private apiUrl = 'http://localhost:8081';  
  private readonly API = `${this.apiUrl}/servicos`; // Ajuste conforme sua rota no Spring

  constructor(private http: HttpClient) {}

  getAll(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.API);
  }

  getById(id: number): Observable<Servico> {
    return this.http.get<Servico>(`${this.API}/${id}`);
  }

  create(servico: Servico): Observable<Servico> {
    return this.http.post<Servico>(this.API, servico);
  }
}