import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cliente } from '../../../shared/models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-cliente-list',
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
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filteredClientes = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar clientes: ' + error.message;
        this.loading = false;
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

  deleteCliente(id: number): void {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.clienteService.delete(id).subscribe({
        next: () => {
          this.loadClientes();
        },
        error: (error) => {
          this.error = 'Erro ao excluir cliente: ' + error.message;
        }
      });
    }
  }
}