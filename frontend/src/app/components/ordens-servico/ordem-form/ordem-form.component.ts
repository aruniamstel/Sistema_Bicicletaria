import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
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
export class OrdemFormComponent implements OnInit {
  ordemForm: FormGroup;
  clientes: Cliente[] = [];
  bicicletas: Bicicleta[] = [];
  
  // Nomes ajustados para bater com o HTML fornecido
  listaServicosDisponiveis: Servico[] = [];
  listaPecasDisponiveis: Peca[] = [];
  
  loading: boolean = false;
  error: string = '';

  clienteSelecionado?: Cliente;
  bicicletaSelecionada?: Bicicleta;

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
    this.loadClientes();
    this.carregarServicosEPecas();

    // ✅ Debug: Observa mudanças no formulário
    this.ordemForm.valueChanges.subscribe(values => {
      console.log('📝 Mudança no formulário:', values);
      console.log('✅ Formulário válido:', this.ordemForm.valid);
    });
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

    // Atualiza o valor no controle do formulário para o Angular reconhecer
    this.ordemForm.get('telefoneNovoCliente')?.setValue(value, { emitEvent: false });
  }

  // Novo método baseado no OrdemDetailsComponent 
  private carregarServicosEPecas(): void {
    try {
      // Carrega serviços conforme padrão do ordem-details
      const servicosData = localStorage.getItem('servicos');
      this.listaServicosDisponiveis = servicosData ? JSON.parse(servicosData) : [];
      console.log('🛠️ Serviços carregados no Form:', this.listaServicosDisponiveis);

      // Carrega peças conforme padrão do ordem-details
      const pecasData = localStorage.getItem('pecas');
      this.listaPecasDisponiveis = pecasData ? JSON.parse(pecasData) : [];
      console.log('⚙️ Peças carregadas no Form:', this.listaPecasDisponiveis);
    } catch (error) {
      console.error('❌ Erro ao carregar serviços/peças do LocalStorage:', error);
      this.listaServicosDisponiveis = [];
      this.listaPecasDisponiveis = [];
    }
  }

  loadClientes(): void {
    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar clientes: ' + err.message;
        this.loading = false;
      }
    });
  }

  // Função para carregar as listas dos dropdowns [cite: 4]
  loadServicosEPecas(): void {
    this.servicoService.getAll().subscribe(data => this.listaServicosDisponiveis = data);
    this.pecaService.getAll().subscribe(data => this.listaPecasDisponiveis = data);
  }

  onClienteChange(clienteId: string): void {
    const id = Number(clienteId);
    console.log('👤 ID Cliente:', id);
    
    if (id) {
      this.loading = true;
      this.clienteSelecionado = this.clientes.find(c => c.id === id);
      
      this.bicicletaService.getByCliente(id).subscribe({
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
          this.error = 'Erro ao carregar bicicletas: ' + err.message;
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
      this.updateDebugInfo(); // Chamada de debug restaurada 
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
    if (this.ordemForm.valid) {
      this.loading = true;
      const formValue = this.ordemForm.value;

      // Validação: deve ter pelo menos um serviço ou peça
      if (formValue.servicosSelecionados.length === 0 && formValue.pecasSelecionadas.length === 0) {
        this.error = 'Adicione pelo menos um serviço ou uma peça';
        this.loading = false;
        return;
      }

      // Se há dados de novo cliente, criar cliente primeiro usando o serviço
      if (!this.clienteSelecionado && this.temDadosNovoCliente()) {
        const novoCliente: Cliente = {
          nome: formValue.nomeNovoCliente || 'Cliente s/nome',
          telefone: formValue.telefoneNovoCliente || '',
          endereco: formValue.enderecoNovoCliente || 'Endereço não informado',
          instagram: formValue.instagramNovoCliente || ''
        };

        // Usar ClienteService para criar o cliente (salva no localStorage via serviço)
        this.clienteService.create(novoCliente).subscribe({
          next: (clienteCriado) => {
            console.log('✅ Cliente criado:', clienteCriado);
            this.clienteSelecionado = clienteCriado;
            // Agora criar a ordem de serviço
            this.criarOrdemServico(formValue);
          },
          error: (err) => {
            this.error = 'Erro ao criar novo cliente: ' + err.message;
            this.loading = false;
          }
        });
      } else {
        // Cliente já selecionado, criar ordem diretamente
        this.criarOrdemServico(formValue);
      }
    } else {
      this.error = 'Por favor, selecione um cliente ou preencha nome e telefone do novo cliente';
    }
  }

  private criarOrdemServico(formValue: any): void {
    // ✅ REPLICAÇÃO DA LÓGICA DO DETAILS: 
    // Mapeia os IDs selecionados para os objetos completos com preço
    const servicosFormatados = formValue.servicosSelecionados.map((s: any) => {
      const servicoInfo = this.listaServicosDisponiveis.find(item => item.id == s.id);
      return {
        servico: servicoInfo,
        quantidade: 1 // No form de criação, geralmente é 1 por padrão
      };
    }).filter((s: any) => s.servico); // Remove se o find falhar

    const pecasFormatadas = formValue.pecasSelecionadas.map((p: any) => {
      const pecaInfo = this.listaPecasDisponiveis.find(item => item.id == p.id);
      return {
        peca: pecaInfo,
        quantidade: p.quantidade || 1
      };
    }).filter((p: any) => p.peca);

    const dataEntrada = new Date().toISOString();
    const dataPrevisao = formValue.dataPrevisaoSaida && formValue.dataPrevisaoSaida.trim() 
      ? formValue.dataPrevisaoSaida 
      : undefined;

    const novaOS = {
      ...formValue,
      dataEntrada: dataEntrada,
      dataPrevisaoSaida: dataPrevisao, // Garante que é string válida ou undefined
      status: 'ABERTA' as const,
      cliente: this.clienteSelecionado,
      bicicleta: this.bicicletaSelecionada || null, // Bicicleta pode ser null
      servicos: servicosFormatados, // Agora com objetos completos
      pecas: pecasFormatadas,       // Agora com objetos completos
      exibirAviso30Dias: formValue.exibirAvisoTrintaDias
    };

    this.ordemService.create(novaOS).subscribe({
      next: (ordem) => {
        console.log('✅ OS Criada com valor:', ordem.valorTotal);
        this.router.navigate(['/ordens-servico']);
      },
      error: (err) => {
        this.error = 'Erro ao salvar OS';
        this.loading = false;
      }
    });
  }

  private temDadosNovoCliente(): boolean {
    const nomeControl = this.ordemForm.get('nomeNovoCliente');
    const telefoneControl = this.ordemForm.get('telefoneNovoCliente');
    return (nomeControl?.value && nomeControl.value.trim()) || (telefoneControl?.value && telefoneControl.value.trim());
  }

  cancel(): void { this.router.navigate(['/ordens-servico']); }
}