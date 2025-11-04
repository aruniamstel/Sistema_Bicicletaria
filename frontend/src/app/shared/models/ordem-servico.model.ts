import { Bicicleta } from './bicicleta.model';

export interface OrdemServico {
  id?: number;
  dataEntrada: string;
  dataSaida?: string;
  problemaRelatado: string;
  observacoes?: string;
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE';
  bicicleta: Bicicleta;
  servicos: OrdemServicoServico[];
  pecas: OrdemServicoPeca[];
  valorTotal?: number;
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