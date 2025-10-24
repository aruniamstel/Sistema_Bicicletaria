import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { MostrarOrcamentoService } from '../../services/mostrarorcamento.service';
import { HttpClient } from '@angular/common/http';

interface Pagamento {
  solicitacaoId: number;
  dataHoraPagamento: string;
  valor: number;
  estado: string;
}
@Component({
  selector: 'app-pagarservico',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './pagarservico.component.html',
  styleUrl: './pagarservico.component.css'
})
export class PagarservicoComponent implements OnInit{

  solicitacaoId : number = 0;
  solicitacao : Solicitacao | null = null;

  constructor(
    private router: Router,
    private route : ActivatedRoute,
    private orcamentoService : MostrarOrcamentoService,
    private http : HttpClient) {
      this.route.params.subscribe(params =>{
        this.solicitacaoId  = params['id'];
      })

    }
    ngOnInit(): void {
      // Busca os dados da solicitação pelo ID
      this.orcamentoService.buscarSolicitacaoPorId(this.solicitacaoId).subscribe({
        next: (data: Solicitacao) => {
          this.solicitacao = data; // Armazena a solicitação retornada
        },
        error: (err) => {
          console.error('Erro ao carregar solicitação:', err);
          alert('Erro ao carregar os dados da solicitação!');
        }
      });
    }

  confirmarPagamento() : void{
    
    this.orcamentoService.confirmarPagamento(this.solicitacaoId).subscribe({
      next: (data: Solicitacao) => {
        this.solicitacao = data; // Armazena a solicitação retornada
      },
      error: (err) => {
        console.error('Erro ao carregar solicitação:', err);
        alert('Erro ao carregar os dados da solicitação!');
      }
    });
  
      alert('Pagamento realizado com sucesso!');
      this.router.navigate(["pgcliente"]);
  }
}
