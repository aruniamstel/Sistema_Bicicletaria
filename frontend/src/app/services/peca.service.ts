import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Peca } from '../shared/models/peca.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PecaService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.pecas}`;

  constructor(private http: HttpClient) {}

  /**
   * Busca todas as peças
   */
  getAll(): Observable<Peca[]> {
    return this.http.get<Peca[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca uma peça por ID
   */
  getById(id: number): Observable<Peca> {
    return this.http.get<Peca>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cria uma nova peça
   */
  create(peca: Peca): Observable<any> {
    return this.http.post<any>(this.apiUrl, peca)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza uma peça existente
   */
  update(id: number, peca: Peca): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, peca)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Deleta uma peça
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
    let errorMessage = 'Erro ao processar requisição de peça';
    
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