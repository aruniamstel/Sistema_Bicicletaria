import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from "../header/header.component";
import { HistoricoBicicletaComponent } from "../dashboard/HistoricoBicicletaComponent/historico-bicicleta.component";
import { BicicletaService } from '../../services/bicicleta.service';
import { OrdemServicoService } from '../../services/ordem-servico.service';
import { Bicicleta } from '../../shared/models/bicicleta.model';
import { OrdemServico } from '../../shared/models/ordem-servico.model';

@Component({
  selector: 'app-bicicletas-em-servico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent, HistoricoBicicletaComponent],
  templateUrl: './bicicletas-em-servico.component.html',
  styleUrls: ['./bicicletas-em-servico.component.css']
})
export class BicicletasEmServicoComponent implements OnInit, OnDestroy {
  // Dados
  todasBicicletas: Bicicleta[] = [];
  todasOrdensServico: OrdemServico[] = [];
  bicicletasEmServico: Bicicleta[] = [];
  
  // Formulário de filtros
  filtrosForm: FormGroup;
  
  // Estado de carregamento
  loading: boolean = false;
  errorMessage: string = '';
  
  // Modal
  showModal = false;
  selectedBicicletaId: number | null = null;

  @ViewChild('modalHistorico') modal!: ElementRef<HTMLDialogElement>;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private bicicletaService: BicicletaService,
    private ordemServicoService: OrdemServicoService
  ) {
    this.filtrosForm = this.fb.group({
      cliente: [''],
      dataEntradaInicio: [''],
      dataEntradaFim: [''],
      dataPrevisaoInicio: [''],
      dataPrevisaoFim: [''],
      marca: [''],
      cor: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega bicicletas e ordens de serviço do backend
   */
  carregarDados(): void {
    this.loading = true;
    this.errorMessage = '';

    // Carregar bicicletas
    this.bicicletaService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bicicletas) => {
          this.todasBicicletas = bicicletas;
          console.log('📊 Bicicletas carregadas:', this.todasBicicletas.length);
          
          // Após carregar bicicletas, carregar ordens
          this.carregarOrdensServico();
        },
        error: (error) => {
          console.error('❌ Erro ao carregar bicicletas:', error);
          this.errorMessage = 'Erro ao carregar bicicletas. Tente novamente.';
          this.loading = false;
        }
      });
  }

  /**
   * Carrega ordens de serviço e filtra bicicletas em serviço
   */
  private carregarOrdensServico(): void {
    this.ordemServicoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ordens) => {
          this.todasOrdensServico = ordens;
          console.log('📊 Ordens carregadas:', this.todasOrdensServico.length);
          
          // Filtrar bicicletas que têm uma OS com status ativo (não Entregue)
          this.filtrarBicicletasEmServico();
          this.aplicarFiltros();
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar ordens:', error);
          this.errorMessage = 'Erro ao carregar ordens de serviço. Tente novamente.';
          this.loading = false;
        }
      });
  }

  /**
   * Filtra apenas bicicletas que têm ordens de serviço em aberto
   */
  private filtrarBicicletasEmServico(): void {
    this.bicicletasEmServico = this.todasBicicletas.filter(bike => {
      const osDaBike = this.todasOrdensServico.find(os => {
        // Valida se bicicleta existe (pode ser null para serviços avulsos)
        if (!os.bicicleta || !os.bicicleta.id) return false;
        return os.bicicleta.id === bike.id;
      });
      
      // Considera em serviço: qualquer status exceto ENTREGUE
      const temOsAtiva = osDaBike && osDaBike.status !== 'ENTREGUE';
      
      if (temOsAtiva) {
        console.log(`✅ ${bike.marca} ${bike.modelo} - Status: ${osDaBike?.status}`);
      }
      
      return temOsAtiva;
    });

    console.log('📊 Bicicletas em serviço:', this.bicicletasEmServico.length);
  }

  /**
   * Aplica filtros ao conjunto de bicicletas em serviço
   */
  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let filtradas = [...this.bicicletasEmServico];

    // Filtro por cliente
    if (filtros.cliente && filtros.cliente.trim()) {
      filtradas = filtradas.filter(bike =>
        bike.cliente?.nome?.toLowerCase().includes(filtros.cliente.toLowerCase())
      );
    }

    // Filtro por marca
    if (filtros.marca && filtros.marca.trim()) {
      filtradas = filtradas.filter(bike =>
        bike.marca?.toLowerCase().includes(filtros.marca.toLowerCase())
      );
    }

    // Filtro por cor
    if (filtros.cor && filtros.cor.trim()) {
      filtradas = filtradas.filter(bike =>
        bike.cor?.toLowerCase().includes(filtros.cor.toLowerCase())
      );
    }

    // Filtro por status
    if (filtros.status && filtros.status.trim()) {
      filtradas = filtradas.filter(bike => {
        const osDaBike = this.todasOrdensServico.find(os => os.bicicleta?.id === bike.id);
        return osDaBike && osDaBike.status === filtros.status;
      });
    }

    // Filtro por data de entrada
    if (filtros.dataEntradaInicio || filtros.dataEntradaFim) {
      filtradas = filtradas.filter(bike => {
        const osDaBike = this.todasOrdensServico.find(os => os.bicicleta?.id === bike.id);
        if (!osDaBike || !osDaBike.dataEntrada) return false;
        
        const dataEntrada = new Date(osDaBike.dataEntrada);
        
        if (filtros.dataEntradaInicio && dataEntrada < new Date(filtros.dataEntradaInicio)) {
          return false;
        }
        if (filtros.dataEntradaFim && dataEntrada > new Date(filtros.dataEntradaFim)) {
          return false;
        }
        return true;
      });
    }

    // Filtro por data de previsão de saída
    if (filtros.dataPrevisaoInicio || filtros.dataPrevisaoFim) {
      filtradas = filtradas.filter(bike => {
        const osDaBike = this.todasOrdensServico.find(os => os.bicicleta?.id === bike.id);
        if (!osDaBike || !osDaBike.dataPrevisaoSaida) return false;
        
        const dataPrevisao = new Date(osDaBike.dataPrevisaoSaida);
        
        if (filtros.dataPrevisaoInicio && dataPrevisao < new Date(filtros.dataPrevisaoInicio)) {
          return false;
        }
        if (filtros.dataPrevisaoFim && dataPrevisao > new Date(filtros.dataPrevisaoFim)) {
          return false;
        }
        return true;
      });
    }

    this.bicicletasEmServico = filtradas;
  }

  /**
   * Reaplica filtros quando o usuário interage
   */
  filtrar(): void {
    this.aplicarFiltros();
  }

  /**
   * Limpa todos os filtros
   */
  limparFiltros(): void {
    this.filtrosForm.reset();
    this.filtrarBicicletasEmServico();
    this.aplicarFiltros();
  }

  /**
   * Abre modal com histórico de uma bicicleta
   */
  abrirHistorico(bicicleta: Bicicleta): void {
    this.selectedBicicletaId = bicicleta.id!;
    this.showModal = true;
    if (this.modal) {
      this.modal.nativeElement.showModal();
    }
    this.scrollToBottom();
  }

  /**
   * Fecha modal de histórico
   */
  fecharModal(): void {
    this.showModal = false;
    this.selectedBicicletaId = null;
    if (this.modal) {
      this.modal.nativeElement.close();
    }
  }

  /**
   * Obtém status da OS para uma bicicleta
   */
  getStatusOS(bicicletaId: number): string {
    const os = this.todasOrdensServico.find(os => os.bicicleta?.id === bicicletaId);
    return os ? os.status : '';
  }

  /**
   * Retorna classe CSS baseada no status
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
   * Formata status em português
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
   * Scroll para o final da página
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  }
}
