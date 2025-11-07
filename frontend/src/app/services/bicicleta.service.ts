import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bicicleta } from '../shared/models/bicicleta.model';

@Injectable({
  providedIn: 'root'
})
export class BicicletaService {
  private apiUrl = 'http://localhost:8081/bicicletas';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Bicicleta[]> {
    return this.http.get<Bicicleta[]>(this.apiUrl);
  }

  getById(id: number): Observable<Bicicleta> {
    return this.http.get<Bicicleta>(`${this.apiUrl}/${id}`);
  }

  getByCliente(clienteId: number): Observable<Bicicleta[]> {
    return this.http.get<Bicicleta[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  create(bicicleta: Bicicleta): Observable<Bicicleta> {
    return this.http.post<Bicicleta>(this.apiUrl, bicicleta);
  }
}