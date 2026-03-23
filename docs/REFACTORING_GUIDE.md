# 🔄 Guia de Refatoração para Componentes Pendentes

Este arquivo ajuda a refatorar outros componentes que ainda usam localStorage.

---

## 📋 Lista de Componentes por Refatorar

### Componentes Identificados (A Refatorar)

- [ ] ServicoManagerComponent
- [ ] EstoqueManagerComponent
- [ ] HistoricoBicicletaComponent
- [ ] Componentes de Formulário (bicicleta-form, cliente-form, etc)
- [ ] Componentes de Lista (cliente-list, etc)
- [ ] Outros componentes que usem localStorage

---

## 🔍 Como Identificar Componentes a Refatorar

### 1. Buscar por localStorage
```bash
grep -r "localStorage.getItem" src/app/components/
grep -r "localStorage.setItem" src/app/components/
grep -r "JSON.parse" src/app/components/
grep -r "JSON.stringify" src/app/components/
```

### 2. Buscar no VS Code
```
Ctrl+Shift+F (Windows/Linux) ou Cmd+Shift+F (Mac)
Buscar: "localStorage"
Mostrar em: src/app/components
```

---

## ✅ Passo a Passo para Refatorar

### Fase 1: Preparação

#### 1. Copiar Template Base
Use este template como base (também em `REFACTORING_EXAMPLES.md`):

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MyService } from '../../services/my.service';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.css']
})
export class MyComponentComponent implements OnInit, OnDestroy {
  // Dados
  items: any[] = [];

  // Estados
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(private myService: MyService) {}

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

    this.myService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.items = data;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Erro ao carregar dados';
          this.loading = false;
        }
      });
  }
}
```

#### 2. Listar Chamadas localStorage
No componente a refatorar, listar:
- [ ] `localStorage.getItem('...')`
- [ ] `localStorage.setItem('...')`
- [ ] `JSON.parse(...)`
- [ ] `JSON.stringify(...)`

---

### Fase 2: Refatoração

#### 1. Atualizar Imports
```typescript
// ❌ REMOVER
import { ... } from '@angular/platform-browser';

// ✅ ADICIONAR
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MyService } from '../../services/my.service';
```

#### 2. Implementar OnDestroy
```typescript
// ❌ ANTES
export class MyComponent implements OnInit {

// ✅ DEPOIS
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

#### 3. Adicionar Estados
```typescript
// ✅ ADICIONAR AO COMPONENTE
loading = false;
loadingOperation = false;
errorMessage = '';
successMessage = '';
```

#### 4. Injetar Service
```typescript
// ❌ ANTES
constructor(private fb: FormBuilder) {}

// ✅ DEPOIS
constructor(
  private fb: FormBuilder,
  private myService: MyService  // Novo
) {}
```

#### 5. Substituir localStorage por HTTP

**ANTES - localStorage:**
```typescript
ngOnInit(): void {
  const data = localStorage.getItem('items');
  this.items = data ? JSON.parse(data) : [];
}

salvar(item: any): void {
  const items = JSON.parse(localStorage.getItem('items') || '[]');
  items.push(item);
  localStorage.setItem('items', JSON.stringify(items));
}
```

**DEPOIS - HTTP:**
```typescript
ngOnInit(): void {
  this.carregarDados();
}

carregarDados(): void {
  this.loading = true;
  this.errorMessage = '';

  this.myService.getAll()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar dados';
        this.loading = false;
      }
    });
}

salvar(item: any): void {
  this.loadingOperation = true;
  this.errorMessage = '';

  this.myService.create(item)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.successMessage = 'Salvo com sucesso!';
        this.carregarDados();
        this.loadingOperation = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao salvar';
        this.loadingOperation = false;
      }
    });
}
```

#### 6. Atualizar Template

**ANTES:**
```html
<div *ngFor="let item of items">
  {{ item.name }}
</div>
```

**DEPOIS:**
```html
<!-- Loading -->
<div *ngIf="loading" class="loading">
  Carregando...
</div>

<!-- Erro -->
<div *ngIf="errorMessage" class="error">
  {{ errorMessage }}
  <button (click)="carregarDados()">Tentar Novamente</button>
</div>

<!-- Sucesso -->
<div *ngIf="successMessage" class="success">
  {{ successMessage }}
</div>

<!-- Lista -->
<div *ngIf="!loading && items.length > 0">
  <div *ngFor="let item of items">
    {{ item.name }}
  </div>
</div>

<!-- Vazio -->
<div *ngIf="!loading && items.length === 0">
  Nenhum item encontrado
</div>
```

---

### Fase 3: Testes

#### 1. Testes Manuais

- [ ] Abrir F12 (DevTools)
- [ ] Aba Console: Ver se há erros
- [ ] Aba Network: Ver requisições HTTP
- [ ] Carregar página: Dados devem vir de HTTP
- [ ] Criar item: Deve chamar POST
- [ ] Atualizar item: Deve chamar PUT
- [ ] Deletar item: Deve chamar DELETE

#### 2. Verificar Console
```javascript
// Você deve ver no console:
✅ Dados carregados: [...]
// Não deve haver erros de localStorage
```

#### 3. Verificar Network
```
GET http://localhost:8080/items
200 OK - Response com dados
```

---

## 📊 Comparação Código

### Exemplo: ServicoManagerComponent

#### ❌ ANTES (localStorage)
```typescript
export class ServicoManagerComponent implements OnInit {
  servicos: any[] = [];
  
  ngOnInit(): void {
    const data = localStorage.getItem('servicos');
    this.servicos = data ? JSON.parse(data) : [];
  }

  adicionarServico(servico: any): void {
    this.servicos.push(servico);
    localStorage.setItem('servicos', JSON.stringify(this.servicos));
    alert('Serviço adicionado!');
  }

  deletarServico(id: number): void {
    this.servicos = this.servicos.filter(s => s.id !== id);
    localStorage.setItem('servicos', JSON.stringify(this.servicos));
  }
}
```

#### ✅ DEPOIS (HTTP)
```typescript
export class ServicoManagerComponent implements OnInit, OnDestroy {
  servicos: any[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  constructor(private servicoService: ServicoService) {}

  ngOnInit(): void {
    this.carregarServicos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarServicos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.servicoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.servicos = data;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Erro ao carregar serviços';
          this.loading = false;
        }
      });
  }

  adicionarServico(servico: any): void {
    this.loading = true;
    this.errorMessage = '';

    this.servicoService.create(servico)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Serviço adicionado com sucesso!';
          this.carregarServicos();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao adicionar serviço';
          this.loading = false;
        }
      });
  }

  deletarServico(id: number): void {
    if (confirm('Deseja deletar?')) {
      this.loading = true;
      this.errorMessage = '';

      this.servicoService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Serviço deletado com sucesso!';
            this.carregarServicos();
          },
          error: (error) => {
            this.errorMessage = 'Erro ao deletar serviço';
            this.loading = false;
          }
        });
    }
  }
}
```

---

## 🎯 Checklist por Componente

### ServicoManagerComponent
- [ ] Adicionar `OnDestroy`
- [ ] Adicionar `destroy$` Subject
- [ ] Adicionar estados (loading, error, success)
- [ ] Injetar `ServicoService`
- [ ] Remover `localStorage.getItem()`
- [ ] Remover `localStorage.setItem()`
- [ ] Remover `JSON.parse()`
- [ ] Remover `JSON.stringify()`
- [ ] Implementar `carregarServicos()` com HTTP
- [ ] Atualizar `adicionarServico()` para HTTP
- [ ] Atualizar `deletarServico()` para HTTP
- [ ] Adicionar `takeUntil` em todos subscribes
- [ ] Atualizar template com loading/error
- [ ] Testar no navegador

### EstoqueManagerComponent
- [ ] (Repetir checklist acima)

### HistoricoBicicletaComponent
- [ ] (Repetir checklist acima)

---

## 🔗 Referências Rápidas

### Import padrão
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
```

### Destruição padrão
```typescript
private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Subscribe padrão
```typescript
this.service.method()
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data) => { },
    error: (error) => { }
  });
```

---

## 📚 Documentação de Referência

- **REFACTORING_SUMMARY.md** - Documentação detalhada
- **REFACTORING_EXAMPLES.md** - Exemplos de código
- **QUICK_START.md** - Guia rápido
- **API_MODELS.md** - Modelos de dados

---

## 💡 Dicas Importantes

### 1. Sempre implementar OnDestroy
Sem isso, há risco de memory leak.

### 2. Sempre usar takeUntil
Garantir que subscriptions sejam canceladas.

### 3. Sempre ter loading/error/success
Melhor UX e debugging.

### 4. Testar no DevTools
F12 → Network para ver requisições HTTP.

### 5. Seguir padrão
Todos os componentes refatorados seguem o mesmo padrão.

---

## ❓ Dúvidas Comuns

### P: E se o componente tiver múltiplos services?
**R:** Injetar todos no constructor:
```typescript
constructor(
  private servicoService: ServicoService,
  private bicicletaService: BicicletaService,
  private clienteService: ClienteService
) {}
```

### P: E se houver muitos subscribes?
**R:** Usar um Subject para cada fluxo ou combineLatest:
```typescript
combineLatest([
  this.servicoService.getAll(),
  this.bicicletaService.getAll()
])
  .pipe(takeUntil(this.destroy$))
  .subscribe(...)
```

### P: Como testar requisições HTTP?
**R:** Usar DevTools:
1. F12 → Network tab
2. Realizar ação
3. Ver requisição (GET, POST, etc)
4. Ver response (dados)

### P: E se o backend não responder?
**R:** Mostrar mensagem de erro:
```typescript
error: (error) => {
  this.errorMessage = 'Erro ao conectar. Servidor não respondeu.';
}
```

---

## 🚀 Próximos Passos

Após refatorar todos os componentes:

1. **Remover localStorage completamente:**
   ```bash
   grep -r "localStorage" src/app/
   # Não deve retornar nada
   ```

2. **Implementar autenticação:**
   - Adicionar JWT
   - AuthGuard para rotas
   - Login/Logout

3. **Adicionar testes:**
   - Testes unitários
   - Testes de integração
   - Testes E2E

4. **Otimizar performance:**
   - Caching
   - Pagination
   - Lazy loading

---

## ✅ Quando Terminar

Você saberá que refatorou com sucesso quando:

- ✅ Nenhum `localStorage.getItem()` no código
- ✅ Nenhum `JSON.parse()` para dados do backend
- ✅ Todos componentes têm `loading` e `errorMessage`
- ✅ Todos componentes implementam `OnDestroy`
- ✅ Requisições HTTP aparecem no DevTools
- ✅ Dados vêm do backend (não do navegador)
- ✅ Tudo sincroniza entre abas/dispositivos

---

**Boa refatoração! 🚀**
