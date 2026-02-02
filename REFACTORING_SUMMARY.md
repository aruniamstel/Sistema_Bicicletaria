# Refatoração: localStorage → HTTP Backend

## Objetivo
Substituir o uso de `localStorage` por chamadas HTTP reais para o backend Spring Boot.

**Data**: 02/02/2026
**Backend URL**: http://localhost:8080
**Status**: ✅ Completo

---

## 📋 Alterações Realizadas

### 1. Ambiente (Environment)
**Arquivo Criado**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  endpoints: {
    clientes: '/clientes',
    bicicletas: '/bicicletas',
    ordensServico: '/ordens-servico',
    pecas: '/pecas',
    servicos: '/servicos',
    categorias: '/categorias',
    funcionarios: '/funcionarios'
  }
};
```

---

### 2. Services Refatorados

#### ✅ `cliente.service.ts`
- ✓ Injeta `HttpClient`
- ✓ Implementa métodos CRUD completos: `getAll()`, `getById()`, `getByTelefone()`, `getByNome()`, `getComBicicletas()`, `create()`, `update()`, `delete()`
- ✓ Usa `environment.apiUrl` para construir URLs
- ✓ Tratamento centralizado de erros HTTP
- ✓ Usa Observables com operador `catchError`
- ✓ Endpoints mapeados:
  - `GET /clientes` - Listar todos
  - `GET /clientes/{id}` - Buscar por ID
  - `GET /clientes/telefone/{telefone}` - Buscar por telefone
  - `GET /clientes/buscar?nome={nome}` - Buscar por nome
  - `GET /clientes/{id}/com-bicicletas` - Buscar com bicicletas
  - `POST /clientes` - Criar
  - `PUT /clientes/{id}` - Atualizar
  - `DELETE /clientes/{id}` - Deletar

#### ✅ `bicicleta.service.ts`
- ✓ Injeta `HttpClient`
- ✓ Implementa métodos CRUD: `getAll()`, `getById()`, `getByCliente()`, `create()`, `update()`, `delete()`
- ✓ Tratamento de erros HTTP
- ✓ Usa Observables
- ✓ Endpoints mapeados:
  - `GET /bicicletas` - Listar todas
  - `GET /bicicletas/{id}` - Buscar por ID
  - `GET /bicicletas/cliente/{clienteId}` - Buscar por cliente
  - `POST /bicicletas` - Criar
  - `PUT /bicicletas/{id}` - Atualizar
  - `DELETE /bicicletas/{id}` - Deletar

#### ✅ `ordem-servico.service.ts`
- ✓ Injeta `HttpClient`
- ✓ Implementa métodos CRUD: `getAll()`, `getById()`, `create()`, `update()`, `delete()`
- ✓ Métodos adicionais: `getByCliente()`, `getByBicicleta()`, `getByStatus()`
- ✓ Operações específicas: `addServico()`, `addPeca()`, `updateStatus()`, `getValorTotal()`
- ✓ Tratamento de erros HTTP
- ✓ Endpoints mapeados:
  - `GET /ordens-servico` - Listar todas
  - `GET /ordens-servico/{id}` - Buscar por ID
  - `GET /ordens-servico/cliente/{clienteId}` - Listar por cliente
  - `GET /ordens-servico/bicicleta/{bicicletaId}` - Listar por bicicleta
  - `GET /ordens-servico/status/{status}` - Listar por status
  - `POST /ordens-servico` - Criar
  - `PUT /ordens-servico/{id}` - Atualizar
  - `DELETE /ordens-servico/{id}` - Deletar
  - `POST /ordens-servico/{id}/servicos` - Adicionar serviço
  - `POST /ordens-servico/{id}/pecas` - Adicionar peça
  - `PUT /ordens-servico/{id}/status` - Atualizar status
  - `GET /ordens-servico/{id}/valor-total` - Buscar valor total

#### ✅ `peca.service.ts`
- ✓ Injeta `HttpClient`
- ✓ Implementa métodos CRUD: `getAll()`, `getById()`, `create()`, `update()`, `delete()`
- ✓ Tratamento de erros HTTP
- ✓ Endpoints mapeados:
  - `GET /pecas` - Listar todas
  - `GET /pecas/{id}` - Buscar por ID
  - `POST /pecas` - Criar
  - `PUT /pecas/{id}` - Atualizar
  - `DELETE /pecas/{id}` - Deletar

#### ✅ `servico.service.ts`
- ✓ Injeta `HttpClient`
- ✓ Implementa métodos CRUD: `getAll()`, `getById()`, `create()`, `update()`, `delete()`
- ✓ Tratamento de erros HTTP
- ✓ Endpoints mapeados:
  - `GET /servicos` - Listar todos
  - `GET /servicos/{id}` - Buscar por ID
  - `POST /servicos` - Criar
  - `PUT /servicos/{id}` - Atualizar
  - `DELETE /servicos/{id}` - Deletar

---

### 3. Componentes Refatorados

#### ✅ `agenda.component.ts`
**Alterações principais:**
- ✓ Remove `localStorage.getItem('ordens-servico')`
- ✓ Injeta `OrdemServicoService`
- ✓ Implementa `OnDestroy` com `Subject<void>` para cleanup
- ✓ Adiciona `loading: boolean` para indicar carregamento
- ✓ Adiciona `errorMessage: string` para erros da API
- ✓ No `ngOnInit()`, usa `.subscribe()` para carregar ordens
- ✓ Tratamento de erros com feedback ao usuário
- ✓ Unsubscribe automático com `takeUntil`

**Fluxo de dados:**
```
ngOnInit() → carregarOrdensServico()
  ↓
ordemServicoService.getAll()
  ↓
.subscribe() → carrega eventos no calendário
```

#### ✅ `bicicleta-manager.component.ts`
**Alterações principais:**
- ✓ Remove todas as chamadas `localStorage.getItem()` e `JSON.parse()`
- ✓ Injeta `BicicletaService`, `ClienteService`, `OrdemServicoService`
- ✓ Implementa `OnDestroy` com cleanup
- ✓ Adiciona `loading: boolean`, `loadingClientes: boolean`, `loadingOrdens: boolean`
- ✓ Adiciona `errorMessage: string`, `successMessage: string`
- ✓ No `ngOnInit()`, carrega dados via `.subscribe()`
- ✓ `salvarBicicleta()` diferencia criar vs atualizar
- ✓ `excluirBicicleta()` deleta via API
- ✓ Tratamento completo de erros e sucessos
- ✓ Unsubscribe automático com `takeUntil`

**Fluxo de dados:**
```
ngOnInit() → carregarDados()
  ├─ bicicletaService.getAll() → carrega bicicletas
  ├─ clienteService.getAll() → carrega clientes
  └─ ordemServicoService.getAll() → carrega ordens

salvarBicicleta() → create() ou update()
excluirBicicleta() → delete()
aplicarFiltros() → filtra localmente
```

#### ✅ `cliente-manager.component.ts`
**Alterações principais:**
- ✓ Já estava usando `ClienteService` (com melhoras)
- ✓ Implementa `OnDestroy` com cleanup
- ✓ Adiciona `loadingOperation: boolean` para operações CRUD
- ✓ Adiciona `successMessage: string` para feedback positivo
- ✓ Renomeia `error` para `errorMessage` (padrão)
- ✓ Todos os `.subscribe()` usam `takeUntil(this.destroy$)`
- ✓ `salvarCliente()` diferencia criar vs atualizar
- ✓ `excluirCliente()` deleta via API
- ✓ Tratamento melhorado de erros com mensagens claras
- ✓ Unsubscribe automático com `takeUntil`

**Fluxo de dados:**
```
ngOnInit() → carregarClientes()
  ↓
clienteService.getAll() → exibe lista

salvarCliente() → create() ou update()
excluirCliente() → delete()
aplicarFiltros() → filtra localmente
```

---

## 🎯 Padrões de Desenvolvimento

### ✅ Injeção de Dependências
Todos os services agora usam `HttpClient` injetado:
```typescript
constructor(private http: HttpClient) {}
```

### ✅ Gerenciamento de Subscriptions
Todos os componentes implementam `OnDestroy`:
```typescript
private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

// No subscribe:
.pipe(takeUntil(this.destroy$))
.subscribe(...)
```

### ✅ Tratamento de Erros
Centralizado nos services com `handleError()`:
```typescript
.pipe(catchError(this.handleError))
```

### ✅ Feedback ao Usuário
Estados de UI para melhor UX:
```typescript
loading = false;           // Carregando dados
loadingOperation = false;  // Criando/atualizando
errorMessage = '';         // Mensagens de erro
successMessage = '';       // Mensagens de sucesso
```

### ✅ Observables com Operadores
Uso de `takeUntil` para limpeza automática:
```typescript
this.service.method()
  .pipe(takeUntil(this.destroy$))
  .subscribe(...)
```

---

## 🔧 Configuração Necessária

### Backend deve estar rodando em:
```
http://localhost:8080
```

### Endpoints esperados (do Spring Boot):
- `GET /clientes` - Lista todos os clientes
- `POST /clientes` - Cria novo cliente
- `GET /clientes/{id}` - Busca cliente específico
- `PUT /clientes/{id}` - Atualiza cliente
- `DELETE /clientes/{id}` - Deleta cliente

- `GET /bicicletas` - Lista todas as bicicletas
- `POST /bicicletas` - Cria nova bicicleta
- `GET /bicicletas/{id}` - Busca bicicleta específica
- `PUT /bicicletas/{id}` - Atualiza bicicleta
- `DELETE /bicicletas/{id}` - Deleta bicicleta
- `GET /bicicletas/cliente/{clienteId}` - Lista bicicletas por cliente

- `GET /ordens-servico` - Lista todas as ordens
- `POST /ordens-servico` - Cria nova ordem
- `GET /ordens-servico/{id}` - Busca ordem específica
- `PUT /ordens-servico/{id}` - Atualiza ordem
- `DELETE /ordens-servico/{id}` - Deleta ordem
- `POST /ordens-servico/{id}/servicos` - Adiciona serviço
- `POST /ordens-servico/{id}/pecas` - Adiciona peça
- `PUT /ordens-servico/{id}/status` - Atualiza status

### CORS (se necessário)
O backend pode precisar habilitar CORS para `http://localhost:4200`:
```java
@CrossOrigin(origins = "http://localhost:4200")
```

---

## 🚀 Como Usar

### 1. Verificar que o backend está rodando:
```bash
# Terminal do backend
cd backend
./mvnw spring-boot:run
```

### 2. Verificar a URL da API:
```typescript
// src/environments/environment.ts
apiUrl: 'http://localhost:8080'
```

### 3. Usar os services nos componentes:
```typescript
constructor(private clienteService: ClienteService) {}

ngOnInit(): void {
  this.clienteService.getAll()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar clientes';
      }
    });
}
```

---

## 📊 Comparação: localStorage vs HTTP

| Aspecto | localStorage | HTTP |
|---------|--------------|------|
| **Persistência** | Local do navegador | Servidor central |
| **Sincronização** | Não | Sim (entre abas) |
| **Escalabilidade** | Limitada | Ilimitada |
| **Segurança** | Baixa | Alta (com autenticação) |
| **Tempo de carregamento** | Instant | Rede variável |
| **Confiabilidade de dados** | Apenas local | Backup no servidor |

---

## ✅ Checklist de Validação

- [x] Arquivo `environment.ts` criado
- [x] `ClienteService` refatorado
- [x] `BicicletaService` refatorado
- [x] `OrdemServicoService` refatorado
- [x] `PecaService` refatorado
- [x] `ServicoService` refatorado
- [x] `AgendaComponent` refatorado
- [x] `BicicletaManagerComponent` refatorado
- [x] `ClienteManagerComponent` refatorado
- [x] Tratamento de erros implementado
- [x] Estados de loading/error adicionados
- [x] Unsubscribe automático com `takeUntil`
- [x] Documentação criada

---

## 📝 Próximos Passos (Recomendado)

### Para completar a refatoração:

1. **Refatorar outros componentes:**
   - [ ] `ServicoManagerComponent` (se existir)
   - [ ] `EstoqueManagerComponent` (se existir)
   - [ ] `HistoricoBicicletaComponent` (se existir)
   - [ ] Outros componentes que usem localStorage

2. **Implementar autenticação:**
   - [ ] JWT token no header
   - [ ] AuthGuard para proteção de rotas
   - [ ] Refresh token automático

3. **Melhorar tratamento de erros:**
   - [ ] Retry automático para falhas de rede
   - [ ] Queue de requisições offline
   - [ ] Interceptor HTTP centralizado

4. **Testes:**
   - [ ] Testes unitários para services
   - [ ] Testes de integração para componentes
   - [ ] Testes E2E com Cypress

5. **Performance:**
   - [ ] Caching com RxJS operators
   - [ ] Pagination para listas grandes
   - [ ] Lazy loading de dados

---

## 📞 Suporte

Para questões sobre a refatoração:
- Verificar console do navegador (F12) para erros
- Verificar aba Network para requisições HTTP
- Verificar que backend está rodando em http://localhost:8080
- Verificar CORS se houver erro de conexão

---

**Refatoração concluída com sucesso! 🎉**
