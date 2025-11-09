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
      ordem.servicos = ordem.servicos || [];
      ordem.servicos.push({
        servico: { id: servicoId, descricao: 'Serviço Local', valor: 100 },
        quantidade,
        valor: 100 * quantidade
      });
      // Recalculate valorTotal
      ordem.valorTotal = (ordem.servicos?.reduce((sum, s) => sum + (s.quantidade * (s.servico.valor || 0)), 0) || 0)
        + (ordem.pecas?.reduce((sum, p) => sum + (p.quantidade * (p.peca.valor || 0)), 0) || 0);
      this.saveAllToStorage(ordens);
    }
    return of(ordem!);
  }

  addPeca(ordemId: number, pecaId: number, quantidade: number): Observable<OrdemServico> {
    const ordens = this.getAllFromStorage();
    const ordem = ordens.find(o => o.id === ordemId);
    if (ordem) {
      ordem.pecas = ordem.pecas || [];
      ordem.pecas.push({
        peca: { id: pecaId, descricao: 'Peça Local', valor: 50, quantidade },
        quantidade,
        valor: 50 * quantidade
      });
      // Recalculate valorTotal
      ordem.valorTotal = (ordem.servicos?.reduce((sum, s) => sum + (s.quantidade * (s.servico.valor || 0)), 0) || 0)
        + (ordem.pecas?.reduce((sum, p) => sum + (p.quantidade * (p.peca.valor || 0)), 0) || 0);
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