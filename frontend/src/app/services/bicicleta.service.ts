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
    console.log('🔍 Buscando bicicletas para cliente ID:', clienteId, '(tipo:', typeof clienteId, ')');
    
    const bicicletas = this.getAllFromStorage();
    console.log('🚲 Todas as bicicletas:', bicicletas);
    
    // ✅ CORREÇÃO: Converte ambos para number antes de comparar
    const bicicletasFiltradas = bicicletas.filter(b => {
      if (!b.cliente) return false;
      
      const clienteIdBicicleta = Number(b.cliente.id); // Converte para number
      const clienteIdBuscado = Number(clienteId); // Garante que é number
      
      console.log(`📊 Comparação: ${clienteIdBicicleta} (${typeof clienteIdBicicleta}) === ${clienteIdBuscado} (${typeof clienteIdBuscado}) → ${clienteIdBicicleta === clienteIdBuscado}`);
      
      return clienteIdBicicleta === clienteIdBuscado;
    });
    
    console.log('✅ Bicicletas encontradas:', bicicletasFiltradas);
    return of(bicicletasFiltradas);
  }

  create(bicicleta: Bicicleta): Observable<Bicicleta> {
    const bicicletas = this.getAllFromStorage();
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    let cliente = bicicleta.cliente;
    
    // ✅ CORREÇÃO: Garante que o ID do cliente é number
    if (cliente && cliente.id) {
      cliente = clientes.find((c: any) => Number(c.id) === Number(cliente.id)) || cliente;
    }
    
    const newId = bicicletas.length > 0 ? Math.max(...bicicletas.map(b => b.id || 0)) + 1 : 1;
    const newBicicleta = { 
      ...bicicleta, 
      id: newId, 
      cliente: {
        ...cliente,
        id: Number(cliente.id) // ✅ Garante que é number
      }
    };
    
    bicicletas.push(newBicicleta);
    this.saveAllToStorage(bicicletas);
    
    console.log('✅ Bicicleta criada:', newBicicleta);
    return of(newBicicleta);
  }
}