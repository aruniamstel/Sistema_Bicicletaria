import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HeaderfuncionarioComponent } from "../headerfuncionario/headerfuncionario.component";

@Component({
  selector: 'app-efetuarorcamento',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderfuncionarioComponent],
  templateUrl: './efetuarorcamento.component.html',
  styleUrls: ['./efetuarorcamento.component.css']
})
export class EfetuarorcamentoComponent implements OnInit {

  valorOrcado: number = 0;
  solicitacaoId: number = 0;
  solicitacao: Solicitacao | null = null;
  selectedFuncionario: number | null = null; // ID do funcionário selecionado
  isRedirecionar: boolean = false;  // Flag para alternar entre "Orçar" e "Redirecionar"
  funcionarios: any[] = []; // Lista de funcionários para redirecionamento

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private solicitacaoService: SolicitacaoService,
    private http: HttpClient,
  ) {
    this.route.params.subscribe(params => {
      this.solicitacaoId = params['id'];
    });
  }

  ngOnInit(): void {
    // Busca os dados da solicitação pelo ID
    this.solicitacaoService.buscarSolicitacaoPorId(this.solicitacaoId).subscribe({
      next: (data: Solicitacao) => {
        this.solicitacao = data; // Armazena a solicitação retornada
      },
      error: (err) => {
        console.error('Erro ao carregar solicitação:', err);
        alert('Erro ao carregar os dados da solicitação!');
      }
    });

    // Busca a lista de funcionários disponíveis para redirecionamento
    this.solicitacaoService.listarFuncionarios().subscribe({
      next: (data: any[]) => {
        console.log('Lista de Funcionários:', data);  // Verifique no console
        this.funcionarios = data; // Armazena a lista de funcionários
      },
      error: (err) => {
        console.error('Erro ao carregar funcionários:', err);
      }
    });
  }

  // Função para ativar a opção de redirecionamento
  ativarRedirecionar() {
    this.isRedirecionar = true;
  }

  // Função para confirmar o orçamento
  confirmarOrcamento() {
    this.solicitacaoService.confirmarOrcamento(this.solicitacaoId.toString(), this.valorOrcado).subscribe({
      next: () => {
        alert('Orçamento confirmado');
        this.router.navigate(["pgfuncionario"]);
      },
      error: (err: any) => {
        alert('Erro ao confirmar orçamento');
      }
    });
  }

  // Função para redirecionar a solicitação
  redirecionarManutencao() {
    if (this.selectedFuncionario === null) {
      alert('Por favor, selecione um funcionário para redirecionar.');
      return;
    }

    // Validar se o redirecionamento não é para o próprio funcionário
    if (this.selectedFuncionario === this.solicitacao?.funcionario.id) {
      alert('Você não pode redirecionar a solicitação para si mesmo.');
      return;
    }

    const redirecionamento = {
      funcionarioOrigem: this.solicitacao?.funcionario.nome,
      funcionarioDestino: this.funcionarios.find(f => f.id === this.selectedFuncionario)?.nome,
      dataHora: new Date().toISOString(),
      solicitacaoId: this.solicitacaoId,
    };

    this.solicitacaoService.redirecionarManutencao(redirecionamento).subscribe({
      next: () => {
        this.solicitacao!.status = 'REDIRECIONADA'; // Atualiza o status da solicitação
        alert('Solicitação redirecionada com sucesso!');
        this.router.navigate(['/solicitacoes']);
      },
      error: (err) => {
        alert('Erro ao redirecionar manutenção');
      }
    });
  }
}
