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

  onClienteChange(clienteId: number): void {
    if (clienteId) {
      this.loading = true;
      this.bicicletaService.getByCliente(clienteId).subscribe({
        next: (data) => {
          this.bicicletas = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao carregar bicicletas: ' + error.message;
          this.loading = false;
        }
      });
    } else {
      this.bicicletas = [];
      this.ordemForm.patchValue({ bicicleta: '' });
    }
  }

  onSubmit(): void {
    if (this.ordemForm.valid) {
      this.loading = true;
      const formValue = this.ordemForm.value;

      const ordemServico = {
        dataEntrada: new Date().toISOString(),
        problemaRelatado: formValue.problemaRelatado,
        observacoes: formValue.observacoes,
        status: 'ABERTA' as const,
        bicicleta: { id: formValue.bicicleta } as unknown as Bicicleta,
        servicos: [],
        pecas: []
      };

      this.ordemService.create(ordemServico).subscribe({
        next: (ordem) => {
          this.router.navigate(['/ordens-servico', ordem.id]);
        },
        error: (error) => {
          this.error = 'Erro ao criar ordem de serviço: ' + error.message;
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/ordens-servico']);
  }
}