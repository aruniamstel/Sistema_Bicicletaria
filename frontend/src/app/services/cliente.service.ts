import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Cliente } from '../shared/models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  // Use backend base URL for clientes
  private apiUrl = 'http://localhost:8081/clientes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  getByTelefone(telefone: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/telefone/${telefone}`).pipe(catchError(this.handleError));
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente).pipe(catchError(this.handleError));
  }

  update(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  // Backwards-compatibility helper
  registrarCliente(cliente: Cliente): Observable<Cliente> {
    return this.create(cliente);
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error?.message || 'Algo deu errado!');
  }
}
