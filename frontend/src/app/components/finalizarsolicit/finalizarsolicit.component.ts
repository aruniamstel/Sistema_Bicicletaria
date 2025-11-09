import { Component, OnInit } from '@angular/core';
import { HeaderfuncionarioComponent } from "../headerfuncionario/headerfuncionario.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-finalizarsolicit',
  standalone: true,
  imports: [HeaderfuncionarioComponent, FormsModule, RouterModule, CommonModule],
  templateUrl: './finalizarsolicit.component.html',
  styleUrl: './finalizarsolicit.component.css'
})
export class FinalizarsolicitComponent {

  solicitacaoId: number = 0;
  solicitacao: Solicitacao | null = null;

  //msg
  popupVisible = false;
  popupMessage = '';
  modalVisible = false;

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
  }

  finalizarSolicitacao() {
    
   this.solicitacaoService.finalizarSolicitacao(this.solicitacaoId.toString()).subscribe(
      response => {
        console.log('Solicitacao:',  response);
        this.popupVisible = true;
        this.popupMessage = `Solicitação finalizada com sucesso!`;
        this.showPopup();
      },
      error => {
        console.error('Erro ao finalizar solicitacao', error);

      }
    );
    
  }

  showPopup() {
    this.popupVisible = true;
  }
  
  closeModal() {
    this.modalVisible = false;
  }

  closePopup() {
    this.popupVisible = false;
    this.router.navigate(['pgfuncionario']);
  }
}