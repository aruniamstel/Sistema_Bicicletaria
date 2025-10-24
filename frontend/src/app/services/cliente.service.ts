import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClienteDTO } from '../shared/models/cliente.model'; 

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:8080/usuarios/novocliente'; 

  constructor(private http: HttpClient) {}

  registrarCliente(clienteDTO: ClienteDTO): Observable<any> {
    return this.http.post(this.apiUrl, clienteDTO)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.message || 'Algo deu errado!');
  }
}
