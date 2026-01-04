import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  bicicletas: Bicicleta[] = [];
  clientes: Cliente[] = [];
  bicicletaForm: FormGroup;
  loading = false;
  error = '';
  editingBicicleta: Bicicleta | null = null;

  constructor(private fb: FormBuilder) {
    this.bicicletaForm = this.fb.group({
      selectedClienteId: [''], // ID do cliente existente
      clienteNome: [''],       // Campos para novo cliente
      clienteTelefone: [''],
      clienteEndereco: [''],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      tamanhoAro: ['', [Validators.required, Validators.min(12), Validators.max(29)]],
      cor: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    const bks = localStorage.getItem('bicicletas');
    const cls = localStorage.getItem('clientes');
    this.bicicletas = bks ? JSON.parse(bks) : [];
    this.clientes = cls ? JSON.parse(cls) : [];
  }

  salvarBicicleta(): void {
    if (this.bicicletaForm.valid) {
      const formValue = this.bicicletaForm.value;
      let clienteFinal: any = null;

      // 1. Lógica para Cliente Existente
      if (formValue.selectedClienteId) {
        // ✅ CORREÇÃO AQUI: Converter para Number para garantir a comparação correta
        const idProcurado = Number(formValue.selectedClienteId);
        clienteFinal = this.clientes.find(c => c.id === idProcurado);

        if (!clienteFinal) {
          this.error = 'O cliente selecionado não foi encontrado na base de dados.';
          return;
        }
      } 
      // 2. Lógica para Novo Cliente
      else if (formValue.clienteNome && formValue.clienteTelefone) {
        clienteFinal = {
          id: Date.now(),
          nome: formValue.clienteNome,
          telefone: formValue.clienteTelefone,
          endereco: formValue.clienteEndereco || 'Endereço não informado'
        };
        // Salva o novo cliente no LocalStorage
        this.clientes.push(clienteFinal);
        localStorage.setItem('clientes', JSON.stringify(this.clientes));
      }

      if (!clienteFinal) {
        this.error = 'Por favor, selecione um cliente ou preencha os dados de um novo.';
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

}
