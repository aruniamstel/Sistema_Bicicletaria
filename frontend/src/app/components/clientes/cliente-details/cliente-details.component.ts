import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Cliente } from '../../../shared/models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';
import { BicicletaService } from '../../../services/bicicleta.service';
import { HeaderComponent } from "../../header/header.component";

@Component({
  selector: 'app-cliente-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './cliente-details.component.html',
  styleUrls: ['./cliente-details.component.css']
})
export class ClienteDetailsComponent implements OnInit {
  clienteForm: FormGroup;
  clienteId: number | null = null;
  cliente?: Cliente;
  loading: boolean = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private bicicletaService: BicicletaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      telefone: ['', [Validators.required, Validators.pattern('^\\d{10,11}$')]],
      endereco: ['', Validators.required],
      instagram: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId = +id;
      this.loadCliente(this.clienteId);
    }
  }

  loadCliente(id: number): void {
    this.loading = true;
    this.clienteService.getById(id).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.clienteForm.patchValue({
          nome: cliente.nome,
          telefone: cliente.telefone,
          endereco: cliente.endereco,
          instagram: cliente.instagram || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar cliente: ' + (err?.message || err);
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.clienteForm.valid) return;
    this.loading = true;
    const payload: Cliente = this.clienteForm.value;

    const op = this.clienteId
      ? this.clienteService.update(this.clienteId, payload)
      : this.clienteService.create(payload);

    op.subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        this.error = 'Erro ao salvar cliente: ' + (err?.message || err);
        this.loading = false;
      }
    });
  }

  delete(): void {
    if (!this.clienteId) return;
    if (!confirm('Deseja realmente excluir este cliente?')) return;
    this.loading = true;
    this.clienteService.delete(this.clienteId).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        this.error = 'Erro ao deletar cliente: ' + (err?.message || err);
        this.loading = false;
      }
    });
  }

  addBicicleta(): void {
    // navigate to bicicleta form with clienteId as query param
    if (this.clienteId) {
      this.router.navigate(['/bicicletas/novo'], { queryParams: { clienteId: this.clienteId } });
    }
  }

  criarOrdemComBicicleta(bicicletaId: number): void {
    // navigate to ordem form preselecting cliente and bicicleta via query params
    this.router.navigate(['/ordens-servico/novo'], { queryParams: { clienteId: this.clienteId, bicicletaId } });
  }

  cancel() {
  this.router.navigate(['/clientes']);
  }

}