import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';  // Importando o serviço Router
import { FormsModule } from '@angular/forms';
import { Funcionario } from '../../shared/models/funcionario.model';
import { CommonModule } from '@angular/common';
import { FuncionarioService } from '../../services/funcionario.service';

@Component({
  selector: 'app-editar-funcionario',
  templateUrl: './editar-funcionario.component.html',
  styleUrls: ['./editar-funcionario.component.css'],
  imports: [FormsModule, CommonModule, RouterModule],
  standalone: true
})
export class EditarFuncionarioComponent implements OnInit {

  funcionarios: Funcionario[] = [];
  funcionario: Funcionario = new Funcionario();
  id: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private funcionarioService: FuncionarioService
  ) { }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (navigation?.extras.state) {
      const funcionarioData = navigation.extras.state['funcionario'];
      // Atribuindo o objeto recebido via state
      this.funcionario = funcionarioData || new Funcionario();
      console.log('Funcionario passado via State:', this.funcionario);
    } else {
      console.log('Nenhum funcionário passado via State.');
      
      // Carregando a lista de funcionários
      this.funcionarioService.listarTodos().subscribe(
        (dados) => {
          this.funcionarios = dados;
          console.log(this.funcionarios);

          // Agora que os dados foram carregados, buscamos o funcionário pelo ID
          const funcionario = this.funcionarios.find(f => f.id === this.id);
          if (funcionario) {
            // Se o funcionário for encontrado, atribui à variável de instância
            this.funcionario = funcionario;
            console.log('Funcionário encontrado:', this.funcionario);
          } else {
            // Caso contrário, pode definir um valor padrão ou lançar um erro
            console.log('Funcionário não encontrado.');
            this.funcionario = new Funcionario(); // Define um novo funcionário caso não encontrado
          }
        },
        (erro) => {
          console.error('Erro ao carregar funcionários:', erro);  // Tratamento de erro
        }
      );
    }
  }

  salvar() {
    if (this.funcionario.id) {
      // Se o id estiver presente, significa que o funcionário já existe e deve ser atualizado
      this.funcionarioService.atualizar(this.funcionario).subscribe(
        (dados) => {
          console.log('Funcionário atualizado com sucesso:', dados);
          // Redirecionar ou mostrar uma mensagem de sucesso
          this.router.navigate(['/funcionarios/listar']);
        },
        (erro) => {
          console.error('Erro ao atualizar o funcionário:', erro);
          // Tratar erro, talvez mostrar uma mensagem ao usuário
        }
      );
    } else {
      // Caso o id não exista, você pode optar por criar um novo funcionário
      console.log('Erro: Não há id para o funcionário');
      // Exemplo de mensagem de erro ou algo a fazer
    }
  }
}