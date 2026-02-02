import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Bicicleta } from '../shared/models/bicicleta.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BicicletaService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.bicicletas}`;

  constructor(private http: HttpClient) {}

  /**
   * Busca todas as bicicletas
   */
  getAll(): Observable<Bicicleta[]> {
    return this.http.get<Bicicleta[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca uma bicicleta por ID
   */
  getById(id: number): Observable<Bicicleta> {
    return this.http.get<Bicicleta>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca bicicletas de um cliente específico
   */
  getByCliente(clienteId: number): Observable<Bicicleta[]> {
    return this.http.get<Bicicleta[]>(`${this.apiUrl}/cliente/${clienteId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cria uma nova bicicleta
   */
  create(bicicleta: Bicicleta): Observable<any> {
    return this.http.post<any>(this.apiUrl, bicicleta)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza uma bicicleta existente
   */
  update(id: number, bicicleta: Bicicleta): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, bicicleta)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Deleta uma bicicleta
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
    let errorMessage = 'Erro ao processar requisição de bicicleta';
    
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