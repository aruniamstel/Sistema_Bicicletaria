export interface Peca {
  id?: number;
  nome: string;
  valorVenda: number;
  quantidadeEstoque?: number;
  codigoInterno?: string;
  categoria?: string;
  subcategoria?: string;
}