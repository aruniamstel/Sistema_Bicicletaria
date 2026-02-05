import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Peca } from '../../../shared/models/peca.model';
import { PecaService } from '../../../services/peca.service';

@Component({
  selector: 'app-estoque-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estoque-manager.component.html',
  styleUrls: ['./estoque-manager.component.css']
})
export class EstoqueManagerComponent implements OnInit, OnDestroy {
  // Dados
  pecas: Peca[] = [];
  pecasFiltradas: Peca[] = [];

  // Form
  pecaForm: FormGroup;
  filtrosForm: FormGroup;

  // Estados
  loading = false;
  loadingOperation = false;
  errorMessage = '';
  successMessage = '';
  editingPeca: Peca | null = null;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private pecaService: PecaService
  ) {
    this.pecaForm = this.fb.group({
      descricao: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
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
  }

  ngOnInit(): void {
    this.carregarDados();
    
    // Aplicar filtros apenas quando o usuário muda os valores (skipInitial=true)
    this.filtrosForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarDados(): void {
    this.loading = true;
    this.errorMessage = '';

    this.pecaService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.pecas = data || [];
          this.aplicarFiltros();
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar peças:', error);
          this.errorMessage = 'Erro ao carregar peças. Tente novamente.';
          this.loading = false;
        }
      });
  }

  salvarPeca(): void {
    if (this.pecaForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios (descrição e valor).';
      return;
    }

    this.loadingOperation = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.pecaForm.value;
    const pecaData: Peca = {
      descricao: formValue.descricao,
      valor: formValue.valor,
      quantidade: formValue.quantidade ?? 0,
      codigoInterno: formValue.codigoInterno || undefined,
      categoria: formValue.categoria || undefined,
      subcategoria: formValue.subcategoria || undefined
    };

    if (this.editingPeca && this.editingPeca.id) {
      // Atualizar
      this.pecaService.update(this.editingPeca.id, pecaData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = '✅ Peça atualizada com sucesso!';
            this.carregarDados();
            this.pecaForm.reset();
            this.editingPeca = null;
            this.loadingOperation = false;
          },
          error: (error) => {
            console.error('❌ Erro ao atualizar peça:', error);
            this.errorMessage = 'Erro ao atualizar peça: ' + error.message;
            this.loadingOperation = false;
          }
        });
    } else {
      // Criar
      this.pecaService.create(pecaData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = '✅ Peça criada com sucesso!';
            this.carregarDados();
            this.pecaForm.reset();
            this.loadingOperation = false;
          },
          error: (error) => {
            console.error('❌ Erro ao criar peça:', error);
            this.errorMessage = 'Erro ao criar peça: ' + error.message;
            this.loadingOperation = false;
          }
        });
    }
  }

  editarPeca(peca: Peca): void {
    this.editingPeca = peca;
    this.pecaForm.patchValue({
      descricao: peca.descricao,
      valor: peca.valor,
      quantidade: peca.quantidade || 0,
      codigoInterno: peca.codigoInterno || '',
      categoria: peca.categoria || '',
      subcategoria: peca.subcategoria || ''
    });
    this.scrollToForm();
  }

  excluirPeca(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta peça?')) {
      this.loadingOperation = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.pecaService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = '✅ Peça excluída com sucesso!';
            this.carregarDados();
            this.loadingOperation = false;
          },
          error: (error) => {
            console.error('❌ Erro ao excluir peça:', error);
            this.errorMessage = 'Erro ao excluir peça. Tente novamente.';
            this.loadingOperation = false;
          }
        });
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

  scrollToForm(): void {
    setTimeout(() => {
      const formElement = document.querySelector('.form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  limparFiltros(): void {
    this.filtrosForm.reset();
    this.aplicarFiltros();
  }
}
