import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Funcionario } from '../shared/models/funcionario.model';

@Injectable({
  providedIn: 'root'
})
export class FuncionarioService {

  private apiUrl = 'http://localhost:8081/funcionario';

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Funcionario[]> {
    return this.http.get<Funcionario[]>(`${this.apiUrl}/listar`);
  }

  // Método para remover um funcionário
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remover/${id}`);
  }

   // Método para buscar um funcionário pelo ID
   buscarPorId(id: number): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.apiUrl}/buscar/${id}`);
  }

  // Método para atualizar os dados de um funcionário
  atualizar(funcionario: Funcionario): Observable<Funcionario> {
    return this.http.put<Funcionario>(`${this.apiUrl}/alterar/${funcionario.id}`, funcionario);
  }
}
