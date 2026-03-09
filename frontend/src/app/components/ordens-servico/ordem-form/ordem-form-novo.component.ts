import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Cliente } from '../../../shared/models/cliente.model';
import { Bicicleta } from '../../../shared/models/bicicleta.model';
import { Servico, Peca, BicicletaComItens, OrdemServicoServico } from '../../../shared/models/ordem-servico.model';
import { ClienteService } from '../../../services/cliente.service';
import { BicicletaService } from '../../../services/bicicleta.service';
import { OrdemServicoService } from '../../../services/ordem-servico.service';
import { ServicoService } from '../../../services/servico.service';
import { PecaService } from '../../../services/peca.service';
import { HeaderComponent } from '../../header/header.component';

import { Peca as PecaEstoque } from '../../../shared/models/peca.model';

/**
 * Validador: Exige cliente OU (descricao + telefone de novo cliente)
 */
function clienteOuNovoClienteValidator(control: AbstractControl): ValidationErrors | null {
  const cliente = control.get('cliente')?.value;
  const descricaoNovoCliente = control.get('descricaoNovoCliente')?.value;
  const telefoneNovoCliente = control.get('telefoneNovoCliente')?.value;

  const temCliente = cliente && cliente.toString().trim();
  const temNovoCliente = (descricaoNovoCliente && descricaoNovoCliente.toString().trim()) || 
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
  templateUrl: './ordem-form-novo.component.html',
  styleUrls: ['./ordem-form.component.css']
})
export class OrdemFormNovoComponent implements OnInit, OnDestroy {
  ordemForm: FormGroup;
  clientes: Cliente[] = [];
  todasBicicletas: Bicicleta[] = [];
  
  listaServicosDisponiveis: Servico[] = [];
  listaPecasDisponiveis: PecaEstoque[] = [];
  
  // NOVO: Carrinho de bicicletas
  bicicletasAdicionadas: BicicletaComItens[] = [];
  
  // NOVO: Flag para modo AVULSA
  isAvulsa: boolean = false;
  
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
      pecasSelecionadas: this.fb.array([]),

      // CAMPOS TEMPORÁRIOS PARA O SELECT
      servicoTemp: [null],
      quantidadeServicoTemp: [1],
      pecaTemp: [null],
      quantidadePecaTemp: [1]
    }, { validators: clienteOuNovoClienteValidator });
  }

  ngOnInit(): void {
    this.carregarServicosEPecas();
    this.loadClientes();
    this.loadBicicletas();

    this.ordemForm.get('cliente')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(clienteId => {
      if (clienteId) {
        this.carregarBicicletasDoCliente(clienteId);
      } else {
        this.todasBicicletas = []; // Limpa se desvincular o cliente
      }
    });

    // NOVO: Monitorar mudanças no select de bicicletas para detectar modo AVULSA
    this.ordemForm.get('bicicletaExistente')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(valor => {
      this.isAvulsa = valor === 'AVULSA';
      if (this.isAvulsa) {
        // Limpar campos de nova bicicleta quando modo avulsa é ativado
        this.ordemForm.patchValue({
          novaBicicletaMarca: '',
          novaBicicletaModelo: '',
          novaBicicletaCor: '',
          novaBicicletaTamanhoAro: ''
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== GETTERS ====================
  get servicos() { return this.ordemForm.get('servicosSelecionados') as FormArray; }
  get pecas() { return this.ordemForm.get('pecasSelecionadas') as FormArray; }

  // ==================== CARREGAMENTO DE DADOS ====================

    // Adicione este método na classe
  private carregarBicicletasDoCliente(clienteId: number): void {
    // Ajuste o nome do método de acordo com seu BicicletaService
    // Geralmente: findByClienteId(id)
    this.bicicletaService.getByCliente(clienteId) 
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bikes) => {
          this.todasBicicletas = bikes;
          console.log('Bicicletas do cliente carregadas:', bikes);
        },
        error: (err) => console.error('Erro ao buscar bicicletas do cliente', err)
      });
  }

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
        next: (data: PecaEstoque[]) => {
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
  const servicoSelecionado = this.ordemForm.get('servicoTemp')?.value;
  const qtd = this.ordemForm.get('quantidadeServicoTemp')?.value;

  if (!servicoSelecionado) {
    this.errorMessage = 'Selecione um serviço primeiro.';
    return;
  }

  // Criamos o item seguindo EXATAMENTE a interface OrdemServicoServico
  const itemServico: OrdemServicoServico = {
    // Aqui espalhamos o objeto servico selecionado (id, descricao, valor)
    // Isso resolve o erro "Property 'valor' is missing in type"
    servico: { ...servicoSelecionado }, 
    
    quantidade: qtd || 1,
    valor: servicoSelecionado.valor, // Valor unitário do item
    bicicletaId: this.bicicletasAdicionadas[bicicletaIndex].id
  };

  this.bicicletasAdicionadas[bicicletaIndex].servicos.push(itemServico);

  // Limpa os campos
  this.ordemForm.get('servicoTemp')?.setValue(null);
  this.ordemForm.get('quantidadeServicoTemp')?.setValue(1);
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
  adicionarPecaParaBicicleta(index: number) {
    const peca = this.ordemForm.get('pecaTemp')?.value;
    const qtd = this.ordemForm.get('quantidadePecaTemp')?.value;

    if (peca) {
      this.bicicletasAdicionadas[index].pecas.push({
        peca: { ...peca }, // Espalha o objeto para evitar erro de tipos
        quantidade: qtd || 1,
        valor: peca.valor,
        bicicletaId: this.bicicletasAdicionadas[index].id
      });
      // Limpa para a próxima
      this.ordemForm.get('pecaTemp')?.setValue(null);
      this.ordemForm.get('quantidadePecaTemp')?.setValue(1);
    } else {
      this.errorMessage = 'Selecione a peça primeiro';
    }
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
 onPecaChange(bicicletaIndex: number, pecaIndex: number): void {
  // 1. Pega o ID da peça que foi selecionado no array de bicicletas adicionadas
  const pecaId = this.bicicletasAdicionadas[bicicletaIndex].pecas[pecaIndex].id;
  
  // 2. Procura a peça no estoque (lista de PecaEstoque)
  const pecaEstoque = this.listaPecasDisponiveis.find(p => p.id === pecaId);

  if (pecaEstoque) {
    // 3. Monta o objeto EXATAMENTE como a interface ItemPeca exige:
    // Ela precisa de: peca (objeto), quantidade (number) e valor (number)
    this.bicicletasAdicionadas[bicicletaIndex].pecas[pecaIndex] = {
      id: undefined, // O ID do item da OS ainda não existe (será gerado pelo banco)
      quantidade: 1,
      valor: pecaEstoque.valor || 0,
      peca: {
        id: pecaEstoque.id,
        descricao: pecaEstoque.descricao,
        valor: pecaEstoque.valor,
        quantidade: pecaEstoque.quantidade // Esta é a quantidade em estoque do model peca.model
      }
    };

    console.log(`Peça ${pecaEstoque.descricao} vinculada à bicicleta ${bicicletaIndex}`);
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

  onQtdServicoChange(event: any, bIndex: number, sIndex: number): void {
  const qtd = Number(event.target.value);
  this.bicicletasAdicionadas[bIndex].servicos[sIndex].quantidade = qtd > 0 ? qtd : 1;
}

onQtdPecaChange(event: any, bIndex: number, pIndex: number): void {
  const qtd = Number(event.target.value);
  this.bicicletasAdicionadas[bIndex].pecas[pIndex].quantidade = qtd > 0 ? qtd : 1;
}

  // ==================== SUBMISSÃO ====================

  onSubmit(): void {
    if (this.ordemForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    // Validação de bicicletas: requer pelo menos uma, a menos que esteja em modo AVULSA
    if (!this.isAvulsa && this.bicicletasAdicionadas.length === 0) {
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

    if (temNovoCliente) {
      const novoClienteData: Cliente = {
        id: undefined,
        nome: formValue.nomeNovoCliente,
        telefone: formValue.telefoneNovoCliente,
        endereco: formValue.enderecoNovoCliente || '',
        instagram: formValue.instagramNovoCliente || ''
      };

      this.clienteService.create(novoClienteData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (clienteCriado: Cliente) => {
            this.criarOrdemServico(formValue, clienteCriado.id);
          },
          error: (error) => {
            console.error('❌ Erro ao criar cliente:', error);
            this.errorMessage = 'Erro ao criar novo cliente: ' + error.message;
            this.loadingOperation = false;
          }
        });
    } else {
      this.criarOrdemServico(formValue, clienteSelecionado);
    }
  }

  private criarOrdemServico(formValue: any, clienteId: number): void {
    const dataFormatada = formValue.dataPrevisaoSaida ? `${formValue.dataPrevisaoSaida}T18:00:00` : null;

    const payload = {
      cliente: { id: clienteId },
      bicicletas: this.bicicletasAdicionadas,
      dataPrevisaoSaida: dataFormatada || null,
      observacoes: formValue.observacoes || '',
      exibirAviso30Dias: formValue.exibirAvisoTrintaDias,
      status: 'ABERTA'
    };

    console.log('📤 Enviando payload:', payload);

    this.ordemService.create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
