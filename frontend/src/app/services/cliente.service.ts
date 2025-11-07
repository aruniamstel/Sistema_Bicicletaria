import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Cliente } from '../shared/models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private storageKey = 'clientes';

  private getAllFromStorage(): Cliente[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveAllToStorage(clientes: Cliente[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(clientes));
  }

  getAll(): Observable<Cliente[]> {
    return of(this.getAllFromStorage());
  }

  getById(id: number): Observable<Cliente> {
    const cliente = this.getAllFromStorage().find(c => c.id === id);
    return of(cliente!);
  }

  getByTelefone(telefone: string): Observable<Cliente> {
    const cliente = this.getAllFromStorage().find(c => c.telefone === telefone);
    return of(cliente!);
  }

  create(cliente: Cliente): Observable<Cliente> {
    const clientes = this.getAllFromStorage();
    const newId = clientes.length > 0 ? Math.max(...clientes.map(c => c.id || 0)) + 1 : 1;
    const newCliente = { ...cliente, id: newId };
    clientes.push(newCliente);
    this.saveAllToStorage(clientes);
    return of(newCliente);
  }

  update(id: number, cliente: Cliente): Observable<Cliente> {
    const clientes = this.getAllFromStorage();
    const idx = clientes.findIndex(c => c.id === id);
    if (idx !== -1) {
      clientes[idx] = { ...cliente, id };
      this.saveAllToStorage(clientes);
      return of(clientes[idx]);
    }
    return throwError(() => 'Cliente não encontrado');
  }

  delete(id: number): Observable<void> {
    let clientes = this.getAllFromStorage();
    clientes = clientes.filter(c => c.id !== id);
    this.saveAllToStorage(clientes);
    return of(void 0);
  }

  registrarCliente(cliente: Cliente): Observable<Cliente> {
    return this.create(cliente);
  }
}
