import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdemServico } from '../../../shared/models/ordem-servico.model';
import { OrdemServicoService } from '../../../services/ordem-servico.service';
import { ServicoService } from '../../../services/servico.service';
import { PecaService } from '../../../services/peca.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../header/header.component";
import { Cliente } from '../../../shared/models/cliente.model';
import { Bicicleta } from '../../../shared/models/bicicleta.model';

@Component({
  selector: 'app-ordem-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,HeaderComponent],
  templateUrl: './ordem-details.component.html',
  styleUrls: ['./ordem-details.component.css'],
})
export class OrdemDetailsComponent implements OnInit, OnDestroy {
  ordem: OrdemServico = {
    id: 0,
    status: "ABERTA",
    observacoes: '',
    dataEntrada: new Date().toISOString(),
    exibirAviso30Dias: true,
    cliente: {} as Cliente,
    bicicleta: {} as Bicicleta,
    servicos: [],
    pecas: [],
    valorTotal: 0
  };

  servicoForm: FormGroup;
  pecaForm: FormGroup;
  servicos: any[] = [];
  pecas: any[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private ordemService: OrdemServicoService,
    private servicoService: ServicoService,
    private pecaService: PecaService
  ) {
    this.servicoForm = this.fb.group({
      servicoId: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]]
    });

    this.pecaForm = this.fb.group({
      pecaId: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const orderId = Number(id);
      this.loading = true;
      this.carregarServicosEPecas();
      this.loadOrdem(orderId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarServicosEPecas(): void {
    // Carregar serviços
    this.servicoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.servicos = data || [];
          console.log('🔧 Serviços carregados:', this.servicos);
        },
        error: (error) => {
          console.error('❌ Erro ao carregar serviços:', error);
          this.servicos = [];
        }
      });

    // Carregar peças
    this.pecaService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.pecas = data || [];
          console.log('📦 Peças carregadas:', this.pecas);
        },
        error: (error) => {
          console.error('❌ Erro ao carregar peças:', error);
          this.pecas = [];
        }
      });
  }

  private loadOrdem(id: number): void {
    this.errorMessage = '';

    this.ordemService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.ordem = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar ordem:', error);
          this.errorMessage = 'Erro ao carregar ordem de serviço: ' + error.message;
          this.loading = false;
        }
      });
  }

  addServico(): void {
    if (this.servicoForm.invalid || !this.ordem?.id) {
      this.errorMessage = 'Selecione um serviço válido';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { servicoId, quantidade } = this.servicoForm.value;

    this.ordemService.addServico(this.ordem.id, servicoId, quantidade)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ordem) => {
          this.ordem = ordem;
          this.successMessage = '✅ Serviço adicionado com sucesso!';
          this.servicoForm.reset({ quantidade: 1 });
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao adicionar serviço:', error);
          this.errorMessage = 'Erro ao adicionar serviço: ' + error.message;
          this.loading = false;
        }
      });
  }

  updateStatus(status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE'): void {
    if (!this.ordem?.id) {
      this.errorMessage = 'Ordem não encontrada';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.ordemService.updateStatus(this.ordem.id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ordem) => {
          this.ordem = ordem;
          this.successMessage = '✅ Status atualizado com sucesso!';
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao atualizar status:', error);
          this.errorMessage = 'Erro ao atualizar status: ' + error.message;
          this.loading = false;
        }
      });
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'ABERTA': return 'Aberta';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'CONCLUIDA': return 'Concluída';
      case 'ENTREGUE': return 'Entregue';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ABERTA': return 'status-aberta';
      case 'EM_ANDAMENTO': return 'status-andamento';
      case 'CONCLUIDA': return 'status-concluida';
      case 'ENTREGUE': return 'status-entregue';
      default: return '';
    }
  }

  voltar(): void {
    this.router.navigate(['/ordens-servico']);
  }
}