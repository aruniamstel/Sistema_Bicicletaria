import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente } from '../../../shared/models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-cliente-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-manager.component.html',
  styleUrls: ['./cliente-manager.component.css']
})
export class ClienteManagerComponent implements OnInit {
  // Dados
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];

  // Form
  clienteForm: FormGroup;
  filtrosForm: FormGroup;

  // Estados
  loading = false;
  error = '';
  editingCliente: Cliente | null = null;
  searchTerm: string = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService
  ) {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      endereco: ['', Validators.required],
      instagram: ['']
    });

    this.filtrosForm = this.fb.group({
      termoBusca: [''],
      telefone: ['']
    });

    // Filtragem reativa
    this.filtrosForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.loading = true;
    this.error = '';

    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.aplicarFiltros();
        this.loading = false;
        console.log('Clientes carregados com sucesso:', data);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);

        if (error.status === 0) {
          this.error = 'Erro de conexão: Verifique se o backend está rodando na porta 8081';
        } else if (error.status === 404) {
          this.error = 'Endpoint não encontrado: Verifique a URL da API';
        } else {
          this.error = `Erro ${error.status}: ${error.statusText || 'Erro ao carregar clientes'}`;
        }

        this.loading = false;
        this.clientes = [];
        this.clientesFiltrados = [];
      }
    });
  }

  salvarCliente(): void {
    if (this.clienteForm.valid) {
      const formValue = this.clienteForm.value;
      const novoCliente: Cliente = {
        nome: formValue.nome,
        telefone: formValue.telefone,
        endereco: formValue.endereco,
        instagram: formValue.instagram || undefined
      };

      if (this.editingCliente && this.editingCliente.id) {
        // Editar cliente existente
        this.clienteService.update(this.editingCliente.id, novoCliente).subscribe({
          next: () => {
            this.carregarClientes();
            this.clienteForm.reset();
            this.editingCliente = null;
            console.log('Cliente atualizado com sucesso');
          },
          error: (error) => {
            console.error('Erro ao atualizar cliente:', error);
            this.error = `Erro ao atualizar cliente: ${error.status || 'Erro desconhecido'}`;
          }
        });
      } else {
        // Criar novo cliente
        this.clienteService.create(novoCliente).subscribe({
          next: () => {
            this.carregarClientes();
            this.clienteForm.reset();
            this.editingCliente = null;
            console.log('Cliente criado com sucesso');
          },
          error: (error) => {
            console.error('Erro ao criar cliente:', error);
            this.error = `Erro ao criar cliente: ${error.status || 'Erro desconhecido'}`;
          }
        });
      }
    }
  }

  editarCliente(cliente: Cliente): void {
    this.editingCliente = cliente;
    this.clienteForm.patchValue({
      nome: cliente.nome,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      instagram: cliente.instagram || ''
    });
  }

  excluirCliente(id: number): void {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.clienteService.delete(id).subscribe({
        next: () => {
          this.carregarClientes();
          console.log('Cliente excluído com sucesso');
        },
        error: (error) => {
          console.error('Erro ao excluir cliente:', error);
          this.error = `Erro ao excluir cliente: ${error.status || 'Erro desconhecido'}`;
        }
      });
    }
  }

  cancelarEdicaoCliente(): void {
    this.clienteForm.reset();
    this.editingCliente = null;
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let filtrados = [...this.clientes];

    if (filtros.termoBusca) {
      filtrados = filtrados.filter(cliente =>
        cliente.nome.toLowerCase().includes(filtros.termoBusca.toLowerCase())
      );
    }

    if (filtros.telefone) {
      filtrados = filtrados.filter(cliente =>
        cliente.telefone.includes(filtros.telefone)
      );
    }

    this.clientesFiltrados = filtrados;
  }

  limparFiltros(): void {
    this.filtrosForm.reset();
    this.clientesFiltrados = [...this.clientes];
  }

  formatarTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 2) {
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    }

    event.target.value = value;
  }

  retry(): void {
    this.carregarClientes();
  }
}
