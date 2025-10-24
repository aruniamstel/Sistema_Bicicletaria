import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
@Component({
  selector: 'app-visualizarservicos',
  standalone: true,
  imports: [CommonModule, NgFor, HeaderComponent],
  templateUrl: './visualizarservicos.component.html',
  styleUrls: ['./visualizarservicos.component.css']
})
export class VisualizarservicosComponent {
  solicitacoes = [
    {
      dataHora: '2024-09-14 09:30',
      descricao: 'Notebook Dell Inspiron',
      categoria: 'Notebooks',
      estado: 'ORÇADA',
      valor: 400.00,
      historico: [
        { dataHora: '2024-09-14 10:00', funcionario: 'João Silva', estado: 'CRIADA' },
        { dataHora: '2024-09-15 14:30', funcionario: 'Maria Oliveira', estado: 'ORÇADA' }
      ]
    },
    {
      dataHora: '2024-09-16 11:00',
      descricao: 'Smartphone Samsung Galaxy',
      categoria: 'Smartphones',
      estado: 'ARRUMADA',
      valor: 200.00,
      historico: [
        { dataHora: '2024-09-16 12:00', funcionario: 'Pedro Santos', estado: 'CRIADA' },
        { dataHora: '2024-09-17 10:00', funcionario: 'Ana Costa', estado: 'ARRUMADA' }
      ]
    }
  ];

  solicitacaoSelecionada: any = null;
  historicoPassos: any[] = [];

  constructor(private router: Router) {}

  abrirModal(solicitacao: any): void {
    this.solicitacaoSelecionada = solicitacao;
    this.historicoPassos = solicitacao.historico; // Preencher histórico
    const modal = document.getElementById('solicitacaoModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  fecharModal(): void {
    this.solicitacaoSelecionada = null;
    this.historicoPassos = [];
    const modal = document.getElementById('solicitacaoModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  mostrarOrcamento() {
    alert('Visualizando orçamento');
    this.router.navigate(['orcamento']);
  }
}
