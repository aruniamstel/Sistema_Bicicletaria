import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Servico } from '../shared/models/servico.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServicoService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.servicos}`;

  constructor(private http: HttpClient) {}

  /**
   * Busca todos os serviços
   */
  getAll(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca um serviço por ID
   */
  getById(id: number): Observable<Servico> {
    return this.http.get<Servico>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cria um novo serviço
   */
  create(servico: Servico): Observable<any> {
    return this.http.post<any>(this.apiUrl, servico)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza um serviço existente
   */
  update(id: number, servico: Servico): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, servico)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Deleta um serviço
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Tratamento de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro ao processar requisição de serviço';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      errorMessage = error.error?.error || error.error?.message || `Código: ${error.status}`;
    }
    
    console.error('❌ Erro HTTP:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}