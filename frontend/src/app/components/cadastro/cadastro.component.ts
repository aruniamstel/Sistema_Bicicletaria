import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CepService } from '../../services/cep.service'; 
import { HttpClient } from '@angular/common/http';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [RouterLink, FormsModule, NgxMaskDirective],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css'],
  providers: [provideNgxMask()]
})
export class CadastroComponent {
  cpf: string = '';
  nome: string = '';
  email: string = '';
  telefone: string = '';
  cep: string = '';
  rua: string = '';
  bairro: string = '';
  localidade: string = '';
  estado: string = ''; 
  numero: string = ''; 
  complemento: string = ''; 

  constructor(private cepService: CepService, private http: HttpClient) {}

  buscarCep() {
    if (!this.cep) {
      alert('Por favor, informe um CEP válido.');
      return;
    }

    this.cepService.buscarCep(this.cep).subscribe(
      (data) => {
        this.rua = data.logradouro;
        this.bairro = data.bairro;
        this.localidade = data.localidade;
        this.estado = data.uf;
      },
      (error) => {
        console.error('Erro ao buscar CEP', error);
        alert('Erro ao buscar o CEP. Por favor, tente novamente.');
      }
    );
  }

  validarFormulario(): boolean {
    if (!this.nome || !this.email || !this.cpf || !this.cep || !this.telefone) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return false;
    }
    if (!this.validarEmail(this.email)) {
      alert('E-mail inválido!');
      return false;
    }
    if (!this.validarCPF(this.cpf)) {
      alert('CPF inválido!');
      return false;
    }
    return true;
  }

  validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validarCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  onSubmit() {
    if (!this.validarFormulario()) return;

    const cadastroData = {
      cpf: this.cpf,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      cep: this.cep,
      rua: this.rua,
      bairro: this.bairro,
      localidade: this.localidade,
      estado: this.estado,
      numero: this.numero,
      complemento: this.complemento
    };

    this.http.post('http://localhost:8081/cliente/cadastrar', cadastroData).subscribe(
      () => {
        alert('Cadastro realizado com sucesso! Verifique seu email para receber a senha.');
        this.redirecionarParaLogin();
      },
      (error) => {
        console.error('Erro ao cadastrar:', error);
        if (error.status === 409) {
          alert('E-mail ou CPF já cadastrado.');
        } else {
          alert('Erro ao cadastrar: ' + (error.error.message || 'Tente novamente mais tarde.'));
        }
      }
    );
  }

  redirecionarParaLogin() {
    window.location.href = '/login';
  }
}
