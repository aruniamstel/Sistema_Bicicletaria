export enum Perfil {
  ADMIN = 'Administrador',
  FUNCIONARIO = 'Funcionário',
  CLIENTE = 'Cliente'
}

export class Usuario {
  id: number;
  nome: string;
  login: string;
  senha: string;
  perfil: Perfil;
  email: string;
  telefone?: string;
  endereco?: string;
  cpf: string;

  // Você pode adicionar um construtor para facilitar a inicialização
  constructor(
    id: number,
    nome: string,
    login: string,
    senha: string,
    perfil: Perfil,
    email: string,
    cpf: string,
    telefone?: string,
    endereco?: string
  ) {
    this.id = id;
    this.nome = nome;
    this.login = login;
    this.senha = senha;
    this.perfil = perfil;
    this.email = email;
    this.cpf = cpf;
    this.telefone = telefone;
    this.endereco = endereco;
  }
}
