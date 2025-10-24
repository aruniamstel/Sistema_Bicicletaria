export interface Solicitacao {
  id: number;
  description: string;
  preco: number;
  categoria: {
    nome: string;
  };
  date: Date;
  defeito: string;
  status: string;
  cliente: {
    nome: string;
  };
  funcionario: {
    id: number;  // Adicionando o id do funcionário
    nome: string;
  };
}
