import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import { HistoricoBicicletaComponent } from "../dashboard/HistoricoBicicletaComponent/historico-bicicleta.component";

export interface Bicicleta {
  id?: number;
  marca: string;
  modelo: string;
  tamanhoAro: number;
  cor: string;
  cliente: {
    id: number;
    nome: string;
    telefone: string;
    endereco: string;
  };
}

export interface OrdemServico {
  id?: number;
  status: string;
  dataEntrada: string;
  dataPrevisaoSaida: string;
  bicicleta: {
    id: number;
  };
}

@Component({
  selector: 'app-bicicletas-em-servico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent, HistoricoBicicletaComponent],
  templateUrl: './bicicletas-em-servico.component.html',
  styleUrls: ['./bicicletas-em-servico.component.css']
})
export class BicicletasEmServicoComponent implements OnInit {
  bicicletas: Bicicleta[] = [];
  bicicletasEmServico: Bicicleta[] = [];
  ordensServico: OrdemServico[] = [];
  filtrosForm: FormGroup;
  
  showModal = false;
  selectedBicicletaId: number | null = null;

  @ViewChild('modalHistorico') modal!: ElementRef<HTMLDialogElement>;

  constructor(private fb: FormBuilder) {
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

  carregarDados(): void {
    const bks = localStorage.getItem('bicicletas');
    const ordens = localStorage.getItem('ordens-servico');
    this.bicicletas = bks ? JSON.parse(bks) : [];
    this.ordensServico = ordens ? JSON.parse(ordens) : [];

    console.log('📊 Bicicletas carregadas:', this.bicicletas.length);
    console.log('📊 Ordens carregadas:', this.ordensServico.length);

    // Filtrar bicicletas que têm uma OS com status ativo (não Entregue)
    this.bicicletasEmServico = this.bicicletas.filter(bike => {
      const osDaBike = this.ordensServico.find(os => {
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
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let filtradas = [...this.bicicletasEmServico];

    if (filtros.cliente) {
      filtradas = filtradas.filter(bike =>
        bike.cliente.nome.toLowerCase().includes(filtros.cliente.toLowerCase())
      );
    }

    if (filtros.marca) {
      filtradas = filtradas.filter(bike =>
        bike.marca.toLowerCase().includes(filtros.marca.toLowerCase())
      );
    }

    if (filtros.cor) {
      filtradas = filtradas.filter(bike =>
        bike.cor.toLowerCase().includes(filtros.cor.toLowerCase())
      );
    }

    if (filtros.status) {
      filtradas = filtradas.filter(bike => {
        const osDaBike = this.ordensServico.find(os => os.bicicleta.id === bike.id);
        return osDaBike && osDaBike.status === filtros.status;
      });
    }

    // Filtros de data
    if (filtros.dataEntradaInicio || filtros.dataEntradaFim) {
      filtradas = filtradas.filter(bike => {
        const osDaBike = this.ordensServico.find(os => os.bicicleta.id === bike.id);
        if (!osDaBike || !osDaBike.dataEntrada) return false;
        const dataEntrada = new Date(osDaBike.dataEntrada);
        if (filtros.dataEntradaInicio && dataEntrada < new Date(filtros.dataEntradaInicio)) return false;
        if (filtros.dataEntradaFim && dataEntrada > new Date(filtros.dataEntradaFim)) return false;
        return true;
      });
    }

    if (filtros.dataPrevisaoInicio || filtros.dataPrevisaoFim) {
      filtradas = filtradas.filter(bike => {
        const osDaBike = this.ordensServico.find(os => os.bicicleta.id === bike.id);
        if (!osDaBike || !osDaBike.dataPrevisaoSaida) return false;
        const dataPrevisao = new Date(osDaBike.dataPrevisaoSaida);
        if (filtros.dataPrevisaoInicio && dataPrevisao < new Date(filtros.dataPrevisaoInicio)) return false;
        if (filtros.dataPrevisaoFim && dataPrevisao > new Date(filtros.dataPrevisaoFim)) return false;
        return true;
      });
    }

    this.bicicletasEmServico = filtradas;
  }

  filtrar(): void {
    this.carregarDados();
  }

  limparFiltros(): void {
    this.filtrosForm.reset();
    this.carregarDados();
  }

  abrirHistorico(bicicleta: Bicicleta): void {
    this.selectedBicicletaId = bicicleta.id!;
    this.showModal = true;
    if (this.modal) {
      this.modal.nativeElement.showModal();
    }
    this.scrollToBottom();
  }

  fecharModal(): void {
    this.showModal = false;
    this.selectedBicicletaId = null;
    if (this.modal) {
      this.modal.nativeElement.close();
    }
  }

  getStatusOS(bicicletaId: number): string {
    const os = this.ordensServico.find(os => os.bicicleta.id === bicicletaId);
    return os ? os.status : '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ABERTA': return 'aberta';
      case 'EM_ANDAMENTO': return 'em-andamento';
      case 'CONCLUIDA': return 'concluida';
      case 'ENTREGUE': return 'entregue';
      default: return '';
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

  private scrollToBottom(): void {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  }
}
