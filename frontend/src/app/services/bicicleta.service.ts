import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Bicicleta } from '../shared/models/bicicleta.model';

@Injectable({ providedIn: 'root' })
export class BicicletaService {
  private storageKey = 'bicicletas';

  private getAllFromStorage(): Bicicleta[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveAllToStorage(bicicletas: Bicicleta[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(bicicletas));
  }

  getAll(): Observable<Bicicleta[]> {
    return of(this.getAllFromStorage());
  }

  getById(id: number): Observable<Bicicleta> {
    const bicicleta = this.getAllFromStorage().find(b => b.id === id);
    return of(bicicleta!);
  }

  getByCliente(clienteId: number): Observable<Bicicleta[]> {
    return of(this.getAllFromStorage().filter(b => b.cliente && b.cliente.id === clienteId));
  }

  create(bicicleta: Bicicleta): Observable<Bicicleta> {
    const bicicletas = this.getAllFromStorage();
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    let cliente = bicicleta.cliente;
    if (cliente && cliente.id) {
      cliente = clientes.find((c: any) => c.id === cliente.id) || cliente;
    }
    const newId = bicicletas.length > 0 ? Math.max(...bicicletas.map(b => b.id || 0)) + 1 : 1;
    const newBicicleta = { ...bicicleta, id: newId, cliente };
    bicicletas.push(newBicicleta);
    this.saveAllToStorage(bicicletas);
    return of(newBicicleta);
  }
}