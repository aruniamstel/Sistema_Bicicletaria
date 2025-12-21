export interface Peca {
  id?: number;
  nome: string;
  valorVenda: number;
  quantidadeEstoque?: number; // Torna-se opcional conforme requisito do Fabiano 
}