import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../shared/models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';
import { HeaderComponent } from "../../header/header.component";

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.css']
})
export class ClienteListComponent implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.loading = true;
    this.error = '';
    
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filteredClientes = data;
        this.loading = false;
        console.log('Clientes carregados com sucesso:', data); // Debug
      },
      error: (error) => {
        // ✅ CORREÇÃO: Acesse o erro corretamente
        console.error('Erro completo:', error);
        
        if (error.status === 0) {
          this.error = 'Erro de conexão: Verifique se o backend está rodando na porta 8081';
        } else if (error.status === 404) {
          this.error = 'Endpoint não encontrado: Verifique a URL da API';
        } else {
          this.error = `Erro ${error.status}: ${error.statusText || 'Erro ao carregar clientes'}`;
        }
        
        this.loading = false;
        this.clientes = [];
        this.filteredClientes = [];
      }
    });
  }

  searchClientes(): void {
    if (!this.searchTerm) {
      this.filteredClientes = this.clientes;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredClientes = this.clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(term) ||
      cliente.telefone.includes(term)
    );
  }

  navigateToForm(): void {
    this.router.navigate(['/clientes/novo']);
  }

  navigateToDetails(id: number): void {
    this.router.navigate(['/clientes', id]);
  }

  formatarTelefone(event: any) {
  let value = event.target.value.replace(/\D/g, '');
  
  if (value.length <= 10) {
    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  event.target.value = value;
  }

  deleteCliente(id: number): void {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.clienteService.delete(id).subscribe({
        next: () => {
          this.loadClientes();
        },
        error: (error) => {
          console.error('Erro ao excluir:', error);
          this.error = `Erro ao excluir cliente: ${error.status || 'Erro desconhecido'}`;
        }
      });
    }
  }

  // Método para tentar novamente
  retry(): void {
    this.loadClientes();
  }
}