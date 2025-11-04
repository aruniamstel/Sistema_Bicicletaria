import { Bicicleta } from './bicicleta.model';

export interface Cliente {
  id?: number;
  nome: string;
  telefone: string;
  endereco: string;
  instagram?: string;
  bicicletas?: Bicicleta[];
}