import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdemServico } from '../../../shared/models/ordem-servico.model';
import { Bicicleta } from '../../../shared/models/bicicleta.model';
import { Cliente } from '../../../shared/models/cliente.model';
import { BicicletaService } from '../../../services/bicicleta.service';
import { ClienteService } from '../../../services/cliente.service';
import { OrdemServicoService } from '../../../services/ordem-servico.service';
import { ExportarService } from '../../../services/exportar.service';
import { HistoricoBicicletaComponent } from '../HistoricoBicicletaComponent/historico-bicicleta.component';

@Component({
  selector: 'app-bicicleta-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HistoricoBicicletaComponent],
  templateUrl: './bicicleta-manager.component.html',
  styleUrls: ['./bicicleta-manager.component.css']
})
export class BicicletaManagerComponent implements OnInit, OnDestroy {
  bicicletas: Bicicleta[] = [];
  bicicletasFiltradas: Bicicleta[] = []; // Esta será exibida no HTML (*ngFor)
  bicicletasEmServico: Bicicleta[] = [];
  clientes: Cliente[] = [];
  ordensServico: OrdemServico[] = [];
  bicicletaForm: FormGroup;
  filtrosForm: FormGroup;

  // Controle de estado
  loading = false;
  loadingClientes = false;
  loadingOrdens = false;
  errorMessage = '';
  successMessage = '';

  // Edição
  editingBicicleta: Bicicleta | null = null;
  showModal = false;
  selectedBicicletaId: number | null = null;

  // Cleanup
  private destroy$ = new Subject<void>();

  @ViewChild('modalHistorico') modal!: ElementRef<HTMLDialogElement>;

  constructor(
    private fb: FormBuilder,
    private bicicletaService: BicicletaService,
    private clienteService: ClienteService,
    private ordemServicoService: OrdemServicoService,
    private exportarService: ExportarService
  ) {
    this.bicicletaForm = this.fb.group({
      selectedClienteId: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      tamanhoAro: ['', [Validators.required, Validators.min(12), Validators.max(29)]],
      cor: ['', Validators.required]
    });

    this.filtrosForm = this.fb.group({
      cliente: [''],
      marca: [''],
      cor: [''],
      modelo: [''],
      tamanhoAro: ['']
    });
  }

  ngOnInit(): void {

    this.filtrosForm.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.aplicarFiltros();
    });

    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega bicicletas, clientes e ordens de serviço do backend
   */
  carregarDados(): void {
    this.loading = true;
    this.errorMessage = '';

    // Carregar bicicletas
    this.bicicletaService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bks) => {
          this.bicicletas = bks;
          this.bicicletasFiltradas = bks; // Inicialmente, todas as bicicletas são exibidas
          console.log('✅ Bicicletas carregadas:', bks);
          this.aplicarFiltros();
        },
        error: (error) => {
          console.error('❌ Erro ao carregar bicicletas:', error);
          this.errorMessage = 'Erro ao carregar bicicletas. Tente novamente.';
          this.loading = false;
        }
      });

    // Carregar clientes
    this.loadingClientes = true;
    this.clienteService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cls) => {
          this.clientes = cls;
          console.log('✅ Clientes carregados:', cls);
          this.loadingClientes = false;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar clientes:', error);
          this.errorMessage = 'Erro ao carregar clientes. Tente novamente.';
          this.loadingClientes = false;
          this.loading = false;
        }
      });

    // Carregar ordens de serviço
    this.loadingOrdens = true;
    this.ordemServicoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ordens) => {
          this.ordensServico = ordens;
          console.log('✅ Ordens de serviço carregadas:', ordens);
          this.loadingOrdens = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar ordens:', error);
          this.loadingOrdens = false;
        }
      });
  }

  /**
   * Salva uma bicicleta (criar ou atualizar)
   */
  salvarBicicleta(): void {
    if (this.bicicletaForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.bicicletaForm.value;
    const clienteId = Number(formValue.selectedClienteId);

    if (!clienteId) {
      this.errorMessage = 'Por favor, selecione um cliente.';
      this.loading = false;
      return;
    }

    const clienteSelecionado = this.clientes.find(c => c.id === clienteId);

    if (!clienteSelecionado) {
      this.errorMessage = 'O cliente selecionado não foi encontrado.';
      this.loading = false;
      return;
    }

    const bicicletaData: Bicicleta = {
      marca: formValue.marca,
      modelo: formValue.modelo,
      tamanhoAro: formValue.tamanhoAro,
      cor: formValue.cor,
      cliente: clienteSelecionado
    };

    if (this.editingBicicleta && this.editingBicicleta.id) {
      // Atualizar bicicleta existente
      this.bicicletaService.update(this.editingBicicleta.id, bicicletaData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Bicicleta atualizada:', response);
            this.successMessage = 'Bicicleta atualizada com sucesso!';
            this.bicicletaForm.reset();
            this.editingBicicleta = null;
            this.carregarDados();
            this.loading = false;
          },
          error: (error) => {
            console.error('❌ Erro ao atualizar bicicleta:', error);
            this.errorMessage = 'Erro ao atualizar bicicleta. Tente novamente.';
            this.loading = false;
          }
        });
    } else {
      // Criar nova bicicleta
      this.bicicletaService.create(bicicletaData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Bicicleta criada:', response);
            this.successMessage = 'Bicicleta criada com sucesso!';
            this.bicicletaForm.reset();
            this.editingBicicleta = null;
            this.carregarDados();
            this.loading = false;
          },
          error: (error) => {
            console.error('❌ Erro ao criar bicicleta:', error);
            this.errorMessage = 'Erro ao criar bicicleta. Tente novamente.';
            this.loading = false;
          }
        });
    }
  }

  /**
   * Edita uma bicicleta
   */
  editarBicicleta(bicicleta: Bicicleta): void {
    this.editingBicicleta = bicicleta;
    this.bicicletaForm.patchValue({
      marca: bicicleta.marca,
      modelo: bicicleta.modelo,
      tamanhoAro: bicicleta.tamanhoAro,
      cor: bicicleta.cor,
      selectedClienteId: bicicleta.cliente?.id || ''
    });
    this.scrollToForm();
  }

  /**
   * Exclui uma bicicleta
   */
  excluirBicicleta(id?: number): void {
    const bicicletaId = id || this.editingBicicleta?.id;

    if (!bicicletaId) {
      this.errorMessage = 'Bicicleta não identificada.';
      return;
    }

    if (confirm('Tem certeza que deseja excluir esta bicicleta?')) {
      this.loading = true;
      this.errorMessage = '';

      this.bicicletaService.delete(bicicletaId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Bicicleta excluída:', response);
            this.successMessage = 'Bicicleta excluída com sucesso!';
            this.bicicletaForm.reset();
            this.editingBicicleta = null;
            this.carregarDados();
            this.loading = false;
          },
          error: (error) => {
            console.error('❌ Erro ao excluir bicicleta:', error);
            this.errorMessage = 'Erro ao excluir bicicleta. Tente novamente.';
            this.loading = false;
          }
        });
    }
  }

  /**
   * Cancela a edição de uma bicicleta
   */
  cancelarEdicaoBicicleta(): void {
    this.bicicletaForm.reset();
    this.editingBicicleta = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Aplica filtros à lista de bicicletas
   */
  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let filtradas = [...this.bicicletas];

    if (filtros.cliente) {
      filtradas = filtradas.filter(bike =>
        bike.cliente?.nome.toLowerCase().includes(filtros.cliente.toLowerCase())
      );
    }

    if (filtros.marca) {
      filtradas = filtradas.filter(bike =>
        bike.marca.toLowerCase().includes(filtros.marca.toLowerCase())
      );
    }

    if (filtros.modelo) {
      filtradas = filtradas.filter(bike =>
        bike.modelo.toLowerCase().includes(filtros.modelo.toLowerCase())
      );
    }

    if (filtros.cor) {
      filtradas = filtradas.filter(bike =>
        bike.cor.toLowerCase().includes(filtros.cor.toLowerCase())
      );
    }

    if (filtros.tamanhoAro) {
      filtradas = filtradas.filter(bike =>
        bike.tamanhoAro.toString().includes(filtros.tamanhoAro.toString())
      );
    }

    this.bicicletasFiltradas = filtradas;
  }

  /**
   * Aplica os filtros
   */
  filtrar(): void {
    this.carregarDados();
  }

  /**
   * Limpa os filtros
   */
  limparFiltros(): void {
    this.filtrosForm.reset();
    this.carregarDados();
  }

  /**
   * Abre o modal de histórico
   */
  abrirHistorico(bicicleta: Bicicleta): void {
    this.selectedBicicletaId = bicicleta.id!;
    this.showModal = true;
    if (this.modal) {
      this.modal.nativeElement.showModal();
    }
  }

  /**
   * Fecha o modal de histórico
   */
  fecharModal(): void {
    this.showModal = false;
    this.selectedBicicletaId = null;
    if (this.modal) {
      this.modal.nativeElement.close();
    }
  }

  /**
   * Obtém o status da ordem de serviço para uma bicicleta
   */
  getStatusOS(bicicletaId?: number): string {
    const id = bicicletaId || this.selectedBicicletaId;
    const os = this.ordensServico.find(o => o.bicicleta?.id === id);
    return os ? os.status : '';
  }

  /**
   * Retorna a classe CSS para o status
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'ABERTA': return 'aberta';
      case 'EM_ANDAMENTO': return 'em-andamento';
      case 'CONCLUIDA': return 'concluida';
      case 'ENTREGUE': return 'entregue';
      default: return '';
    }
  }

  /**
   * Formata o status para exibição
   */
  formatStatus(status: string): string {
    switch (status) {
      case 'ABERTA': return 'Aberta';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'CONCLUIDA': return 'Concluída';
      case 'ENTREGUE': return 'Entregue';
      default: return status;
    }
  }

  /**
   * Scroll suave até o formulário
   */
  private scrollToForm(): void {
    setTimeout(() => {
      const formElement = document.querySelector('.form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Exporta dados de bicicletas em CSV
   */
  exportarBicicletasCSV(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.exportarService.exportarEBaixar('bicicletas', `bicicletas_${new Date().getTime()}.csv`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = '✅ Bicicletas exportadas com sucesso!';
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao exportar bicicletas:', error);
          this.errorMessage = 'Erro ao exportar bicicletas. Tente novamente.';
          this.loading = false;
        }
      });
  }
}
