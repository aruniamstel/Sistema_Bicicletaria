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

    // ✅ Debug: Observa mudanças no form
    this.ordemForm.valueChanges.subscribe(values => {
      console.log('📝 Form values changed:', values);
    });
    
    this.ordemForm.get('bicicleta')?.valueChanges.subscribe(bicicletaId => {
      console.log('🚲 Bicicleta selection changed:', bicicletaId);
    });
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
    const id = Number(clienteId);
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
          
          // ✅ Se houver apenas uma bicicleta, seleciona automaticamente
          if (this.bicicletas.length === 1) {
            console.log('🎯 Apenas uma bicicleta, selecionando automaticamente...');
            this.ordemForm.patchValue({ bicicleta: this.bicicletas[0].id });
            //this.onBicicletaChange(this.bicicletas[0].id.toString());
          }
        },
        error: (error) => {
          console.error('❌ Erro ao carregar bicicletas:', error);
          this.error = 'Erro ao carregar bicicletas: ' + error.message;
          this.loading = false;
        }
      });
    } else {
      this.bicicletas = [];
      this.clienteSelecionado = undefined;
      this.bicicletaSelecionada = undefined;
      this.ordemForm.patchValue({ bicicleta: '' });
      console.log('🗑️ Cliente deselecionado - bicicletas limpas');
    }
  }

  onBicicletaChange(bicicletaId: string): void {
    const id = Number(bicicletaId);
    console.log('🚲 Bicicleta selecionada ID:', id);
    
    if (id) {
      this.bicicletaSelecionada = this.bicicletas.find(b => b.id === id);
      console.log('🔍 Bicicleta encontrada:', this.bicicletaSelecionada);
      
      // ✅ Atualiza o debug visual
      this.updateDebugInfo();
    } else {
      this.bicicletaSelecionada = undefined;
      console.log('🗑️ Bicicleta deselecionada');
    }
  }

  // ✅ NOVO MÉTODO: Atualiza informações de debug
  private updateDebugInfo(): void {
    console.log('🔍 DEBUG - Estado atual:');
    console.log('  👤 Cliente selecionado:', this.clienteSelecionado?.nome, '(ID:', this.clienteSelecionado?.id, ')');
    console.log('  🚲 Bicicleta selecionada:', this.bicicletaSelecionada?.marca, this.bicicletaSelecionada?.modelo, '(ID:', this.bicicletaSelecionada?.id, ')');
    console.log('  📋 Form válido:', this.ordemForm.valid);
    console.log('  🔘 Botão habilitado:', !this.ordemForm.invalid && !this.loading && !!this.clienteSelecionado && !!this.bicicletaSelecionada);
  }

  onSubmit(): void {
    if (this.ordemForm.valid && this.clienteSelecionado && this.bicicletaSelecionada) {
      this.loading = true;
      const formValue = this.ordemForm.value;

      console.log('🎯 Criando ordem com:');
      console.log('  👤 Cliente:', this.clienteSelecionado.nome);
      console.log('  🚲 Bicicleta:', this.bicicletaSelecionada.marca, this.bicicletaSelecionada.modelo);
      console.log('  🔧 Problema:', formValue.problemaRelatado);

      const ordemServico = {
        dataEntrada: new Date().toISOString(),
        problemaRelatado: formValue.problemaRelatado,
        observacoes: formValue.observacoes,
        status: 'ABERTA' as const,
        cliente: this.clienteSelecionado,
        bicicleta: this.bicicletaSelecionada,
        servicos: [],
        pecas: [],
        valorTotal: 0
      };

      this.ordemService.create(ordemServico).subscribe({
        next: (ordem) => {
          console.log('✅ Ordem criada com sucesso:', ordem);
          this.router.navigate(['/ordens-servico', ordem.id]);
        },
        error: (error) => {
          console.error('❌ Erro ao criar ordem:', error);
          this.error = 'Erro ao criar ordem de serviço: ' + error.message;
          this.loading = false;
        }
      });
    } else {
      console.warn('⚠️ Form inválido para envio:');
      console.log('  📋 Form válido:', this.ordemForm.valid);
      console.log('  👤 Cliente selecionado:', !!this.clienteSelecionado);
      console.log('  🚲 Bicicleta selecionada:', !!this.bicicletaSelecionada);
      this.error = 'Por favor, preencha todos os campos obrigatórios.';
    }
  }

  cancel(): void {
    this.router.navigate(['/ordens-servico']);
  }
}