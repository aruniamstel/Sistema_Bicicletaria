import { Bicicleta } from './bicicleta.model';
import { OrdemServico } from './ordem-servico.model';

export interface Cliente {
  id?: number;
  nome: string;
  telefone: string;
  endereco: string;
  instagram?: string;
  bicicletas?: Bicicleta[];
  ordensServico?: OrdemServico[];
}