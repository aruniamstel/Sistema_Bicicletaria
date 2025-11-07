import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../../shared/models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';
import { HeaderComponent } from "../../header/header.component";

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css']
})
export class ClienteFormComponent implements OnInit {
  clienteForm: FormGroup;
  isEditing: boolean = false;
  loading: boolean = false;
  error: string = '';
  
  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
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
      this.isEditing = true;
      this.loadCliente(+id);
    }
  }

  loadCliente(id: number): void {
    this.loading = true;
    this.clienteService.getById(id).subscribe({
      next: (cliente) => {
        this.clienteForm.patchValue(cliente);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar cliente: ' + error.message;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.clienteForm.valid) {
      this.loading = true;
      const cliente: Cliente = this.clienteForm.value;
      
      const operation = this.isEditing
        ? this.clienteService.update(+this.route.snapshot.paramMap.get('id')!, cliente)
        : this.clienteService.create(cliente);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/clientes']);
        },
        error: (error) => {
          this.error = 'Erro ao salvar cliente: ' + error.message;
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/clientes']);
  }
}