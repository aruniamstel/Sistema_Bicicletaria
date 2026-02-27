import { Bicicleta } from './bicicleta.model';
import { Cliente } from './cliente.model';

export interface OrdemServico {
  id?: number;
  cliente: Cliente;
  
  // NOVO: Múltiplas bicicletas com seus itens aninhados
  bicicletas: BicicletaComItens[];
  
  // Mantido para compatibilidade (será preenchido com a primeira bicicleta se houver)
  bicicleta?: Bicicleta;
  
  // Datas no formato ISO 8601: yyyy-MM-dd'T'HH:mm:ss (como strings vindas da API)
  dataEntrada: string;
  dataPrevisaoSaida?: string;
  dataSaidaReal?: string;
  
  observacoes?: string;
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE';
  
  // Itens da OS (agregação de todos)
  servicos?: OrdemServicoServico[];
  pecas?: ItemPeca[];
  
  valorTotal?: number;
  exibirAviso30Dias: boolean;
}

/**
 * NOVO: Bicicleta com seus Serviços e Peças aninhados dentro de uma OS
 */
export interface BicicletaComItens {
  id?: number;
  marca: string;
  modelo: string;
  cor: string;
  tamanhoAro: number;
  
  // Serviços específicos desta bicicleta
  servicos: OrdemServicoServico[];
  
  // Peças específicas desta bicicleta
  pecas: ItemPeca[];
}

export interface OrdemServicoServico {
  id?: number;
  servico: Servico;
  quantidade: number;
  valor: number;
  
  // NOVO: Referência à bicicleta
  bicicletaId?: number;
}

export interface ItemPeca {
  id?: number;
  peca: Peca;
  quantidade: number;
  valor: number;
  
  // NOVO: Referência à bicicleta
  bicicletaId?: number;
}

export interface Servico {
  id?: number;
  descricao: string;
  valor: number;
}

export interface Peca {
  id?: number;
  descricao: string;
  valor: number;
  quantidade: number;
}

export interface StatusOrdem {
  ABERTA: 'ABERTA';
  EM_ANDAMENTO: 'EM_ANDAMENTO';
  CONCLUIDA: 'CONCLUIDA';
  ENTREGUE: 'ENTREGUE';
}