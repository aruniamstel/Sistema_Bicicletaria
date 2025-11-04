import { Cliente } from './cliente.model';

export interface Bicicleta {
  id?: number;
  marca: string;
  modelo: string;
  tamanhoAro: number;
  cor: string;
  cliente: Cliente;
}