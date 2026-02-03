import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Servico } from '../../../shared/models/servico.model';
import { ServicoService } from '../../../services/servico.service';

@Component({
  selector: 'app-servico-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './servico-manager.component.html',
  styleUrls: ['./servico-manager.component.css']
})
export class ServicoManagerComponent implements OnInit, OnDestroy {
  // Dados
  servicos: Servico[] = [];
  servicosFiltrados: Servico[] = [];

  // Form
  servicoForm: FormGroup;
  filtrosForm: FormGroup;

  // Estados
  loading = false;
  loadingOperation = false;
  errorMessage = '';
  successMessage = '';
  editingServico: Servico | null = null;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private servicoService: ServicoService
  ) {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarDados(): void {
    this.loading = true;
    this.errorMessage = '';

    this.servicoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.servicos = data || [];
          this.aplicarFiltros();
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar serviços:', error);
          this.errorMessage = 'Erro ao carregar serviços. Tente novamente.';
          this.loading = false;
        }
      });
  }

  salvarServico(): void {
    if (this.servicoForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.loadingOperation = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.servicoForm.value;
    const servicoData: Servico = {
      descricao: formValue.descricao,
      valor: formValue.valor
    };

    if (this.editingServico && this.editingServico.id) {
      // Atualizar
      this.servicoService.update(this.editingServico.id, servicoData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = '✅ Serviço atualizado com sucesso!';
            this.carregarDados();
            this.servicoForm.reset();
            this.editingServico = null;
            this.loadingOperation = false;
          },
          error: (error) => {
            console.error('❌ Erro ao atualizar serviço:', error);
            this.errorMessage = 'Erro ao atualizar serviço. Tente novamente.';
            this.loadingOperation = false;
          }
        });
    } else {
      // Criar
      this.servicoService.create(servicoData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = '✅ Serviço criado com sucesso!';
            this.carregarDados();
            this.servicoForm.reset();
            this.loadingOperation = false;
          },
          error: (error) => {
            console.error('❌ Erro ao criar serviço:', error);
            this.errorMessage = 'Erro ao criar serviço. Tente novamente.';
            this.loadingOperation = false;
          }
        });
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
      this.loadingOperation = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.servicoService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = '✅ Serviço excluído com sucesso!';
            this.carregarDados();
            this.loadingOperation = false;
          },
          error: (error) => {
            console.error('❌ Erro ao excluir serviço:', error);
            this.errorMessage = 'Erro ao excluir serviço. Tente novamente.';
            this.loadingOperation = false;
          }
        });
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
