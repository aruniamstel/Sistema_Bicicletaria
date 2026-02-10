import { Bicicleta } from './bicicleta.model';
import { Cliente } from './cliente.model';

export interface OrdemServico {
  id?: number;
  cliente: Cliente; // Adicionado para compatibilidade com o formulário
  bicicleta: Bicicleta;
  
  // Datas no formato ISO 8601: yyyy-MM-dd'T'HH:mm:ss (como strings vindas da API)
  dataEntrada: string;
  dataPrevisaoSaida?: string; // Formato ISO string ou undefined
  dataSaidaReal?: string;         // Formato ISO string ou undefined
  
  observacoes?: string; // Opcional conforme Requisito [cite: 5]
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE';
  
  // Itens da OS
  servicos: OrdemServicoServico[];
  pecas: OrdemServicoPeca[];
  
  valorTotal?: number;
  
  // Controle do PDF conforme Requisito 
  exibirAviso30Dias: boolean; 
}



export interface OrdemServicoServico {
  id?: number;
  servico: Servico;
  quantidade: number;
  valor: number;
}

export interface OrdemServicoPeca {
  id?: number;
  peca: Peca;
  quantidade: number;
  valor: number;
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