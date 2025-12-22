import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
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
      cliente: ['', Validators.required],
      bicicleta: ['', Validators.required],
      observacoes: [''], 
      exibirAvisoTrintaDias: [true], // Conforme requisito [cite: 1, 19]
      servicosSelecionados: this.fb.array([]), 
      pecasSelecionadas: this.fb.array([])      
    });
  }

  ngOnInit(): void {
    this.loadClientes();
    this.carregarServicosEPecas();

    // ✅ Debug: Observa mudanças no formulário (Restaurado do original) 
    this.ordemForm.valueChanges.subscribe(values => {
      console.log('📝 Mudança no formulário:', values);
    });
  }

  // Getters ajustados para o seu HTML [cite: 4]
  get servicos() { return this.ordemForm.get('servicosSelecionados') as FormArray; }
  get pecas() { return this.ordemForm.get('pecasSelecionadas') as FormArray; }

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
    if (this.ordemForm.valid && this.clienteSelecionado && this.bicicletaSelecionada) {
      this.loading = true;
      const formValue = this.ordemForm.value;

      const novaOS = {
        dataEntrada: new Date().toISOString(),
        observacoes: formValue.observacoes,
        exibirAviso30Dias: formValue.exibirAvisoTrintaDias,
        status: 'ABERTA' as const,
        cliente: this.clienteSelecionado,
        bicicleta: this.bicicletaSelecionada,
        servicos: formValue.servicosSelecionados,
        pecas: formValue.pecasSelecionadas,
        valorTotal: 0
      };

      console.log('🎯 Enviando nova OS:', novaOS);

      this.ordemService.create(novaOS).subscribe({
        next: (os) => this.router.navigate(['/ordens-servico', os.id]),
        error: (err) => {
          this.error = 'Erro ao criar OS: ' + err.message;
          this.loading = false;
        }
      });
    }
  }

  cancel(): void { this.router.navigate(['/ordens-servico']); }
}