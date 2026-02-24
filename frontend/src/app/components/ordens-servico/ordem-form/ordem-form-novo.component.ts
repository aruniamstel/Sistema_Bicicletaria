import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Cliente } from '../../../shared/models/cliente.model';
import { Bicicleta } from '../../../shared/models/bicicleta.model';
import { Servico, Peca, BicicletaComItens } from '../../../shared/models/ordem-servico.model';
import { ClienteService } from '../../../services/cliente.service';
import { BicicletaService } from '../../../services/bicicleta.service';
import { OrdemServicoService } from '../../../services/ordem-servico.service';
import { ServicoService } from '../../../services/servico.service';
import { PecaService } from '../../../services/peca.service';
import { HeaderComponent } from '../../header/header.component';

/**
 * Validador: Exige cliente OU (nome + telefone de novo cliente)
 */
function clienteOuNovoClienteValidator(control: AbstractControl): ValidationErrors | null {
  const cliente = control.get('cliente')?.value;
  const nomeNovoCliente = control.get('nomeNovoCliente')?.value;
  const telefoneNovoCliente = control.get('telefoneNovoCliente')?.value;

  const temCliente = cliente && cliente.toString().trim();
  const temNovoCliente = (nomeNovoCliente && nomeNovoCliente.toString().trim()) || 
                         (telefoneNovoCliente && telefoneNovoCliente.toString().trim());

  if (!temCliente && !temNovoCliente) {
    return { clienteRequired: true };
  }
  return null;
}

@Component({
  selector: 'app-ordem-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './ordem-form.component.html',
  styleUrls: ['./ordem-form.component.css']
})
export class OrdemFormComponent implements OnInit, OnDestroy {
  ordemForm: FormGroup;
  clientes: Cliente[] = [];
  todasBicicletas: Bicicleta[] = [];
  
  listaServicosDisponiveis: Servico[] = [];
  listaPecasDisponiveis: Peca[] = [];
  
  // NOVO: Carrinho de bicicletas
  bicicletasAdicionadas: BicicletaComItens[] = [];
  
  loading: boolean = false;
  loadingOperation: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private bicicletaService: BicicletaService,
    private ordemService: OrdemServicoService,
    private servicoService: ServicoService,
    private pecaService: PecaService,
    private router: Router
  ) {
    this.ordemForm = this.fb.group({
      // Cliente
      cliente: [''],
      nomeNovoCliente: [''],
      telefoneNovoCliente: [''],
      enderecoNovoCliente: [''],
      instagramNovoCliente: [''],
      
      // Data e Observações
      dataPrevisaoSaida: [''],
      observacoes: [''],
      exibirAvisoTrintaDias: [true],
      
      // NOVO: Seção de Bicicletas
      bicicletaExistente: [''],
      
      // NOVO: Campos para nova bicicleta
      novaBicicletaMarca: [''],
      novaBicicletaModelo: [''],
      novaBicicletaCor: [''],
      novaBicicletaTamanhoAro: [''],
      
      // Serviços e Peças (agora associados a uma bicicleta)
      servicosSelecionados: this.fb.array([]),
      pecasSelecionadas: this.fb.array([])
    }, { validators: clienteOuNovoClienteValidator });
  }

  ngOnInit(): void {
    this.carregarServicosEPecas();
    this.loadClientes();
    this.loadBicicletas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== GETTERS ====================
  get servicos() { return this.ordemForm.get('servicosSelecionados') as FormArray; }
  get pecas() { return this.ordemForm.get('pecasSelecionadas') as FormArray; }

  // ==================== CARREGAMENTO DE DADOS ====================
  private carregarServicosEPecas(): void {
    this.servicoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.listaServicosDisponiveis = data;
          console.log('✅ Serviços carregados:', data);
        },
        error: (error) => {
          console.error('❌ Erro ao carregar serviços:', error);
        }
      });

    this.pecaService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.listaPecasDisponiveis = data;
          console.log('✅ Peças carregadas:', data);
        },
        error: (error) => {
          console.error('❌ Erro ao carregar peças:', error);
        }
      });
  }

  private loadClientes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clienteService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.clientes = data;
          console.log('✅ Clientes carregados:', data);
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Erro ao carregar clientes:', err);
          this.errorMessage = 'Erro ao carregar clientes. Tente novamente.';
          this.loading = false;
        }
      });
  }

  private loadBicicletas(): void {
    this.bicicletaService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.todasBicicletas = data;
          console.log('✅ Bicicletas carregadas:', data);
        },
        error: (err) => {
          console.error('❌ Erro ao carregar bicicletas:', err);
        }
      });
  }

  // ==================== GESTÃO DE BICICLETAS ====================

  /**
   * Adiciona uma bicicleta ao carrinho
   * Pode ser uma existente ou uma nova
   */
  adicionarBicicletaAoCarrinho(): void {
    const bicicletaExistenteId = this.ordemForm.get('bicicletaExistente')?.value;
    const marca = this.ordemForm.get('novaBicicletaMarca')?.value;
    const modelo = this.ordemForm.get('novaBicicletaModelo')?.value;
    const cor = this.ordemForm.get('novaBicicletaCor')?.value;
    const tamanhoAro = this.ordemForm.get('novaBicicletaTamanhoAro')?.value;

    let bicicletaSelecionada: BicicletaComItens | null = null;

    if (bicicletaExistenteId) {
      // Bicicleta existente
      const bicicleta = this.todasBicicletas.find(b => b.id === parseInt(bicicletaExistenteId));
      if (bicicleta) {
        bicicletaSelecionada = {
          id: bicicleta.id,
          marca: bicicleta.marca,
          modelo: bicicleta.modelo,
          cor: bicicleta.cor,
          tamanhoAro: bicicleta.tamanhoAro,
          servicos: [],
          pecas: []
        };
      }
    } else if (marca && modelo && cor && tamanhoAro) {
      // Nova bicicleta
      bicicletaSelecionada = {
        marca,
        modelo,
        cor,
        tamanhoAro: parseInt(tamanhoAro),
        servicos: [],
        pecas: []
      };
    } else {
      this.errorMessage = 'Selecione uma bicicleta existente ou preencha os dados de uma nova.';
      return;
    }

    // Verificar duplicatas
    if (this.bicicletasAdicionadas.some(b => 
      b.marca === bicicletaSelecionada!.marca && 
      b.modelo === bicicletaSelecionada!.modelo)) {
      this.errorMessage = 'Esta bicicleta já foi adicionada à ordem.';
      return;
    }

    this.bicicletasAdicionadas.push(bicicletaSelecionada);
    
    // Limpar campos
    this.ordemForm.patchValue({
      bicicletaExistente: '',
      novaBicicletaMarca: '',
      novaBicicletaModelo: '',
      novaBicicletaCor: '',
      novaBicicletaTamanhoAro: ''
    });

    this.errorMessage = '';
    console.log(`✅ Bicicleta ${bicicletaSelecionada.marca} ${bicicletaSelecionada.modelo} adicionada`);
  }

  /**
   * Remove uma bicicleta do carrinho
   */
  removerBicicletaDoCarrinho(index: number): void {
    const removida = this.bicicletasAdicionadas.splice(index, 1)[0];
    console.log(`🗑️ Bicicleta removida: ${removida.marca} ${removida.modelo}`);
  }

  // ==================== GESTÃO DE ITENS (Serviços e Peças) ====================

  /**
   * Adiciona um serviço a uma bicicleta específica
   */
  adicionarServicoParaBicicleta(bicicletaIndex: number): void {
    if (bicicletaIndex < 0 || bicicletaIndex >= this.bicicletasAdicionadas.length) {
      this.errorMessage = 'Bicicleta inválida.';
      return;
    }

    this.bicicletasAdicionadas[bicicletaIndex].servicos.push({
      id: undefined,
      servico: { id: undefined, descricao: '', valor: 0 },
      quantidade: 1,
      valor: 0,
      bicicletaId: this.bicicletasAdicionadas[bicicletaIndex].id
    });
  }

  /**
   * Remove um serviço de uma bicicleta
   */
  removerServicoDeaBicicleta(bicicletaIndex: number, servicoIndex: number): void {
    if (bicicletaIndex < 0 || bicicletaIndex >= this.bicicletasAdicionadas.length) {
      return;
    }
    this.bicicletasAdicionadas[bicicletaIndex].servicos.splice(servicoIndex, 1);
  }

  /**
   * Adiciona uma peça a uma bicicleta específica
   */
  adicionarPecaParaBicicleta(bicicletaIndex: number): void {
    if (bicicletaIndex < 0 || bicicletaIndex >= this.bicicletasAdicionadas.length) {
      this.errorMessage = 'Bicicleta inválida.';
      return;
    }

    this.bicicletasAdicionadas[bicicletaIndex].pecas.push({
      id: undefined,
      peca: { id: undefined, descricao: '', valor: 0, quantidade: 1 },
      quantidade: 1,
      valor: 0,
      bicicletaId: this.bicicletasAdicionadas[bicicletaIndex].id
    });
  }

  /**
   * Remove uma peça de uma bicicleta
   */
  removerPecaDeBicicleta(bicicletaIndex: number, pecaIndex: number): void {
    if (bicicletaIndex < 0 || bicicletaIndex >= this.bicicletasAdicionadas.length) {
      return;
    }
    this.bicicletasAdicionadas[bicicletaIndex].pecas.splice(pecaIndex, 1);
  }

  /**
   * Atualiza o serviço selecionado e seu valor
   */
  onServicoChange(bicicletaIndex: number, servicoIndex: number, servicoId: number): void {
    const servico = this.listaServicosDisponiveis.find(s => s.id === servicoId);
    if (servico) {
      this.bicicletasAdicionadas[bicicletaIndex].servicos[servicoIndex].servico = servico;
      this.bicicletasAdicionadas[bicicletaIndex].servicos[servicoIndex].valor = servico.valor;
    }
  }

  /**
   * Atualiza a peça selecionada e seu valor
   */
  onPecaChange(bicicletaIndex: number, pecaIndex: number, pecaId: number): void {
    const peca = this.listaPecasDisponiveis.find(p => p.id === pecaId);
    if (peca) {
      this.bicicletasAdicionadas[bicicletaIndex].pecas[pecaIndex].peca = peca;
      this.bicicletasAdicionadas[bicicletaIndex].pecas[pecaIndex].valor = peca.valor;
    }
  }

  // ==================== FORMATAÇÃO ====================

  /**
   * Formata telefone para o padrão (XX) XXXXX-XXXX
   */
  formatarTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    event.target.value = value;
    this.ordemForm.get('telefoneNovoCliente')?.setValue(value);
  }

  // ==================== SUBMISSÃO ====================

  onSubmit(): void {
    if (this.ordemForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    if (this.bicicletasAdicionadas.length === 0) {
      this.errorMessage = 'Adicione pelo menos uma bicicleta à ordem.';
      return;
    }

    this.loadingOperation = true;
    this.errorMessage = '';

    const formValue = this.ordemForm.value;
    const clienteSelecionado = parseInt(formValue.cliente);
    const temNovoCliente = this.temDadosNovoCliente();

    if (!clienteSelecionado && !temNovoCliente) {
      this.errorMessage = 'Selecione um cliente ou preencha os dados de um novo cliente.';
      this.loadingOperation = false;
      return;
    }

    this.criarOrdemServico(formValue);
  }

  private criarOrdemServico(formValue: any): void {
    const clienteId = parseInt(formValue.cliente) || null;
    const novoCliente = this.temDadosNovoCliente()
      ? {
          nome: formValue.nomeNovoCliente,
          telefone: formValue.telefoneNovoCliente,
          endereco: formValue.enderecoNovoCliente,
          instagram: formValue.instagramNovoCliente
        }
      : null;

    const payload = {
      cliente: clienteId
        ? this.clientes.find(c => c.id === clienteId)
        : novoCliente,
      bicicletas: this.bicicletasAdicionadas,
      dataPrevisaoSaida: formValue.dataPrevisaoSaida || null,
      observacoes: formValue.observacoes || '',
      exibirAviso30Dias: formValue.exibirAvisoTrintaDias,
      status: 'ABERTA'
    };

    console.log('📤 Enviando payload:', payload);

    this.ordemService.create(payload).subscribe({
      next: (response) => {
        console.log('✅ Ordem de serviço criada com sucesso!', response);
        this.successMessage = 'Ordem de serviço criada com sucesso!';
        this.loadingOperation = false;
        
        setTimeout(() => {
          this.router.navigate(['/ordens-servico']);
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Erro ao criar ordem:', error);
        this.errorMessage = 'Erro ao criar ordem de serviço: ' + error.message;
        this.loadingOperation = false;
      }
    });
  }

  private temDadosNovoCliente(): boolean {
    const form = this.ordemForm.value;
    return !!(form.nomeNovoCliente || form.telefoneNovoCliente);
  }

  cancel(): void {
    this.router.navigate(['/ordens-servico']);
  }
}
