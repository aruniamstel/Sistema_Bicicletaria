import { Component, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Funcionario } from '../../shared/models/funcionario.model';
import { FuncionarioService } from '../../services/funcionario.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HeaderfuncionarioComponent } from '../headerfuncionario/headerfuncionario.component';

@Component({
  selector: 'app-inserir-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderfuncionarioComponent],
  templateUrl: './inserir-funcionario.component.html',
  styleUrl: './inserir-funcionario.component.css'
})
export class InserirFuncionarioComponent {
  @ViewChild('formFuncionario') formFuncionario!: NgForm;
  funcionario: Funcionario = new Funcionario();
  constructor(
    private funcionarioService: FuncionarioService,
    private router: Router,
    private http: HttpClient) { }
  
  
    onSubmit() {
      if (!this.formFuncionario.form.valid) {
        // Validação simples para garantir que o formulário é válido
        return;
      }
  
      // Dados a serem enviados ao servidor
      const funcionarioData = {
        nome: this.funcionario.nome,
        email: this.funcionario.email,
        senha: this.funcionario.senha,
        dataNasc: this.funcionario.dataNasc
      };
  
      console.log(funcionarioData);

      // Enviando a requisição para o servidor
      this.http.post('http://localhost:8081/funcionario/criar', funcionarioData).subscribe(
        (response) => {
          alert('Funcionário cadastrado com sucesso!');
          // Redirecionando para a lista de funcionários após sucesso
          this.router.navigate(['/funcionarios/listar']);
        },
        (error) => {
          console.error('Erro ao cadastrar funcionário:', error);
          if (error.status === 409) {
            alert('E-mail já cadastrado.');
          } else {
            alert('Erro ao cadastrar: ' + (error.error.message || 'Tente novamente mais tarde.'));
          }
        }
      );
    }
}