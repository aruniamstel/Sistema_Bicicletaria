import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdemServico } from '../../../shared/models/ordem-servico.model';
import { HistoricoBicicletaComponent } from '../HistoricoBicicletaComponent/historico-bicicleta.component';

export interface Cliente {
  id?: number;
  nome: string;
  telefone: string;
  endereco: string;
  instagram?: string;
}

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

@Component({
  selector: 'app-bicicleta-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HistoricoBicicletaComponent],
  templateUrl: './bicicleta-manager.component.html',
  styleUrls: ['./bicicleta-manager.component.css']
})
export class BicicletaManagerComponent implements OnInit {
  bicicletas: Bicicleta[] = [];
  bicicletasEmServico: Bicicleta[] = [];
  clientes: Cliente[] = [];
  ordensServico: OrdemServico[] = [];
  bicicletaForm: FormGroup;
  filtrosForm: FormGroup;
  loading = false;
  error = '';
  editingBicicleta: Bicicleta | null = null;
  showModal = false;
  selectedBicicletaId: number | null = null;

  @ViewChild('modalHistorico') modal!: ElementRef<HTMLDialogElement>;

  constructor(private fb: FormBuilder) {
    this.bicicletaForm = this.fb.group({
      selectedClienteId: ['', Validators.required], // Cliente obrigatório
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      tamanhoAro: ['', [Validators.required, Validators.min(12), Validators.max(29)]],
      cor: ['', Validators.required]
    });

    this.filtrosForm = this.fb.group({
      marca: [''],
      cor: [''],
      modelo: [''],
      tamanhoAro: ['']
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    const bks = localStorage.getItem('bicicletas');
    const cls = localStorage.getItem('clientes');
    const ordens = localStorage.getItem('ordens-servico');
    this.bicicletas = bks ? JSON.parse(bks) : [];
    this.clientes = cls ? JSON.parse(cls) : [];
    this.ordensServico = ordens ? JSON.parse(ordens) : [];

    this.aplicarFiltros();
  }

  salvarBicicleta(): void {
    if (this.bicicletaForm.valid) {
      const formValue = this.bicicletaForm.value;
      const idSelecionado = Number(formValue.selectedClienteId);

      if (!idSelecionado) {
        this.error = 'Por favor, selecione um cliente.';
        return;
      }

      const clienteFinal = this.clientes.find(c => c.id === idSelecionado);

      if (!clienteFinal) {
        this.error = 'O cliente selecionado não foi encontrado na base de dados.';
        return;
      }

      const novaBicicleta: Bicicleta = {
        id: this.editingBicicleta ? this.editingBicicleta.id : Date.now(),
        marca: formValue.marca,
        modelo: formValue.modelo,
        tamanhoAro: formValue.tamanhoAro,
        cor: formValue.cor,
        cliente: {
          id: clienteFinal.id,
          nome: clienteFinal.nome,
          telefone: clienteFinal.telefone,
          endereco: clienteFinal.endereco
        }
      };

      if (this.editingBicicleta) {
        const index = this.bicicletas.findIndex(b => b.id === this.editingBicicleta?.id);
        this.bicicletas[index] = novaBicicleta;
      } else {
        this.bicicletas.push(novaBicicleta);
      }

      this.salvarNoLocalStorage('bicicletas', this.bicicletas);
      this.bicicletaForm.reset();
      this.editingBicicleta = null;
      this.error = '';
      alert('Bicicleta salva com sucesso!');
    }
  }

  private salvarNoLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  editarBicicleta(bicicleta: Bicicleta): void {
    this.editingBicicleta = bicicleta;
    this.bicicletaForm.patchValue({
      marca: bicicleta.marca,
      modelo: bicicleta.modelo,
      tamanhoAro: bicicleta.tamanhoAro,
      cor: bicicleta.cor,
      selectedClienteId: bicicleta.cliente.id
    });
    // Scroll suave até o formulário
    this.scrollToForm();
  }

  private scrollToForm(): void {
    setTimeout(() => {
      const formElement = document.querySelector('.form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  excluirBicicleta(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta bicicleta?')) {
      this.bicicletas = this.bicicletas.filter(b => b.id !== id);
      this.salvarNoLocalStorage('bicicletas', this.bicicletas);
    }
  }

  cancelarEdicaoBicicleta(): void {
    this.bicicletaForm.reset();
    this.editingBicicleta = null;
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let filtradas = [...this.bicicletas];

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

    this.bicicletas = filtradas;
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

}
