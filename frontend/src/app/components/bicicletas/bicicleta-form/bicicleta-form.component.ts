import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Bicicleta } from '../../../shared/models/bicicleta.model';
import { Cliente } from '../../../shared/models/cliente.model';
import { BicicletaService } from '../../../services/bicicleta.service';
import { ClienteService } from '../../../services/cliente.service';
import { HeaderComponent } from "../../header/header.component";

@Component({
  selector: 'app-bicicleta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
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
      // Cliente obrigatório - apenas seleção de cliente existente
      clienteExistente: ['', Validators.required],
      // Campos da bicicleta (obrigatórios)
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      tamanhoAro: ['', [Validators.required, Validators.min(12), Validators.max(29)]],
      cor: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClientes();
    
    // Verifica se veio um clienteId pela URL (ex: vindo da tela de detalhes do cliente)
    const idParam = this.route.snapshot.queryParamMap.get('clienteId');
    if (idParam) {
      this.clienteId = Number(idParam);
      this.bicicletaForm.patchValue({ clienteExistente: this.clienteId });
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
      const formValue = this.bicicletaForm.value;
      const idSelecionado = Number(formValue.clienteExistente);

      if (!idSelecionado) {
        this.error = 'Por favor, selecione um cliente.';
        return;
      }

      this.loading = true;
      this.salvarBicicleta(idSelecionado, formValue);
    }
  }

  private salvarBicicleta(idDoCliente: number, formValue: any): void {
    const bicicleta: Bicicleta = {
      marca: formValue.marca,
      modelo: formValue.modelo,
      tamanhoAro: formValue.tamanhoAro,
      cor: formValue.cor,
      cliente: { 
        id: idDoCliente, 
        nome: '', 
        telefone: '', 
        endereco: '' 
      }
    };

    this.bicicletaService.create(bicicleta).subscribe({
      next: () => {
        this.router.navigate(['/clientes', idDoCliente]);
      },
      error: (error) => {
        this.error = 'Erro ao salvar bicicleta: ' + error.message;
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}