import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { Cliente } from '../../../shared/models/cliente.model';
import { Bicicleta } from '../../../shared/models/bicicleta.model';
import { Servico } from '../../../shared/models/servico.model';
import { Peca } from '../../../shared/models/peca.model';
import { ClienteService } from '../../../services/cliente.service';
import { BicicletaService } from '../../../services/bicicleta.service';
import { OrdemServicoService } from '../../../services/ordem-servico.service';
import { ServicoService } from '../../../services/servico.service';
import { PecaService } from '../../../services/peca.service';
import { HeaderComponent } from "../../header/header.component";

// Validador customizado: exige cliente OU (nome + telefone de novo cliente)
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
  bicicletas: Bicicleta[] = [];
  
  listaServicosDisponiveis: Servico[] = [];
  listaPecasDisponiveis: Peca[] = [];
  
  loading: boolean = false;
  loadingOperation: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  clienteSelecionado?: Cliente;
  bicicletaSelecionada?: Bicicleta;

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
      cliente: [''],
      bicicleta: [''], // Bicicleta opcional - permite peças avulsas
      // Campos para novo cliente (opcionais)
      clienteExistente: [''],
      nomeNovoCliente: [''],
      telefoneNovoCliente: [''],
      enderecoNovoCliente: [''],
      instagramNovoCliente: [''],
      dataPrevisaoSaida: [''], // Novo campo opcional
      observacoes: [''], 
      exibirAvisoTrintaDias: [true], // Conforme requisito [cite: 1, 19]
      servicosSelecionados: this.fb.array([]), 
      pecasSelecionadas: this.fb.array([])      
    }, { validators: clienteOuNovoClienteValidator }); // ✅ Aplicar validador customizado
  }

  ngOnInit(): void {
    this.carregarServicosEPecas();
    this.loadClientes();
    this.ordemForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        console.log('📝 Mudança no formulário:', values);
        console.log('✅ Formulário válido:', this.ordemForm.valid);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateClienteValidation(): void {
    // Este método agora não é mais necessário - o validador customizado cuida disso
  }

  // Getters ajustados para o seu HTML [cite: 4]
  get servicos() { return this.ordemForm.get('servicosSelecionados') as FormArray; }
  get pecas() { return this.ordemForm.get('pecasSelecionadas') as FormArray; }

  // Formatação de telefone - mesmo padrão do ClienteFormComponent
  formatarTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (value.length > 11) value = value.substring(0, 11); // Limita a 11 dígitos

    if (value.length > 2) {
      // Formata conforme a quantidade de dígitos (celular vs fixo)
      if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2})/, '($1');
    }
    event.target.value = value;
  }

  private carregarServicosEPecas(): void {
    // Carregar serviços via HTTP
    this.servicoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.listaServicosDisponiveis = data || [];
          console.log('🛠️ Serviços carregados no Form:', this.listaServicosDisponiveis);
        },
        error: (error) => {
          console.error('❌ Erro ao carregar serviços:', error);
          this.listaServicosDisponiveis = [];
        }
      });

    // Carregar peças via HTTP
    this.pecaService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.listaPecasDisponiveis = data || [];
          console.log('📦 Peças carregadas no Form:', this.listaPecasDisponiveis);
        },
        error: (error) => {
          console.error('❌ Erro ao carregar peças:', error);
          this.listaPecasDisponiveis = [];
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
          this.clientes = data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Erro ao carregar clientes:', err);
          this.errorMessage = 'Erro ao carregar clientes: ' + err.message;
          this.loading = false;
        }
      });
  }

  onClienteChange(clienteId: string): void {
    const id = Number(clienteId);
    console.log('👤 ID Cliente:', id);
    
    if (id) {
      this.loading = true;
      this.clienteSelecionado = this.clientes.find(c => c.id === id);
      
      this.bicicletaService.getByCliente(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.bicicletas = data;
            this.loading = false;
            // Limpa bicicleta selecionada ao mudar cliente
            this.ordemForm.patchValue({ bicicleta: '' });
            this.bicicletaSelecionada = undefined;
            // Seleção automática se houver apenas uma 
            if (this.bicicletas.length === 1) {
              this.ordemForm.patchValue({ bicicleta: this.bicicletas[0].id });
              this.onBicicletaChange(this.bicicletas[0].id.toString());
            }
          },
          error: (err) => {
            console.error('❌ Erro ao carregar bicicletas:', err);
            this.errorMessage = 'Erro ao carregar bicicletas: ' + err.message;
            this.loading = false;
          }
        });
    } else {
      // Limpa bicicletas quando cliente não selecionado
      this.bicicletas = [];
      this.bicicletaSelecionada = undefined;
      this.clienteSelecionado = undefined;
    }
  }

  onBicicletaChange(bicicletaId: string): void {
    const id = Number(bicicletaId);
    if (id) {
      this.bicicletaSelecionada = this.bicicletas.find(b => b.id === id);
      this.updateDebugInfo();
    }
  }

  // Métodos de manipulação de itens
  adicionarServico(): void {
    this.servicos.push(this.fb.group({
      id: ['', Validators.required],
      valor: [0]
    }));
  }

  adicionarPeca(): void {
    this.pecas.push(this.fb.group({
      id: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      valor: [0]
    }));
  }

  removerItem(array: FormArray, index: number): void {
    array.removeAt(index);
  }

  // ✅ Método de Debug Restaurado 
  private updateDebugInfo(): void {
    console.log('🔍 ESTADO ATUAL:');
    console.log('  Cliente:', this.clienteSelecionado?.nome);
    console.log('  Bicicleta:', this.bicicletaSelecionada?.marca);
    console.log('  Válido:', this.ordemForm.valid);
  }

  onSubmit(): void {
    if (this.ordemForm.invalid) {
      this.errorMessage = 'Por favor, selecione um cliente ou preencha nome e telefone do novo cliente';
      return;
    }

    const formValue = this.ordemForm.value;

    // Validação: deve ter pelo menos um serviço ou peça
    if (formValue.servicosSelecionados.length === 0 && formValue.pecasSelecionadas.length === 0) {
      this.errorMessage = 'Adicione pelo menos um serviço ou uma peça';
      return;
    }

    this.loadingOperation = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Se há dados de novo cliente, criar cliente primeiro
    if (!this.clienteSelecionado && this.temDadosNovoCliente()) {
      const novoCliente: Cliente = {
        nome: formValue.nomeNovoCliente || 'Cliente s/nome',
        telefone: formValue.telefoneNovoCliente || '',
        endereco: formValue.enderecoNovoCliente || 'Endereço não informado',
        instagram: formValue.instagramNovoCliente || ''
      };

      this.clienteService.create(novoCliente)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (clienteCriado) => {
            console.log('✅ Cliente criado:', clienteCriado);
            this.clienteSelecionado = clienteCriado;
            this.criarOrdemServico(formValue);
          },
          error: (err) => {
            console.error('❌ Erro ao criar cliente:', err);
            this.errorMessage = 'Erro ao criar novo cliente: ' + err.message;
            this.loadingOperation = false;
          }
        });
    } else {
      // Cliente já selecionado, criar ordem diretamente
      this.criarOrdemServico(formValue);
    }
  }

  private criarOrdemServico(formValue: any): void {
    const servicosFormatados = formValue.servicosSelecionados.map((s: any) => {
      const servicoInfo = this.listaServicosDisponiveis.find(item => item.id == s.id);
      return {
        servico: servicoInfo,
        quantidade: 1
      };
    }).filter((s: any) => s.servico);

    const pecasFormatadas = formValue.pecasSelecionadas.map((p: any) => {
      const pecaInfo = this.listaPecasDisponiveis.find(item => item.id == p.id);
      return {
        peca: pecaInfo,
        quantidade: p.quantidade || 1
      };
    }).filter((p: any) => p.peca);

    // Converter dataEntrada para ISO 8601: yyyy-MM-dd'T'HH:mm:ss (sem Z e milissegundos)
    const dataEntrada = new Date().toISOString().split('.')[0]; // Remove milissegundos
    
    // Converter dataPrevisaoSaida: input date vem como YYYY-MM-DD, converter para YYYY-MM-DDTHH:mm:ss
    let dataPrevisao: string | undefined = undefined;
    if (formValue.dataPrevisaoSaida && formValue.dataPrevisaoSaida.trim()) {
      // Input date retorna YYYY-MM-DD, precisamos converter para ISO datetime
      const dateObj = new Date(formValue.dataPrevisaoSaida + 'T00:00:00');
      dataPrevisao = dateObj.toISOString().split('.')[0]; // Converte e remove milissegundos
    }

    const novaOS = {
      dataEntrada: dataEntrada,
      dataPrevisaoSaida: dataPrevisao,
      status: 'ABERTA' as const,
      observacoes: formValue.observacoes || '',
      exibirAviso30Dias: formValue.exibirAvisoTrintaDias || false,
      cliente: this.clienteSelecionado,
      bicicleta: this.bicicletaSelecionada || null,
      servicos: servicosFormatados,
      pecas: pecasFormatadas
    };

    this.ordemService.create(novaOS)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ordem) => {
          console.log('✅ OS Criada:', ordem);
          this.successMessage = '✅ Ordem de Serviço criada com sucesso!';
          this.loadingOperation = false;
          
          // Oferecer download do PDF
          if (confirm('Ordem de Serviço criada com sucesso! Deseja baixar o PDF?')) {
            this.ordemService.downloadPdf(ordem.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (blob: Blob) => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Ordem_Servico_${ordem.id}.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  console.log('✅ PDF baixado com sucesso');
                  
                  setTimeout(() => {
                    this.router.navigate(['/ordens-servico']);
                  }, 500);
                },
                error: (err) => {
                  console.error('❌ Erro ao baixar PDF:', err);
                  setTimeout(() => {
                    this.router.navigate(['/ordens-servico']);
                  }, 500);
                }
              });
          } else {
            // Apenas redireciona sem download
            setTimeout(() => {
              this.router.navigate(['/ordens-servico']);
            }, 500);
          }
        },
        error: (err) => {
          console.error('❌ Erro ao criar OS:', err);
          this.errorMessage = 'Erro ao salvar Ordem de Serviço: ' + (err.message || 'Tente novamente');
          this.loadingOperation = false;
        }
      });
  }

  private temDadosNovoCliente(): boolean {
    const nomeControl = this.ordemForm.get('nomeNovoCliente');
    const telefoneControl = this.ordemForm.get('telefoneNovoCliente');
    return (nomeControl?.value && nomeControl.value.trim()) || (telefoneControl?.value && telefoneControl.value.trim());
  }

  cancel(): void {
    this.router.navigate(['/ordens-servico']);
  }
}