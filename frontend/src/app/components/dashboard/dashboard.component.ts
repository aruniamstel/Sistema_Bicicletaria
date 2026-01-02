import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../header/header.component";

// Interfaces
export interface Servico {
  id?: number;
  descricao: string;
  valor: number;
}

export interface Peca {
  id?: number;
  descricao: string;
  valor: number;
  quantidade: number;
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

export interface Cliente {
  id?: number;
  nome: string;
  telefone: string;
  endereco: string;
  instagram?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Dados
  bicicletas: Bicicleta[] = [];
  servicos: Servico[] = [];
  pecas: Peca[] = [];
  clientes: Cliente[] = [];
  
  // Forms
  bicicletaForm: FormGroup;
  servicoForm: FormGroup;
  pecaForm: FormGroup;
  
  // Estados
  activeTab: 'bicicletas' | 'servicos' | 'pecas' = 'bicicletas';
  loading = false;
  error = '';
  editingBicicleta: Bicicleta | null = null;
  editingServico: Servico | null = null;
  editingPeca: Peca | null = null;

  constructor(private fb: FormBuilder) {
    // Formulário de Bicicleta
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

    // Formulário de Serviço
    this.servicoForm = this.fb.group({
      descricao: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0)]]
    });

    // Formulário de Peça
    this.pecaForm = this.fb.group({
      descricao: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0)]],
      quantidade: ['', [Validators.required, Validators.min(0)]]
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
    
    // Carrega serviços
    const servicosData = localStorage.getItem('servicos');
    this.servicos = servicosData ? JSON.parse(servicosData) : this.criarServicosPadrao();
    
    // Carrega peças
    const pecasData = localStorage.getItem('pecas');
    this.pecas = pecasData ? JSON.parse(pecasData) : this.criarPecasPadrao();

    // Carrega clientes
    const clientesData = localStorage.getItem('clientes');
    this.clientes = clientesData ? JSON.parse(clientesData) : [];
    
    this.loading = false;
  }

  // === BICICLETAS ===
  salvarBicicleta(): void {
    if (this.bicicletaForm.valid) {
      const formValue = this.bicicletaForm.value;
      const novaBicicleta: Bicicleta = {
        marca: formValue.marca,
        modelo: formValue.modelo,
        tamanhoAro: formValue.tamanhoAro,
        cor: formValue.cor,
        cliente: {} as any // será preenchido abaixo
      };

      let clienteSelecionado: Cliente | null = null;

      if (formValue.selectedClienteId) {
        // Cliente existente selecionado
        clienteSelecionado = this.clientes.find(c => c.id === formValue.selectedClienteId) || null;
        if (!clienteSelecionado) {
          this.error = 'Cliente selecionado não encontrado.';
          return;
        }
      } else if (formValue.clienteNome || formValue.clienteTelefone) {
        // Criar novo cliente
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
        // Edição
        const index = this.bicicletas.findIndex(b => b.id === this.editingBicicleta!.id);
        if (index !== -1) {
          this.bicicletas[index] = { ...novaBicicleta, id: this.editingBicicleta.id };
        }
      } else {
        // Nova bicicleta
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
    this.bicicletaForm.get('clienteTelefone')?.setValue(value, { emitEvent: false });
  }

  // === SERVIÇOS ===
  salvarServico(): void {
    if (this.servicoForm.valid) {
      const formValue = this.servicoForm.value;
      const novoServico: Servico = {
        descricao: formValue.descricao,
        valor: formValue.valor
      };

      if (this.editingServico) {
        // Edição
        const index = this.servicos.findIndex(s => s.id === this.editingServico!.id);
        if (index !== -1) {
          this.servicos[index] = { ...novoServico, id: this.editingServico.id };
        }
      } else {
        // Novo serviço
        const newId = this.servicos.length > 0 ? Math.max(...this.servicos.map(s => s.id || 0)) + 1 : 1;
        novoServico.id = newId;
        this.servicos.push(novoServico);
      }

      this.salvarNoLocalStorage('servicos', this.servicos);
      this.servicoForm.reset();
      this.editingServico = null;
    }
  }

  editarServico(servico: Servico): void {
    this.editingServico = servico;
    this.servicoForm.patchValue({
      descricao: servico.descricao,
      valor: servico.valor
    });
  }

  excluirServico(id: number): void {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      this.servicos = this.servicos.filter(s => s.id !== id);
      this.salvarNoLocalStorage('servicos', this.servicos);
    }
  }

  cancelarEdicaoServico(): void {
    this.servicoForm.reset();
    this.editingServico = null;
  }

  // === PEÇAS ===
  salvarPeca(): void {
    if (this.pecaForm.valid) {
      const formValue = this.pecaForm.value;
      const novaPeca: Peca = {
        descricao: formValue.descricao,
        valor: formValue.valor,
        quantidade: formValue.quantidade
      };

      if (this.editingPeca) {
        // Edição
        const index = this.pecas.findIndex(p => p.id === this.editingPeca!.id);
        if (index !== -1) {
          this.pecas[index] = { ...novaPeca, id: this.editingPeca.id };
        }
      } else {
        // Nova peça
        const newId = this.pecas.length > 0 ? Math.max(...this.pecas.map(p => p.id || 0)) + 1 : 1;
        novaPeca.id = newId;
        this.pecas.push(novaPeca);
      }

      this.salvarNoLocalStorage('pecas', this.pecas);
      this.pecaForm.reset();
      this.editingPeca = null;
    }
  }

  editarPeca(peca: Peca): void {
    this.editingPeca = peca;
    this.pecaForm.patchValue({
      descricao: peca.descricao,
      valor: peca.valor,
      quantidade: peca.quantidade
    });
  }

  excluirPeca(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta peça?')) {
      this.pecas = this.pecas.filter(p => p.id !== id);
      this.salvarNoLocalStorage('pecas', this.pecas);
    }
  }

  cancelarEdicaoPeca(): void {
    this.pecaForm.reset();
    this.editingPeca = null;
  }

  // === UTILITÁRIOS ===
  private salvarNoLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private criarServicosPadrao(): Servico[] {
    const servicosPadrao = [
      { id: 1, descricao: 'Troca de pneu', valor: 50 },
      { id: 2, descricao: 'Ajuste de freios', valor: 35 },
      { id: 3, descricao: 'Troca de câmbio', valor: 80 },
      { id: 4, descricao: 'Ajuste de marchas', valor: 40 },
      { id: 5, descricao: 'Troca de corrente', valor: 45 },
      { id: 6, descricao: 'Troca de pedais', valor: 50.50 }
    ];
    this.salvarNoLocalStorage('servicos', servicosPadrao);
    return servicosPadrao;
  }

  private criarPecasPadrao(): Peca[] {
    const pecasPadrao = [
      { id: 1, descricao: 'Pneu 26"', valor: 45, quantidade: 10 },
      { id: 2, descricao: 'Câmara de ar 26"', valor: 15, quantidade: 20 },
      { id: 3, descricao: 'Corrente', valor: 25, quantidade: 8 },
      { id: 4, descricao: 'Pedal', valor: 35, quantidade: 6 },
      { id: 5, descricao: 'Freio a disco', valor: 60, quantidade: 4 },
      { id: 6, descricao: 'Manete de freio', valor: 20, quantidade: 12 }
    ];
    this.salvarNoLocalStorage('pecas', pecasPadrao);
    return pecasPadrao;
  }

  // Navegação entre abas
  setActiveTab(tab: 'bicicletas' | 'servicos' | 'pecas'): void {
    this.activeTab = tab;
  }
}