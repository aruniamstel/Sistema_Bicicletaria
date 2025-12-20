import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrdemServico } from '../../../shared/models/ordem-servico.model';
import { OrdemServicoService } from '../../../services/ordem-servico.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../header/header.component";

@Component({
  selector: 'app-ordem-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,HeaderComponent],
  templateUrl: './ordem-details.component.html',
  styleUrls: ['./ordem-details.component.css'],
})
export class OrdemDetailsComponent implements OnInit {
  ordem: OrdemServico = {
    id: 0,
    status: 'ABERTA',
    observacoes: '',
    dataEntrada: 'dd/mm/yyyy',
    dataSaida: 'dd/mm/yyyy',
    valorTotal: 0,
    bicicleta: {
      marca: '',
      modelo: '',
      cor: '',
      tamanhoAro: 0,
      cliente: {
        nome: '',
        endereco: '',
        telefone: ''
      }
    },
    servicos: [],
    pecas: []
  };

  servicoForm: FormGroup;
  pecaForm: FormGroup;
  servicos: any[] = [];
  pecas: any[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private ordemService: OrdemServicoService
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
      this.loadOrdem(+id);
    }
      this.carregarServicosEPecas();
  }

  private carregarServicosEPecas(): void {
    try {
      // Carrega serviços
      const servicosData = localStorage.getItem('servicos');
      this.servicos = servicosData ? JSON.parse(servicosData) : [];
      console.log('🔧 Serviços carregados:', this.servicos);

      // Carrega peças
      const pecasData = localStorage.getItem('pecas');
      this.pecas = pecasData ? JSON.parse(pecasData) : [];
      console.log('⚙️ Peças carregadas:', this.pecas);
    } catch (error) {
      console.error('❌ Erro ao carregar serviços/peças:', error);
      this.servicos = [];
      this.pecas = [];
    }
  }

  loadOrdem(id: number): void {
    this.loading = true;
    this.ordemService.getById(id).subscribe({
      next: (data) => {
        this.ordem = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar ordem de serviço: ' + error.message;
        this.loading = false;
      }
    });
  }

  addServico(): void {
    if (this.servicoForm.valid && this.ordem) {
      const { servicoId, quantidade } = this.servicoForm.value;
      this.loading = true;

      this.ordemService.addServico(this.ordem.id!, servicoId, quantidade).subscribe({
        next: (ordem) => {
          this.ordem = ordem;
          this.servicoForm.reset({ quantidade: 1 });
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao adicionar serviço: ' + error.message;
          this.loading = false;
        }
      });
    }
  }

  addPeca(): void {
    if (this.pecaForm.valid && this.ordem) {
      const { pecaId, quantidade } = this.pecaForm.value;
      this.loading = true;

      this.ordemService.addPeca(this.ordem.id!, pecaId, quantidade).subscribe({
        next: (ordem) => {
          this.ordem = ordem;
          this.pecaForm.reset({ quantidade: 1 });
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao adicionar peça: ' + error.message;
          this.loading = false;
        }
      });
    }
  }

  updateStatus(status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE'): void {
    if (this.ordem) {
      this.loading = true;
      this.ordemService.updateStatus(this.ordem.id!, status).subscribe({
        next: (ordem) => {
          this.ordem = ordem;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao atualizar status: ' + error.message;
          this.loading = false;
        }
      });
    }
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