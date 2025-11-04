import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrdemServico } from '../shared/models/ordem-servico.model';

@Injectable({
  providedIn: 'root'
})
export class OrdemServicoService {
  private apiUrl = 'http://localhost:8081/api/ordens-servico';

  constructor(private http: HttpClient) { }

  getAll(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.apiUrl);
  }

  getById(id: number): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.apiUrl}/${id}`);
  }

  create(ordem: OrdemServico): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.apiUrl, ordem);
  }

  addServico(ordemId: number, servicoId: number, quantidade: number): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(`${this.apiUrl}/${ordemId}/servicos`, {
      servicoId,
      quantidade
    });
  }

  addPeca(ordemId: number, pecaId: number, quantidade: number): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(`${this.apiUrl}/${ordemId}/pecas`, {
      pecaId,
      quantidade
    });
  }

  updateStatus(id: number, status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE'): Observable<OrdemServico> {
    return this.http.put<OrdemServico>(`${this.apiUrl}/${id}/status`, { status });
  }

  getValorTotal(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${id}/valor-total`);
  }
}