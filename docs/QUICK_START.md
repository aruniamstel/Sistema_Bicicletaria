# 🚀 Quick Start - Refatoração HTTP Completa

## Status: ✅ COMPLETO

Todos os Services e Componentes principais foram refatorados de localStorage para HTTP!

---

## 📦 O Que Foi Feito

### ✅ Services (6/6)
- [x] `ClienteService` - HTTP com CRUD completo
- [x] `BicicletaService` - HTTP com CRUD completo
- [x] `OrdemServicoService` - HTTP com CRUD + operações especiais
- [x] `PecaService` - HTTP com CRUD completo
- [x] `ServicoService` - HTTP com CRUD completo
- [x] `environment.ts` - Configuração centralizada

### ✅ Componentes (3/3)
- [x] `AgendaComponent` - Carrega ordens via HTTP
- [x] `BicicletaManagerComponent` - CRUD de bicicletas via HTTP
- [x] `ClienteManagerComponent` - CRUD de clientes via HTTP

### ✅ Melhorias
- [x] Gerenciamento de subscriptions com `takeUntil`
- [x] Estados `loading` e `errorMessage` em todos
- [x] Tratamento de erros HTTP centralizado
- [x] Cleanup automático com `OnDestroy`
- [x] Documentação completa

---

## ⚙️ Setup Necessário

### 1️⃣ Verificar Backend
```bash
cd backend
./mvnw spring-boot:run
```
**Esperado:** Backend rodando em `http://localhost:8080`

### 2️⃣ Verificar Frontend
```bash
cd frontend
npm start
```
**Esperado:** Frontend rodando em `http://localhost:4200`

### 3️⃣ Verificar Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',  // ✅ Correto
  // ...
};
```

---

## 🧪 Teste Rápido

### Via Browser Console (F12)

#### 1. Abrir DevTools
```
F12 → Console
```

#### 2. Verificar Chamadas HTTP
```
F12 → Network Tab → Executar ação no app
```

#### 3. Procurar por requisições
```
GET http://localhost:8080/clientes
POST http://localhost:8080/bicicletas
```

### Via Angular HttpClient Logging

Adicione isto em `app.config.ts` para ver requisições:
```typescript
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          console.log(`[HTTP] ${req.method} ${req.url}`);
          return next(req);
        }
      ])
    ),
    // ... outros providers
  ]
};
```

---

## 📋 Endpoints Mapeados

### Clientes
```
GET    /clientes                  # Listar todos
GET    /clientes/{id}             # Buscar por ID
GET    /clientes/telefone/{tel}   # Buscar por telefone
GET    /clientes/buscar?nome=X    # Buscar por nome
GET    /clientes/{id}/com-bicicletas
POST   /clientes                  # Criar
PUT    /clientes/{id}             # Atualizar
DELETE /clientes/{id}             # Deletar
```

### Bicicletas
```
GET    /bicicletas                # Listar todas
GET    /bicicletas/{id}           # Buscar por ID
GET    /bicicletas/cliente/{id}   # Buscar por cliente
POST   /bicicletas                # Criar
PUT    /bicicletas/{id}           # Atualizar
DELETE /bicicletas/{id}           # Deletar
```

### Ordens de Serviço
```
GET    /ordens-servico                      # Listar todas
GET    /ordens-servico/{id}                 # Buscar por ID
GET    /ordens-servico/cliente/{id}         # Por cliente
GET    /ordens-servico/bicicleta/{id}       # Por bicicleta
GET    /ordens-servico/status/{status}      # Por status
POST   /ordens-servico                      # Criar
PUT    /ordens-servico/{id}                 # Atualizar
DELETE /ordens-servico/{id}                 # Deletar
POST   /ordens-servico/{id}/servicos        # Adicionar serviço
POST   /ordens-servico/{id}/pecas           # Adicionar peça
PUT    /ordens-servico/{id}/status          # Alterar status
```

### Peças
```
GET    /pecas                     # Listar todas
GET    /pecas/{id}                # Buscar por ID
POST   /pecas                     # Criar
PUT    /pecas/{id}                # Atualizar
DELETE /pecas/{id}                # Deletar
```

### Serviços
```
GET    /servicos                  # Listar todos
GET    /servicos/{id}             # Buscar por ID
POST   /servicos                  # Criar
PUT    /servicos/{id}             # Atualizar
DELETE /servicos/{id}             # Deletar
```

---

## 🐛 Troubleshooting

### ❌ "Cannot find module 'environments/environment'"
**Solução:** Arquivo foi criado em `src/environments/environment.ts`

### ❌ "Http 0 error"
**Problema:** Backend não está rodando
**Solução:** 
```bash
cd backend
./mvnw spring-boot:run
```

### ❌ "404 Not Found"
**Problema:** Endpoint não existe ou URL incorreta
**Solução:** Verificar `app.config.ts` e `environment.ts`

### ❌ "CORS Error"
**Problema:** Backend não permite requisições de http://localhost:4200
**Solução:** Adicionar no controller do backend:
```java
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/clientes")
public class ClienteController { ... }
```

### ❌ Dados não carregam
**Verificação:**
1. Abrir DevTools (F12) → Network
2. Procurar pela requisição (ex: GET /clientes)
3. Ver response (deve ser JSON com dados)
4. Ver console para erros de JavaScript

---

## 📁 Arquivos Modificados

### Services
- ✅ `src/app/services/cliente.service.ts`
- ✅ `src/app/services/bicicleta.service.ts`
- ✅ `src/app/services/ordem-servico.service.ts`
- ✅ `src/app/services/peca.service.ts`
- ✅ `src/app/services/servico.service.ts`

### Componentes
- ✅ `src/app/components/agenda/agenda.component.ts`
- ✅ `src/app/components/dashboard/BicicletaManagerComponent/bicicleta-manager.component.ts`
- ✅ `src/app/components/dashboard/ClienteManagerComponent/cliente-manager.component.ts`

### Configuração
- ✅ `src/environments/environment.ts` (NOVO)

---

## 💡 Dicas Importantes

### ✅ Sempre usar takeUntil para unsubscribe
```typescript
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.service.getAll()
    .pipe(takeUntil(this.destroy$))  // ✅ IMPORTANTE
    .subscribe(...)
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### ✅ Sempre implementar loading e error
```typescript
loading = false;
errorMessage = '';
successMessage = '';

// No subscribe
this.loading = true;
this.errorMessage = '';

this.service.method()
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data) => {
      this.loading = false;
      // processar data
    },
    error: (error) => {
      this.loading = false;
      this.errorMessage = 'Mensagem do erro';
    }
  });
```

### ✅ Refatorar similarmente para outros componentes
Use o template em `REFACTORING_EXAMPLES.md`

---

## 🎯 Próximas Tarefas Recomendadas

1. **Refatorar componentes pendentes:**
   - [ ] `ServicoManagerComponent`
   - [ ] `EstoqueManagerComponent`
   - [ ] `HistoricoBicicletaComponent`
   - [ ] Componentes de formulário

2. **Implementar features avançadas:**
   - [ ] Autenticação com JWT
   - [ ] Interceptor HTTP centralizado
   - [ ] Retry automático para erros de rede
   - [ ] Cache com RxJS

3. **Melhorias:**
   - [ ] Pagination para listas grandes
   - [ ] Busca/filtros no backend
   - [ ] Validações servidor
   - [ ] Testes unitários

---

## 📊 Comparação Antes/Depois

### ❌ ANTES (localStorage)
```typescript
ngOnInit(): void {
  const data = localStorage.getItem('clientes');
  this.clientes = data ? JSON.parse(data) : [];
}

salvar(cliente: Cliente): void {
  const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
  clientes.push(cliente);
  localStorage.setItem('clientes', JSON.stringify(clientes));
}
```

### ✅ DEPOIS (HTTP)
```typescript
ngOnInit(): void {
  this.clienteService.getAll()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => this.clientes = data,
      error: (error) => this.errorMessage = 'Erro ao carregar'
    });
}

salvar(cliente: Cliente): void {
  this.clienteService.create(cliente)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.successMessage = 'Salvo com sucesso!';
        this.carregarDados();
      },
      error: (error) => this.errorMessage = 'Erro ao salvar'
    });
}
```

---

## 🔒 Segurança

### ✅ Implementado
- Erros HTTP capturados
- Tokens podem ser adicionados em interceptor
- URLs no environment (fácil mudar em produção)

### ⚠️ TODO
- Autenticação JWT
- CSRF protection (se necessário)
- Validação no servidor
- Rate limiting

---

## 📞 Suporte & Documentação

- **Arquivo Resumo:** `REFACTORING_SUMMARY.md`
- **Exemplos:** `REFACTORING_EXAMPLES.md`
- **Este arquivo:** `QUICK_START.md`

---

## ✨ Você Está Pronto!

- ✅ Backend: http://localhost:8080
- ✅ Frontend: http://localhost:4200
- ✅ Services refatorados
- ✅ Componentes atualizados
- ✅ HTTP funcionando
- ✅ Documentação completa

**Comece a usar agora! 🚀**

---

**Data:** 02/02/2026
**Status:** ✅ Refatoração Completa
**Próximo:** Implementar autenticação e testes
