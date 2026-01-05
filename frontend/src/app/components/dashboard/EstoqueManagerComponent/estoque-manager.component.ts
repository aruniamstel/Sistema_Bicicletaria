import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Interface
export interface Peca {
  id?: number;
  descricao: string;
  valor: number;
  quantidade: number;
  codigoInterno?: string;
  categoria?: string;
  subcategoria?: string;
}

@Component({
  selector: 'app-estoque-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estoque-manager.component.html',
  styleUrls: ['./estoque-manager.component.css']
})
export class EstoqueManagerComponent implements OnInit {
  // Dados
  pecas: Peca[] = [];
  pecasFiltradas: Peca[] = [];

  // Form
  pecaForm: FormGroup;
  filtrosForm: FormGroup;

  // Estados
  loading = false;
  editingPeca: Peca | null = null;

  constructor(private fb: FormBuilder) {
    this.pecaForm = this.fb.group({
      descricao: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0)]],
      quantidade: ['', [Validators.min(0)]],
      codigoInterno: [''],
      categoria: [''],
      subcategoria: ['']
    });

    this.filtrosForm = this.fb.group({
      termoBusca: [''],
      codigoInterno: [''],
      categoria: [''],
      subcategoria: ['']
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

    const pecasData = localStorage.getItem('pecas');
    this.pecas = pecasData ? JSON.parse(pecasData) : this.criarPecasPadrao();

    this.aplicarFiltros();
    this.loading = false;
  }

  salvarPeca(): void {
    if (this.pecaForm.valid) {
      const formValue = this.pecaForm.value;
      const novaPeca: Peca = {
        descricao: formValue.descricao,
        valor: formValue.valor,
        quantidade: formValue.quantidade ?? 0,
        codigoInterno: formValue.codigoInterno || undefined,
        categoria: formValue.categoria || undefined,
        subcategoria: formValue.subcategoria || undefined
      };

      if (this.editingPeca) {
        const index = this.pecas.findIndex(p => p.id === this.editingPeca!.id);
        if (index !== -1) {
          this.pecas[index] = { ...novaPeca, id: this.editingPeca.id };
        }
      } else {
        const newId = this.pecas.length > 0 ? Math.max(...this.pecas.map(p => p.id || 0)) + 1 : 1;
        novaPeca.id = newId;
        this.pecas.push(novaPeca);
      }

      this.salvarNoLocalStorage('pecas', this.pecas);
      this.aplicarFiltros();
      this.pecaForm.reset();
      this.editingPeca = null;
    }
  }

  editarPeca(peca: Peca): void {
    this.editingPeca = peca;
    this.pecaForm.patchValue({
      descricao: peca.descricao,
      valor: peca.valor,
      quantidade: peca.quantidade,
      codigoInterno: peca.codigoInterno || '',
      categoria: peca.categoria || '',
      subcategoria: peca.subcategoria || ''
    });
  }

  excluirPeca(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta peça?')) {
      this.pecas = this.pecas.filter(p => p.id !== id);
      this.salvarNoLocalStorage('pecas', this.pecas);
    }
  }

  cancelarEdicaoPeca(): void {
    this.pecaForm.reset();
    this.editingPeca = null;
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let filtradas = [...this.pecas];

    if (filtros.termoBusca) {
      filtradas = filtradas.filter(peca =>
        peca.descricao.toLowerCase().includes(filtros.termoBusca.toLowerCase())
      );
    }

    if (filtros.codigoInterno) {
      filtradas = filtradas.filter(peca =>
        peca.codigoInterno && peca.codigoInterno.toLowerCase().includes(filtros.codigoInterno.toLowerCase())
      );
    }

    if (filtros.categoria) {
      filtradas = filtradas.filter(peca =>
        peca.categoria && peca.categoria.toLowerCase().includes(filtros.categoria.toLowerCase())
      );
    }

    if (filtros.subcategoria) {
      filtradas = filtradas.filter(peca =>
        peca.subcategoria && peca.subcategoria.toLowerCase().includes(filtros.subcategoria.toLowerCase())
      );
    }

    this.pecasFiltradas = filtradas;
  }

  limparFiltros(): void {
    this.filtrosForm.reset();
    this.pecasFiltradas = [...this.pecas];
  }

  private salvarNoLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private criarPecasPadrao(): Peca[] {
    const pecasPadrao = [
      { id: 1, descricao: 'Pneu 26"', valor: 45, quantidade: 10 },
      { id: 2, descricao: 'Câmara de ar 26"', valor: 15, quantidade: 20 },
      { id: 3, descricao: 'Corrente', valor: 25, quantidade: 8 },
      { id: 4, descricao: 'Pedal', valor: 35, quantidade: 6 },
      { id: 5, descricao: 'Freio a disco', valor: 60, quantidade: 4 },
      { id: 6, descricao: 'Manete de freio', valor: 20, quantidade: 12 }
    ];
    this.salvarNoLocalStorage('pecas', pecasPadrao);
    return pecasPadrao;
  }
}
