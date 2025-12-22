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
  servicosDisponiveis: Servico[] = [];
  pecasDisponiveis: Peca[] = [];
  
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
      observacoes: [''], // Não obrigatório 
      exibirAviso30Dias: [true], // Novo requisito [cite: 19]
      servicos: this.fb.array([]), // 
      pecas: this.fb.array([])      // 
    });
  }

  ngOnInit(): void {
    this.loadClientes();
    this.loadServicosEPecas();
  }

  // Getters para os FormArrays
  get servicos() { return this.ordemForm.get('servicos') as FormArray; }
  get pecas() { return this.ordemForm.get('pecas') as FormArray; }

  // Métodos para Manipular Itens Dinâmicos
  adicionarServico(): void {
    const servicoGroup = this.fb.group({
      id: ['', Validators.required],
      valor: [0]
    });
    this.servicos.push(servicoGroup);
  }

  adicionarPeca(): void {
    const pecaGroup = this.fb.group({
      id: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      valor: [0]
    });
    this.pecas.push(pecaGroup);
  }

  removerItem(array: FormArray, index: number): void {
    array.removeAt(index);
  }

  // Carregamento de Dados
  loadClientes(): void {
    this.clienteService.getAll().subscribe(data => this.clientes = data);
  }

  loadServicosEPecas(): void {
    this.servicoService.getAll().subscribe(data => this.servicosDisponiveis = data);
    this.pecaService.getAll().subscribe(data => this.pecasDisponiveis = data);
  }

  onClienteChange(clienteId: string): void {
    const id = Number(clienteId);
    if (id) {
      this.clienteSelecionado = this.clientes.find(c => c.id === id);
      this.bicicletaService.getByCliente(id).subscribe(data => {
        this.bicicletas = data;
        if (this.bicicletas.length === 1) {
          this.ordemForm.patchValue({ bicicleta: this.bicicletas[0].id });
          this.onBicicletaChange(this.bicicletas[0].id.toString());
        }
      });
    }
  }

  onBicicletaChange(bicicletaId: string): void {
    this.bicicletaSelecionada = this.bicicletas.find(b => b.id === Number(bicicletaId));
  }

  onSubmit(): void {
    if (this.ordemForm.valid && this.clienteSelecionado && this.bicicletaSelecionada) {
      this.loading = true;
      const formValue = this.ordemForm.value;

      const novaOS = {
        dataEntrada: new Date().toISOString(),
        observacoes: formValue.observacoes,
        exibirAviso30Dias: formValue.exibirAviso30Dias,
        status: 'ABERTA' as const,
        cliente: this.clienteSelecionado,
        bicicleta: this.bicicletaSelecionada,
        servicos: formValue.servicos,
        pecas: formValue.pecas
      };

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