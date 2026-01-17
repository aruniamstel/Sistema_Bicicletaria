import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Interface
export interface Servico {
  id?: number;
  descricao: string;
  valor: number;
}

@Component({
  selector: 'app-servico-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './servico-manager.component.html',
  styleUrls: ['./servico-manager.component.css']
})
export class ServicoManagerComponent implements OnInit {
  // Dados
  servicos: Servico[] = [];
  servicosFiltrados: Servico[] = [];

  // Form
  servicoForm: FormGroup;
  filtrosForm: FormGroup;

  // Estados
  loading = false;
  editingServico: Servico | null = null;

  constructor(private fb: FormBuilder) {
    this.servicoForm = this.fb.group({
      descricao: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0)]]
    });

    this.filtrosForm = this.fb.group({
      nomeBusca: ['']
    });

    // Filtragem reativa
    this.filtrosForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;

    const servicosData = localStorage.getItem('servicos');
    this.servicos = servicosData ? JSON.parse(servicosData) : this.criarServicosPadrao();

    this.aplicarFiltros();
    this.loading = false;
  }

  salvarServico(): void {
    if (this.servicoForm.valid) {
      const formValue = this.servicoForm.value;
      const novoServico: Servico = {
        descricao: formValue.descricao,
        valor: formValue.valor
      };

      if (this.editingServico) {
        const index = this.servicos.findIndex(s => s.id === this.editingServico!.id);
        if (index !== -1) {
          this.servicos[index] = { ...novoServico, id: this.editingServico.id };
        }
      } else {
        const newId = this.servicos.length > 0 ? Math.max(...this.servicos.map(s => s.id || 0)) + 1 : 1;
        novoServico.id = newId;
        this.servicos.push(novoServico);
      }

      this.salvarNoLocalStorage('servicos', this.servicos);
      this.aplicarFiltros();
      this.servicoForm.reset();
      this.editingServico = null;
    }
  }

  editarServico(servico: Servico): void {
    this.editingServico = servico;
    this.servicoForm.patchValue({
      descricao: servico.descricao,
      valor: servico.valor
    });
    this.scrollToForm();
  }

  excluirServico(id: number): void {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      this.servicos = this.servicos.filter(s => s.id !== id);
      this.salvarNoLocalStorage('servicos', this.servicos);
      this.aplicarFiltros();
    }
  }

  cancelarEdicaoServico(): void {
    this.servicoForm.reset();
    this.editingServico = null;
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let filtrados = [...this.servicos];

    if (filtros.nomeBusca) {
      filtrados = filtrados.filter(servico =>
        servico.descricao.toLowerCase().includes(filtros.nomeBusca.toLowerCase())
      );
    }

    this.servicosFiltrados = filtrados;
  }

  limparFiltros(): void {
    this.filtrosForm.reset();
    this.servicosFiltrados = [...this.servicos];
  }

  private scrollToForm(): void {
    setTimeout(() => {
      const formElement = document.querySelector('.form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  private salvarNoLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private criarServicosPadrao(): Servico[] {
    const servicosPadrao = [
      { id: 1, descricao: 'Troca de pneu', valor: 50 },
      { id: 2, descricao: 'Ajuste de freios', valor: 35 },
      { id: 3, descricao: 'Troca de câmbio', valor: 80 },
      { id: 4, descricao: 'Ajuste de marchas', valor: 40 },
      { id: 5, descricao: 'Troca de corrente', valor: 45 },
      { id: 6, descricao: 'Troca de pedais', valor: 50.50 }
    ];
    this.salvarNoLocalStorage('servicos', servicosPadrao);
    return servicosPadrao;
  }
}
