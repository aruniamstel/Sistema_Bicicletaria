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

  // 1. Mantém a lógica original de vincular a bicicleta e hidratar o cliente
  let bicicletaEncontrada = bicicletas.find((b: any) => b.id === (ordem.bicicleta && ordem.bicicleta.id));
  if (bicicletaEncontrada && bicicletaEncontrada.cliente && bicicletaEncontrada.cliente.id) {
    bicicletaEncontrada.cliente = clientes.find((c: any) => c.id === bicicletaEncontrada.cliente.id) || bicicletaEncontrada.cliente;
  }

  // 2. Geração de ID único
  const newId = ordens.length > 0 ? Math.max(...ordens.map(o => o.id || 0)) + 1 : 1;

  // 3. Cálculo SEGURO do valorTotal
  // Usamos Number() para garantir que não ocorra concatenação de strings
  // Usamos verificações múltiplas para aceitar 's.valor' ou 's.servico.valor'
  
  const totalServicos = (ordem.servicos || []).reduce((sum, s: any) => {
    const valor = s?.valor || s?.servico?.valor || 0;
    const qtd = s?.quantidade || 1;
    return sum + (Number(valor) * Number(qtd));
  }, 0);

  const totalPecas = (ordem.pecas || []).reduce((sum, p: any) => {
    // Busca por valorVenda (comum em peças) ou valor (comum em serviços)
    const valor = p?.valorVenda || p?.valor || p?.peca?.valorVenda || p?.peca?.valor || 0;
    const qtd = p?.quantidade || 1;
    return sum + (Number(valor) * Number(qtd));
  }, 0);

  // 4. Montagem do objeto final mantendo a compatibilidade
  const newOrdem: OrdemServico = { 
    ...ordem, 
    id: newId, 
    bicicleta: bicicletaEncontrada || ordem.bicicleta, 
    valorTotal: totalServicos + totalPecas,
    // Garante que a data de entrada exista
    dataEntrada: ordem.dataEntrada || new Date().toISOString()
  };

  ordens.push(newOrdem);
  this.saveAllToStorage(ordens);
  
  console.log('✅ Nova Ordem de Serviço criada com sucesso. Total: R$', newOrdem.valorTotal);
  return of(newOrdem);
}



  addServico(ordemId: number, servicoId: any, quantidade: any): Observable<OrdemServico> {
  const ordens = this.getAllFromStorage();
  const ordem = ordens.find(o => o.id === Number(ordemId));
  
  if (ordem) {
    // ✅ CONVERSÃO ROBUSTA
    const servicoIdNumber = Number(servicoId);
    const quantidadeNumber = Number(quantidade);
    
    const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
    const servicoReal = servicos.find((s: any) => Number(s.id) === servicoIdNumber);
    
    if (servicoReal) {
      const valorServico = Number(servicoReal.valor);
      const valorTotal = valorServico * quantidadeNumber;
      
      ordem.servicos = ordem.servicos || [];
      ordem.servicos.push({
        servico: {
          id: Number(servicoReal.id),
          descricao: servicoReal.descricao,
          valor: valorServico
        },
        quantidade: quantidadeNumber,
        valor: valorTotal
      });
      
      // Recalcula total
      ordem.valorTotal = (ordem.servicos?.reduce((sum, s) => sum + s.valor, 0) || 0)
        + (ordem.pecas?.reduce((sum, p) => sum + p.valor, 0) || 0);
      
      this.saveAllToStorage(ordens);
      console.log('✅ Serviço adicionado:', servicoReal.descricao, 'Valor:', valorServico);
    }
  }
  return of(ordem!);
}

addPeca(ordemId: number, pecaId: number, quantidade: number): Observable<OrdemServico> {
  const ordens = this.getAllFromStorage();
  const ordem = ordens.find(o => o.id === ordemId);
  
  if (ordem) {
    console.log('⚙️ ADD PEÇA - Debug:');
    console.log('  Peça ID (original):', pecaId, 'Tipo:', typeof pecaId);
    
    // ✅ CORREÇÃO: Converter para NUMBER
    const pecaIdNumber = Number(pecaId);
    console.log('  Peça ID (convertido):', pecaIdNumber, 'Tipo:', typeof pecaIdNumber);
    
    const pecas = JSON.parse(localStorage.getItem('pecas') || '[]');
    
    // ✅ CORREÇÃO: Buscar com ID convertido
    const pecaReal = pecas.find((p: any) => p.id === pecaIdNumber);
    console.log('  Peça encontrada:', pecaReal);
    
    if (pecaReal) {
      const valorPeca = pecaReal.valor;
      const valorTotal = valorPeca * quantidade;
      
      ordem.pecas = ordem.pecas || [];
      ordem.pecas.push({
        peca: {
          id: pecaReal.id,
          descricao: pecaReal.descricao,
          valor: valorPeca,
          quantidade: pecaReal.quantidade
        },
        quantidade,
        valor: valorTotal
      });
      
      // Recalcula total
      ordem.valorTotal = (ordem.servicos?.reduce((sum, s) => sum + s.valor, 0) || 0)
        + (ordem.pecas?.reduce((sum, p) => sum + p.valor, 0) || 0);
      
      this.saveAllToStorage(ordens);
      console.log('✅ Peça adicionada:', pecaReal.descricao, 'Valor:', valorPeca);
    } else {
      console.error('❌ Peça não encontrada para ID:', pecaIdNumber);
    }
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