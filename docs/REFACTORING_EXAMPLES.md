# Exemplos de Implementação - Refatoração HTTP

Este arquivo contém exemplos prontos para refatorar outros componentes.

---

## 📘 Template Básico de Componente com HTTP

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../shared/models/cliente.model';

@Component({
  selector: 'app-meu-componente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meu-componente.component.html',
  styleUrls: ['./meu-componente.component.css']
})
export class MeuComponenteComponent implements OnInit, OnDestroy {
  // Dados
  clientes: Cliente[] = [];

  // Estados
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarDados(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clienteService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('✅ Dados carregados:', data);
          this.clientes = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro:', error);
          this.errorMessage = 'Erro ao carregar dados. Tente novamente.';
          this.loading = false;
        }
      });
  }
}
```

---

## 🔄 Operação CREATE

```typescript
criarCliente(cliente: Cliente): void {
  this.loading = true;
  this.errorMessage = '';
  this.successMessage = '';

  this.clienteService.create(cliente)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        console.log('✅ Criado:', response);
        this.successMessage = 'Cliente criado com sucesso!';
        this.carregarDados(); // Recarrega a lista
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao criar:', error);
        this.errorMessage = 'Erro ao criar cliente. Tente novamente.';
        this.loading = false;
      }
    });
}
```

---

## 📝 Operação UPDATE

```typescript
atualizarCliente(id: number, cliente: Cliente): void {
  this.loading = true;
  this.errorMessage = '';
  this.successMessage = '';

  this.clienteService.update(id, cliente)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        console.log('✅ Atualizado:', response);
        this.successMessage = 'Cliente atualizado com sucesso!';
        this.carregarDados(); // Recarrega a lista
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar:', error);
        this.errorMessage = 'Erro ao atualizar cliente. Tente novamente.';
        this.loading = false;
      }
    });
}
```

---

## 🗑️ Operação DELETE

```typescript
deletarCliente(id: number): void {
  if (confirm('Tem certeza que deseja deletar?')) {
    this.loading = true;
    this.errorMessage = '';

    this.clienteService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Deletado:', response);
          this.successMessage = 'Cliente deletado com sucesso!';
          this.carregarDados(); // Recarrega a lista
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao deletar:', error);
          this.errorMessage = 'Erro ao deletar cliente. Tente novamente.';
          this.loading = false;
        }
      });
  }
}
```

---

## 🔍 Operação READ (Busca Específica)

```typescript
buscarClientePorId(id: number): void {
  this.loading = true;
  this.errorMessage = '';

  this.clienteService.getById(id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (cliente) => {
        console.log('✅ Cliente encontrado:', cliente);
        // Fazer algo com o cliente
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Cliente não encontrado:', error);
        this.errorMessage = 'Cliente não encontrado.';
        this.loading = false;
      }
    });
}
```

---

## 🎯 Múltiplas Requisições em Paralelo

```typescript
carregarTodosDados(): void {
  this.loading = true;
  this.errorMessage = '';

  // Carregar clientes
  this.clienteService.getAll()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (clientes) => {
        console.log('✅ Clientes:', clientes);
        this.clientes = clientes;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar clientes:', error);
        this.errorMessage = 'Erro ao carregar clientes.';
        this.loading = false;
      }
    });

  // Carregar bicicletas
  this.bicicletaService.getAll()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (bicicletas) => {
        console.log('✅ Bicicletas:', bicicletas);
        this.bicicletas = bicicletas;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar bicicletas:', error);
      }
    });
}
```

### Alternativa com CombineLatest (Espera todos):

```typescript
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

carregarTodosDados(): void {
  this.loading = true;
  this.errorMessage = '';

  combineLatest([
    this.clienteService.getAll(),
    this.bicicletaService.getAll(),
    this.ordemServicoService.getAll()
  ])
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ([clientes, bicicletas, ordens]) => {
        console.log('✅ Todos os dados carregados');
        this.clientes = clientes;
        this.bicicletas = bicicletas;
        this.ordens = ordens;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar dados:', error);
        this.errorMessage = 'Erro ao carregar dados. Tente novamente.';
        this.loading = false;
      }
    });
}
```

---

## 🏗️ Template HTML com Estados de Loading/Error

```html
<!-- Indicador de carregamento -->
<div *ngIf="loading" class="loading">
  <p>Carregando dados...</p>
</div>

<!-- Mensagem de erro -->
<div *ngIf="errorMessage" class="error-alert">
  <p>{{ errorMessage }}</p>
  <button (click)="carregarDados()">Tentar Novamente</button>
</div>

<!-- Mensagem de sucesso -->
<div *ngIf="successMessage" class="success-alert">
  <p>{{ successMessage }}</p>
</div>

<!-- Lista de dados -->
<div *ngIf="!loading && clientes.length > 0" class="data-list">
  <div *ngFor="let cliente of clientes" class="item">
    <h3>{{ cliente.nome }}</h3>
    <p>{{ cliente.telefone }}</p>
    <button (click)="editarCliente(cliente)">Editar</button>
    <button (click)="deletarCliente(cliente.id!)">Deletar</button>
  </div>
</div>

<!-- Mensagem quando vazio -->
<div *ngIf="!loading && clientes.length === 0" class="empty-state">
  <p>Nenhum cliente encontrado.</p>
</div>
```

---

## 🎨 Estilos CSS para Estados

```css
/* Loading */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #0066cc;
}

.loading::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border: 2px solid #0066cc;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Alert */
.error-alert {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
}

.error-alert button {
  background-color: #721c24;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

/* Success Alert */
.success-alert {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}
```

---

## 🚨 Tratamento Avançado de Erros

```typescript
tratarErroHttp(error: any): string {
  if (error.status === 0) {
    return 'Erro de conexão: Verifique se o backend está rodando';
  } else if (error.status === 400) {
    return 'Requisição inválida: ' + (error.error?.message || 'Verifique os dados');
  } else if (error.status === 401) {
    return 'Não autenticado: Faça login novamente';
  } else if (error.status === 403) {
    return 'Acesso negado: Você não tem permissão';
  } else if (error.status === 404) {
    return 'Recurso não encontrado';
  } else if (error.status === 409) {
    return 'Conflito: ' + (error.error?.message || 'Dados duplicados');
  } else if (error.status === 500) {
    return 'Erro do servidor: Tente novamente mais tarde';
  } else {
    return `Erro ${error.status}: ${error.statusText || 'Erro desconhecido'}`;
  }
}
```

---

## 📋 Checklist para Refatorar um Componente

- [ ] Adicionar `OnDestroy` à interface do componente
- [ ] Criar `private destroy$ = new Subject<void>()`
- [ ] Implementar `ngOnDestroy()` com cleanup
- [ ] Injetar o service necessário no constructor
- [ ] Remover todos os `localStorage.getItem()`
- [ ] Remover todos os `JSON.parse()`
- [ ] Adicionar `loading: boolean = false`
- [ ] Adicionar `errorMessage: string = ''`
- [ ] Substituir `of()` por chamadas HTTP do service
- [ ] Adicionar `.pipe(takeUntil(this.destroy$))` em todos os subscribes
- [ ] Implementar tratamento de erros com `.subscribe({ next, error })`
- [ ] Testar no navegador (F12 → Network tab)
- [ ] Verificar console para erros
- [ ] Confirmar que backend está rodando em http://localhost:8080

---

## 🔗 Referências Rápidas

### Imports Necessários
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
```

### Padrão Observable
```typescript
this.service.method()
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data) => { /* sucesso */ },
    error: (error) => { /* erro */ }
  });
```

### Injeção de Serviço
```typescript
constructor(private myService: MyService) {}
```

### Cleanup
```typescript
private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

**Boa sorte com a refatoração! 🚀**
