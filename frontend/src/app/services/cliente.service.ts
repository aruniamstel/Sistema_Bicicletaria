import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Cliente } from '../shared/models/cliente.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.clientes}`;

  constructor(private http: HttpClient) {}

  /**
   * Busca todos os clientes
   */
  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca um cliente por ID
   */
  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca um cliente por telefone
   */
  getByTelefone(telefone: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/telefone/${telefone}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca clientes por nome (com parâmetro de query)
   */
  getByNome(nome: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/buscar?nome=${nome}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca um cliente com suas bicicletas
   */
  getComBicicletas(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}/com-bicicletas`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cria um novo cliente
   */
  create(cliente: Cliente): Observable<any> {
    return this.http.post<any>(this.apiUrl, cliente)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza um cliente existente
   */
  update(id: number, cliente: Cliente): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, cliente)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Deleta um cliente
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Registra um novo cliente (alias para create)
   */
  registrarCliente(cliente: Cliente): Observable<any> {
    return this.create(cliente);
  }

  /**
   * Tratamento de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro ao processar requisição';
    
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
