import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OrdemServico } from '../shared/models/ordem-servico.model';

@Injectable({ providedIn: 'root' })
export class OrdemServicoService {
  private storageKey = 'ordens-servico';

  private getAllFromStorage(): OrdemServico[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveAllToStorage(ordens: OrdemServico[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(ordens));
  }

  getAll(): Observable<OrdemServico[]> {
    return of(this.getAllFromStorage());
  }

  getById(id: number): Observable<OrdemServico> {
    const ordem = this.getAllFromStorage().find(o => o.id === id);
    return of(ordem!);
  }

  create(ordem: OrdemServico): Observable<OrdemServico> {
    const ordens = this.getAllFromStorage();
    const bicicletas = JSON.parse(localStorage.getItem('bicicletas') || '[]');
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    let bicicleta = bicicletas.find((b: any) => b.id === (ordem.bicicleta && ordem.bicicleta.id));
    if (bicicleta && bicicleta.cliente && bicicleta.cliente.id) {
      bicicleta.cliente = clientes.find((c: any) => c.id === bicicleta.cliente.id) || bicicleta.cliente;
    }
    const newId = ordens.length > 0 ? Math.max(...ordens.map(o => o.id || 0)) + 1 : 1;
    // Calculate valorTotal
    let valorTotal = 0;
    if (ordem.servicos) {
      valorTotal += ordem.servicos.reduce((sum, s) => sum + (s.quantidade * (s.servico.valor || 0)), 0);
    }
    if (ordem.pecas) {
      valorTotal += ordem.pecas.reduce((sum, p) => sum + (p.quantidade * (p.peca.valor || 0)), 0);
    }
    const newOrdem = { ...ordem, id: newId, bicicleta, valorTotal };
    ordens.push(newOrdem);
    this.saveAllToStorage(ordens);
    return of(newOrdem);
  }

  private criarOrdensExemplo(): OrdemServico[] {
  return [
    {
      id: 1,
      problemaRelatado: 'Pneu furado e freios rangendo',
      dataEntrada: '2024-01-15',
      dataSaida: undefined,
      status: 'EM_ANDAMENTO',
      valorTotal: 85.00,
      observacoes: 'Cliente relatou que o pneu traseiro está furado e os freios estão fazendo barulho',
      bicicleta: { 
        id: 1, 
        marca: 'Caloi', 
        modelo: 'Mountain Bike', 
        tamanhoAro: 26,
        cor: 'Vermelha',
        cliente: {  // ✅ GARANTIR que bicicleta.cliente existe
          id: 1, 
          nome: 'João Silva', 
          telefone: '(11) 99999-9999', 
          endereco: 'Rua das Bicicletas, 123' 
        }
      },
      servicos: [
        {
          servico: { id: 1, descricao: 'Troca completa do pneu traseiro', valor: 50 },
          quantidade: 1,
          valor: 50
        },
        {
          servico: { id: 2, descricao: 'Limpeza e ajuste dos freios', valor: 35 },
          quantidade: 1,
          valor: 35
        }
      ],
      pecas: []
    },
    // ... outras ordens com a mesma estrutura completa
  ];
}

  addServico(ordemId: number, servicoId: number, quantidade: number): Observable<OrdemServico> {
  const ordens = this.getAllFromStorage();
  const ordem = ordens.find(o => o.id === ordemId);
  
  if (ordem) {
    // Busca serviço real
    const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
    const servicoReal = servicos.find((s: any) => s.id === servicoId);
    
    ordem.servicos = ordem.servicos || [];
    ordem.servicos.push({
      servico: {
        id: servicoReal?.id || servicoId,
        descricao: servicoReal?.descricao || 'Serviço',
        valor: servicoReal?.valor || 0 // ✅ Valor real ou 0 se não encontrar
      },
      quantidade,
      valor: (servicoReal?.valor || 0) * quantidade
    });
    
    // Recalcula total
    ordem.valorTotal = (ordem.servicos?.reduce((sum, s) => sum + s.valor, 0) || 0)
      + (ordem.pecas?.reduce((sum, p) => sum + p.valor, 0) || 0);
    
    this.saveAllToStorage(ordens);
  }
  return of(ordem!);
}

addPeca(ordemId: number, pecaId: number, quantidade: number): Observable<OrdemServico> {
  const ordens = this.getAllFromStorage();
  const ordem = ordens.find(o => o.id === ordemId);
  
  if (ordem) {
    // Busca peça real
    const pecas = JSON.parse(localStorage.getItem('pecas') || '[]');
    const pecaReal = pecas.find((p: any) => p.id === pecaId);
    
    ordem.pecas = ordem.pecas || [];
    ordem.pecas.push({
      peca: {
        id: pecaReal?.id || pecaId,
        descricao: pecaReal?.descricao || 'Peça',
        valor: pecaReal?.valor || 0, // ✅ Valor real ou 0 se não encontrar
        quantidade: pecaReal?.quantidade || 0
      },
      quantidade,
      valor: (pecaReal?.valor || 0) * quantidade
    });
    
    // Recalcula total
    ordem.valorTotal = (ordem.servicos?.reduce((sum, s) => sum + s.valor, 0) || 0)
      + (ordem.pecas?.reduce((sum, p) => sum + p.valor, 0) || 0);
    
    this.saveAllToStorage(ordens);
  }
  return of(ordem!);
}

  updateStatus(id: number, status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE'): Observable<OrdemServico> {
    const ordens = this.getAllFromStorage();
    const ordem = ordens.find(o => o.id === id);
    if (ordem) {
      ordem.status = status;
      // Recalculate valorTotal (in case status change triggers recalculation in future)
      ordem.valorTotal = (ordem.servicos?.reduce((sum, s) => sum + (s.quantidade * (s.servico.valor || 0)), 0) || 0)
        + (ordem.pecas?.reduce((sum, p) => sum + (p.quantidade * (p.peca.valor || 0)), 0) || 0);
      this.saveAllToStorage(ordens);
    }
    return of(ordem!);
  }

  getValorTotal(id: number): Observable<number> {
    const ordem = this.getAllFromStorage().find(o => o.id === id);
    let total = 0;
    if (ordem) {
      if (ordem.servicos) {
        total += ordem.servicos.reduce((sum, s) => sum + (s.quantidade * (s.servico.valor || 0)), 0);
      }
      if (ordem.pecas) {
        total += ordem.pecas.reduce((sum, p) => sum + (p.quantidade * (p.peca.valor || 0)), 0);
      }
    }
    return of(total);
  }
}