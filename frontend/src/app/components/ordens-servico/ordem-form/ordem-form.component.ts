import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../../shared/models/cliente.model';
import { Bicicleta } from '../../../shared/models/bicicleta.model';
import { ClienteService } from '../../../services/cliente.service';
import { BicicletaService } from '../../../services/bicicleta.service';
import { OrdemServicoService } from '../../../services/ordem-servico.service';
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
  loading: boolean = false;
  error: string = '';

  clienteSelecionado?: Cliente;
  bicicletaSelecionada?: Bicicleta;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private bicicletaService: BicicletaService,
    private ordemService: OrdemServicoService,
    private router: Router
  ) {
    this.ordemForm = this.fb.group({
      cliente: ['', Validators.required],
      bicicleta: ['', Validators.required],
      problemaRelatado: ['', Validators.required],
      observacoes: ['']
    });
  }

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar clientes: ' + error.message;
        this.loading = false;
      }
    });
  }

onClienteChange(clienteId: string): void {
  const id = Number(clienteId); // ✅ Converte para número
  console.log('👤 Cliente selecionado ID:', id);
  
  if (id) {
    this.loading = true;
    
    // ✅ Encontra o cliente selecionado
    this.clienteSelecionado = this.clientes.find(c => c.id === id);
    console.log('🔍 Cliente encontrado:', this.clienteSelecionado);
    
    this.bicicletaService.getByCliente(id).subscribe({
      next: (data) => {
        this.bicicletas = data;
        this.loading = false;
        console.log('🚲 Bicicletas carregadas:', this.bicicletas);
      },
      error: (error) => {
        this.error = 'Erro ao carregar bicicletas: ' + error.message;
        this.loading = false;
        console.error('❌ Erro ao carregar bicicletas:', error);
      }
    });
  } else {
    this.bicicletas = [];
    this.clienteSelecionado = undefined;
    this.bicicletaSelecionada = undefined;
    this.ordemForm.patchValue({ bicicleta: '' });
    console.log('🗑️ Cliente deselecionado');
  }
}

  onBicicletaChange(bicicletaId: number): void {
    if (bicicletaId) {
      this.bicicletaSelecionada = this.bicicletas.find(b => b.id === bicicletaId);
    } else {
      this.bicicletaSelecionada = undefined;
    }
  }

  onSubmit(): void {
    if (this.ordemForm.valid && this.clienteSelecionado && this.bicicletaSelecionada) {
      this.loading = true;
      const formValue = this.ordemForm.value;

      const ordemServico = {
        dataEntrada: new Date().toISOString(),
        problemaRelatado: formValue.problemaRelatado,
        observacoes: formValue.observacoes,
        status: 'ABERTA' as const,
        cliente: this.clienteSelecionado, // ✅ Objeto completo do cliente
        bicicleta: this.bicicletaSelecionada, // ✅ Objeto completo da bicicleta
        servicos: [],
        pecas: [],
        valorTotal: 0
      };

      console.log('📦 Criando ordem com dados:', ordemServico);

      this.ordemService.create(ordemServico).subscribe({
        next: (ordem) => {
          console.log(' Ordem criada com sucesso:', ordem);
          this.router.navigate(['/ordens-servico', ordem.id]);
        },
        error: (error) => {
          console.error(' Erro ao criar ordem:', error);
          this.error = 'Erro ao criar ordem de serviço: ' + error.message;
          this.loading = false;
        }
      });
    } else {
      this.error = 'Por favor, selecione um cliente e uma bicicleta válidos.';
    }

  }

  cancel(): void {
    this.router.navigate(['/ordens-servico']);
  }
}