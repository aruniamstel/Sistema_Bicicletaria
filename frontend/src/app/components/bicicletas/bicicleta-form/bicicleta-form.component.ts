import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Bicicleta } from '../../../shared/models/bicicleta.model';
import { Cliente } from '../../../shared/models/cliente.model';
import { BicicletaService } from '../../../services/bicicleta.service';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-bicicleta-form',
  templateUrl: './bicicleta-form.component.html',
  styleUrls: ['./bicicleta-form.component.css']
})
export class BicicletaFormComponent implements OnInit {
  bicicletaForm: FormGroup;
  clientes: Cliente[] = [];
  clienteId: number | null = null;
  loading: boolean = false;
  error: string = '';
  
  constructor(
    private fb: FormBuilder,
    private bicicletaService: BicicletaService,
    private clienteService: ClienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bicicletaForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      tamanhoAro: ['', [Validators.required, Validators.min(12), Validators.max(29)]],
      cor: ['', Validators.required],
      cliente: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClientes();
    
    this.clienteId = Number(this.route.snapshot.queryParamMap.get('clienteId'));
    if (this.clienteId) {
      this.bicicletaForm.patchValue({
        cliente: this.clienteId
      });
    }
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

  onSubmit(): void {
    if (this.bicicletaForm.valid) {
      this.loading = true;
      
      const formValue = this.bicicletaForm.value;
      const bicicleta: Bicicleta = {
        marca: formValue.marca,
        modelo: formValue.modelo,
        tamanhoAro: formValue.tamanhoAro,
        cor: formValue.cor,
        cliente: { id: formValue.cliente }
      };

      this.bicicletaService.create(bicicleta).subscribe({
        next: () => {
          this.router.navigate(['/clientes', formValue.cliente]);
        },
        error: (error) => {
          this.error = 'Erro ao salvar bicicleta: ' + error.message;
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.clienteId) {
      this.router.navigate(['/clientes', this.clienteId]);
    } else {
      this.router.navigate(['/clientes']);
    }
  }
}