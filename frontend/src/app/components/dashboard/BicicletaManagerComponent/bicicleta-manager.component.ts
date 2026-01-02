import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Interfaces
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bicicleta-manager.component.html',
  styleUrls: ['./bicicleta-manager.component.css']
})
export class BicicletaManagerComponent implements OnInit {
  // Dados
  bicicletas: Bicicleta[] = [];
  clientes: Cliente[] = [];

  // Form
  bicicletaForm: FormGroup;

  // Estados
  loading = false;
  error = '';
  editingBicicleta: Bicicleta | null = null;

  constructor(private fb: FormBuilder) {
    this.bicicletaForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      tamanhoAro: ['', [Validators.required, Validators.min(1)]],
      cor: ['', Validators.required],
      selectedClienteId: [null],
      clienteNome: [''],
      clienteTelefone: [''],
      clienteEndereco: ['']
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;

    // Carrega bicicletas
    const bicicletasData = localStorage.getItem('bicicletas');
    this.bicicletas = bicicletasData ? JSON.parse(bicicletasData) : [];

    // Carrega clientes
    const clientesData = localStorage.getItem('clientes');
    this.clientes = clientesData ? JSON.parse(clientesData) : [];

    this.loading = false;
  }

  salvarBicicleta(): void {
    if (this.bicicletaForm.valid) {
      const formValue = this.bicicletaForm.value;
      const novaBicicleta: Bicicleta = {
        marca: formValue.marca,
        modelo: formValue.modelo,
        tamanhoAro: formValue.tamanhoAro,
        cor: formValue.cor,
        cliente: {} as any
      };

      let clienteSelecionado: Cliente | null = null;

      if (formValue.selectedClienteId) {
        clienteSelecionado = this.clientes.find(c => c.id === formValue.selectedClienteId) || null;
        if (!clienteSelecionado) {
          this.error = 'Cliente selecionado não encontrado.';
          return;
        }
      } else if (formValue.clienteNome || formValue.clienteTelefone) {
        const novoCliente: Cliente = {
          nome: formValue.clienteNome,
          telefone: formValue.clienteTelefone,
          endereco: formValue.clienteEndereco || ''
        };
        const newClienteId = this.clientes.length > 0 ? Math.max(...this.clientes.map(c => c.id || 0)) + 1 : 1;
        novoCliente.id = newClienteId;
        this.clientes.push(novoCliente);
        this.salvarNoLocalStorage('clientes', this.clientes);
        clienteSelecionado = novoCliente;
      } else {
        this.error = 'Selecione um cliente existente ou preencha pelo menos nome ou telefone para criar um novo.';
        return;
      }

      novaBicicleta.cliente = {
        id: clienteSelecionado.id!,
        nome: clienteSelecionado.nome,
        telefone: clienteSelecionado.telefone,
        endereco: clienteSelecionado.endereco
      };

      if (this.editingBicicleta) {
        const index = this.bicicletas.findIndex(b => b.id === this.editingBicicleta!.id);
        if (index !== -1) {
          this.bicicletas[index] = { ...novaBicicleta, id: this.editingBicicleta.id };
        }
      } else {
        const newId = this.bicicletas.length > 0 ? Math.max(...this.bicicletas.map(b => b.id || 0)) + 1 : 1;
        novaBicicleta.id = newId;
        this.bicicletas.push(novaBicicleta);
      }

      this.salvarNoLocalStorage('bicicletas', this.bicicletas);
      this.bicicletaForm.reset();
      this.editingBicicleta = null;
      this.error = '';
    }
  }

  editarBicicleta(bicicleta: Bicicleta): void {
    this.editingBicicleta = bicicleta;
    this.bicicletaForm.patchValue({
      marca: bicicleta.marca,
      modelo: bicicleta.modelo,
      tamanhoAro: bicicleta.tamanhoAro,
      cor: bicicleta.cor,
      selectedClienteId: bicicleta.cliente.id,
      clienteNome: '',
      clienteTelefone: '',
      clienteEndereco: ''
    });
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

  formatarTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 2) {
      if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2})/, '($1');
    }

    this.bicicletaForm.get('clienteTelefone')?.setValue(value, { emitEvent: false });
  }

  private salvarNoLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}
