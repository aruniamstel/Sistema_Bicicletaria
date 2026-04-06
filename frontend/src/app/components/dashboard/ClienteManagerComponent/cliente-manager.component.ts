import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Cliente } from '../../../shared/models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';
import { ExportarService } from '../../../services/exportar.service';

@Component({
  selector: 'app-cliente-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-manager.component.html',
  styleUrls: ['./cliente-manager.component.css']
})
export class ClienteManagerComponent implements OnInit, OnDestroy {
  // Dados
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];

  // Form
  clienteForm: FormGroup;
  filtrosForm: FormGroup;

  // Estados
  loading = false;
  loadingOperation = false;
  errorMessage = '';
  successMessage = '';
  editingCliente: Cliente | null = null;
  searchTerm: string = '';

  // Cleanup
  private destroy$ = new Subject<void>();

  @ViewChild('fileInputClientes') fileInputClientes!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private exportarService: ExportarService
  ) {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      telefone: [''],
      endereco: [''],
      instagram: ['']
    });

    this.filtrosForm = this.fb.group({
      termoBusca: [''],
      telefone: ['']
    });

    // Filtragem reativa
    this.filtrosForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  ngOnInit(): void {
    this.carregarClientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega a lista de clientes do backend
   */
  carregarClientes(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.clienteService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('✅ Clientes carregados:', data);
          this.clientes = data;
          this.aplicarFiltros();
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar clientes:', error);
          
          if (error.status === 0) {
            this.errorMessage = 'Erro de conexão: Verifique se o backend está rodando em http://localhost:8080';
          } else if (error.status === 404) {
            this.errorMessage = 'Endpoint não encontrado: Verifique a URL da API';
          } else {
            this.errorMessage = `Erro ${error.status}: ${error.statusText || 'Erro ao carregar clientes'}`;
          }
          
          this.loading = false;
          this.clientes = [];
          this.clientesFiltrados = [];
        }
      });
  }

  /**
   * Salva um cliente (criar ou atualizar)
   */
  salvarCliente(): void {
    if (this.clienteForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.loadingOperation = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.clienteForm.value;
    const novoCliente: Cliente = {
      nome: formValue.nome,
      telefone: formValue.telefone,
      endereco: formValue.endereco,
      instagram: formValue.instagram || undefined
    };

    if (this.editingCliente && this.editingCliente.id) {
      // Atualizar cliente existente
      this.clienteService.update(this.editingCliente.id, novoCliente)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Cliente atualizado:', response);
            this.successMessage = 'Cliente atualizado com sucesso!';
            this.carregarClientes();
            this.clienteForm.reset();
            this.editingCliente = null;
            this.loadingOperation = false;
          },
          error: (error) => {
            console.error('❌ Erro ao atualizar cliente:', error);
            this.errorMessage = 'Erro ao atualizar cliente. Tente novamente.';
            this.loadingOperation = false;
          }
        });
    } else {
      // Criar novo cliente
      this.clienteService.create(novoCliente)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Cliente criado:', response);
            this.successMessage = 'Cliente criado com sucesso!';
            this.carregarClientes();
            this.clienteForm.reset();
            this.editingCliente = null;
            this.loadingOperation = false;
          },
          error: (error) => {
            console.error('❌ Erro ao criar cliente:', error);
            this.errorMessage = 'Erro ao criar cliente. Tente novamente.';
            this.loadingOperation = false;
          }
        });
    }
  }

  /**
   * Edita um cliente
   */
  editarCliente(cliente: Cliente): void {
    this.editingCliente = cliente;
    this.clienteForm.patchValue({
      nome: cliente.nome,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      instagram: cliente.instagram || ''
    });
    this.errorMessage = '';
    this.successMessage = '';
    this.scrollToForm();
  }

  /**
   * Exclui um cliente
   */
  excluirCliente(id?: number): void {
    const clienteId = id || this.editingCliente?.id;

    if (!clienteId) {
      this.errorMessage = 'Cliente não identificado.';
      return;
    }

    // Encontrar cliente para verificar ordens e bicicletas
    let cliente = this.clientes.find(c => c.id === clienteId);
    if (!cliente) {
      this.errorMessage = 'Cliente não encontrado.';
      return;
    }

    // Verificar se cliente possui bicicletas e/ou ordens de serviço
    const temBicicletas = cliente.bicicletas && cliente.bicicletas.length > 0;
    const temOrdens = cliente.ordensServico && cliente.ordensServico.length > 0;
    const quantidadeBicicletas = cliente.bicicletas?.length || 0;
    const quantidadeOrdens = cliente.ordensServico?.length || 0;

    //let mensagem = 'Tem certeza que deseja excluir este cliente?';

    let mensagem = `Tem certeza que deseja excluir este cliente? ` +
                 `Apagá-lo excluirá permanentemente TODAS as bicicletas, ordens e históricos vinculados. ` +
                 `Esta ação não pode ser desfeita.`;
    
    if (temBicicletas || temOrdens) {
      let detalhes = '';
      if (temBicicletas) {
        detalhes += `${quantidadeBicicletas} bicicleta(s)`;
      }
      if (temOrdens) {
        detalhes += (detalhes ? ' e ' : '') + `${quantidadeOrdens} ordem(ns) de serviço`;
      }
      
      mensagem = `O cliente "${cliente.nome}" possui ${detalhes} vinculada(s). ` +
                 `Apagá-lo excluirá permanentemente TODAS as bicicletas, ordens e históricos. ` +
                 `Esta ação não pode ser desfeita. Tem certeza absoluta?`;
    }

    if (!confirm(mensagem)) {
      return;
    }

    this.loadingOperation = true;
    this.errorMessage = '';

    this.clienteService.delete(clienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Cliente excluído:', response);
          this.successMessage = 'Cliente excluído com sucesso!';
          this.carregarClientes();
          this.clienteForm.reset();
          this.editingCliente = null;
          this.loadingOperation = false;
        },
        error: (error) => {
          console.error('❌ Erro ao excluir cliente:', error);
          this.errorMessage = 'Erro ao excluir cliente. Tente novamente.';
          this.loadingOperation = false;
        }
      });
  }

  /**
   * Cancela a edição de um cliente
   */
  cancelarEdicaoCliente(): void {
    this.clienteForm.reset();
    this.editingCliente = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Aplica filtros à lista de clientes
   */
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

  /**
   * Limpa os filtros
   */
  limparFiltros(): void {
    this.filtrosForm.reset();
    this.clientesFiltrados = [...this.clientes];
  }

  /**
   * Formata o telefone enquanto o usuário digita
   */
// No seu arquivo .ts
formatarTelefone(event: any): void {
  let input = event.target;
  let value = input.value.replace(/\D/g, '');

  if (value.length > 11) value = value.substring(0, 11);

  // Lógica da máscara
  let formattedValue = value;
  if (value.length > 0) {
    formattedValue = value.replace(/^(\d{2})/, '($1) ');
  }
  if (value.length > 9) {
    formattedValue = formattedValue.replace(/(\d{5})(\d{4})$/, '$1-$2');
  } else if (value.length > 5) {
    formattedValue = formattedValue.replace(/(\d{4})(\d{0,4})$/, '$1-$2');
  }

  // ATUALIZAÇÃO CRUCIAL:
  // Atualiza o valor visual no input
  input.value = formattedValue;

  // Atualiza o valor no FormControl para que o Angular "saiba" da mudança
  // Substitua 'telefone' pelo nome do seu campo no FormGroup
  this.clienteForm.get('telefone')?.setValue(formattedValue, { emitEvent: false });
}

  /**
   * Tenta carregar novamente em caso de erro
   */
  retry(): void {
    this.carregarClientes();
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
   * Exporta dados de clientes em CSV
   */
  exportarClientesCSV(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.exportarService.exportarEBaixar('clientes', `clientes_${new Date().getTime()}.csv`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = '✅ Clientes exportados com sucesso!';
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao exportar clientes:', error);
          this.errorMessage = 'Erro ao exportar clientes. Tente novamente.';
          this.loading = false;
        }
      });
  }

  /**
   * Dispara o click do input file de importação
   */
  abrirImportacaoClientes(): void {
    this.fileInputClientes.nativeElement.click();
  }

  /**
   * Processa o arquivo selecionado para importação de clientes
   */
  onFileSelected(event: any): void {
    const file: File | null = event.target.files ? event.target.files[0] : null;

    if (!file) {
      this.errorMessage = 'Nenhum arquivo foi selecionado.';
      return;
    }

    // Validar extensão do arquivo
    if (!file.name.endsWith('.csv')) {
      this.errorMessage = 'Por favor, selecione um arquivo CSV válido.';
      event.target.value = ''; // Limpar o input
      return;
    }

    this.loadingOperation = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.exportarService.importarCsv('clientes', file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Importação de clientes bem-sucedida:', response);
          this.successMessage = response || '✅ Clientes importados com sucesso!';
          this.carregarClientes();
          this.loadingOperation = false;
          event.target.value = ''; // Limpar o input
        },
        error: (error) => {
          console.error('❌ Erro ao importar clientes:', error);
          const errorMsg = error?.error || error?.message || 'Erro ao importar clientes. Verifique o arquivo e tente novamente.';
          this.errorMessage = errorMsg;
          this.loadingOperation = false;
          event.target.value = ''; // Limpar o input
        }
      });
  }
}
