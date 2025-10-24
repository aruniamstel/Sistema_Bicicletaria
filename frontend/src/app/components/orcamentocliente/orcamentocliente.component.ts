import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MostrarOrcamentoService } from '../../services/mostrarorcamento.service';
import { HttpClient } from '@angular/common/http';
import { Solicitacao } from '../../shared/models/solicitacao.model';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-orcamentocliente',
  standalone: true,
  imports: [HeaderComponent, NgIf, CommonModule, FormsModule, RouterModule],
  templateUrl: './orcamentocliente.component.html',
  styleUrls: ['./orcamentocliente.component.css']
})
export class OrcamentoclienteComponent implements OnInit {


  solicitacaoId: number = 0;
  solicitacao: Solicitacao | null = null;
  popupVisible = false;
  popupMessage = '';
  modalVisible = false;
  justificativa = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orcamentoService: MostrarOrcamentoService,
    private http: HttpClient,
  ) {
    this.route.params.subscribe(params => {
      this.solicitacaoId = params['id'];
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

  aprovarOrcamento(): void {
    this.orcamentoService.aprovarOrcamento(this.solicitacaoId).subscribe({
      next: (data: Solicitacao) => {
        this.solicitacao = data; // Armazena a solicitação retornada
      },
      error: (err) => {
        console.error('Erro ao carregar solicitação:', err);
        alert('Erro ao carregar os dados da solicitação!');
      }
    });

    // localStorage.setItem('statusSolicitacao', 'APROVADA');
    this.popupMessage = `Serviço Aprovado no Valor R$ ${this.solicitacao?.preco}`;
    this.showPopup();
  }

  rejeitarOrcamento() {
    this.modalVisible = true;
  }

  confirmarRejeicao() {
    const id = this.solicitacaoId;
    const justificativaPayload = { justificativa: this.justificativa };

    this.http.put(`http://localhost:8081/solicitacao/rejeitar/${id}?justificativa=${this.justificativa}`, null).subscribe({
      next: (response: any) => {
        this.popupMessage = `Serviço Rejeitado: ${this.justificativa}`;
        localStorage.setItem('statusSolicitacao', 'REJEITADA');
        this.closeModal();
        this.showPopup();
      },
      error: (err) => {
        console.error('Erro ao rejeitar solicitação', err);
        this.popupMessage = 'Erro ao rejeitar solicitação';
        this.showPopup();
      },
    });
  }

  showPopup() {
    this.popupVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

  closePopup() {
    this.popupVisible = false;
    this.router.navigate(['pgcliente']);
  }
}
