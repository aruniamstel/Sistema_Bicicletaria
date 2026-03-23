# 📦 Modelos de Dados Esperados - API HTTP

Este arquivo documenta os modelos de dados (DTOs) esperados pelo backend.

---

## Cliente

### GET /clientes - Response
```json
{
  "id": 1,
  "nome": "João Silva",
  "telefone": "(11) 98765-4321",
  "endereco": "Rua das Flores, 123",
  "instagram": "@joaosilva"
}
```

### POST /clientes - Request
```json
{
  "nome": "Maria Santos",
  "telefone": "(11) 91234-5678",
  "endereco": "Av. Principal, 456",
  "instagram": "@mariasantos"
}
```

### PUT /clientes/{id} - Request
```json
{
  "nome": "Maria Santos Silva",
  "telefone": "(11) 98888-9999",
  "endereco": "Av. Principal, 789",
  "instagram": "@maria.silva"
}
```

---

## Bicicleta

### GET /bicicletas - Response
```json
{
  "id": 1,
  "marca": "Caloi",
  "modelo": "Elite",
  "tamanhoAro": 29,
  "cor": "Vermelha",
  "cliente": {
    "id": 1,
    "nome": "João Silva",
    "telefone": "(11) 98765-4321",
    "endereco": "Rua das Flores, 123"
  }
}
```

### POST /bicicletas - Request
```json
{
  "marca": "Caloi",
  "modelo": "Elite",
  "tamanhoAro": 29,
  "cor": "Vermelha",
  "cliente": {
    "id": 1,
    "nome": "João Silva",
    "telefone": "(11) 98765-4321",
    "endereco": "Rua das Flores, 123"
  }
}
```

### GET /bicicletas/cliente/{clienteId} - Response
```json
[
  {
    "id": 1,
    "marca": "Caloi",
    "modelo": "Elite",
    "tamanhoAro": 29,
    "cor": "Vermelha",
    "cliente": { ... }
  },
  {
    "id": 2,
    "marca": "Monark",
    "modelo": "Mountain",
    "tamanhoAro": 26,
    "cor": "Azul",
    "cliente": { ... }
  }
]
```

---

## Peça

### GET /pecas - Response
```json
{
  "id": 1,
  "descricao": "Pneu 29 polegadas",
  "valor": 150.00,
  "quantidade": 10
}
```

### POST /pecas - Request
```json
{
  "descricao": "Corrente Shimano",
  "valor": 85.50,
  "quantidade": 5
}
```

---

## Serviço

### GET /servicos - Response
```json
{
  "id": 1,
  "descricao": "Revisão Completa",
  "valor": 120.00
}
```

### POST /servicos - Request
```json
{
  "descricao": "Ajuste de Câmbio",
  "valor": 45.00
}
```

---

## Ordem de Serviço

### GET /ordens-servico - Response
```json
{
  "id": 1,
  "cliente": {
    "id": 1,
    "nome": "João Silva",
    "telefone": "(11) 98765-4321",
    "endereco": "Rua das Flores, 123"
  },
  "bicicleta": {
    "id": 1,
    "marca": "Caloi",
    "modelo": "Elite",
    "tamanhoAro": 29,
    "cor": "Vermelha",
    "cliente": { ... }
  },
  "dataEntrada": "2025-02-01T10:30:00Z",
  "dataPrevisaoSaida": "2025-02-04T18:00:00Z",
  "dataSaidaReal": null,
  "status": "EM_ANDAMENTO",
  "observacoes": "Trocar pneu e freio",
  "servicos": [
    {
      "servico": {
        "id": 1,
        "descricao": "Revisão Completa",
        "valor": 120.00
      },
      "quantidade": 1,
      "valor": 120.00
    }
  ],
  "pecas": [
    {
      "peca": {
        "id": 1,
        "descricao": "Pneu 29 polegadas",
        "valor": 150.00,
        "quantidade": 10
      },
      "quantidade": 1,
      "valor": 150.00
    }
  ],
  "valorTotal": 270.00
}
```

### POST /ordens-servico - Request
```json
{
  "clienteId": 1,
  "bicicletaId": 1,
  "dataPrevisaoSaida": "2025-02-04T18:00:00Z",
  "observacoes": "Trocar pneu e freio"
}
```

### POST /ordens-servico/{id}/servicos - Request
```json
{
  "itemId": 1,
  "quantidade": 1
}
```

### POST /ordens-servico/{id}/pecas - Request
```json
{
  "itemId": 1,
  "quantidade": 1
}
```

### PUT /ordens-servico/{id}/status - Request
```json
{
  "status": "CONCLUIDA"
}
```

Valores válidos para status:
- `ABERTA`
- `EM_ANDAMENTO`
- `CONCLUIDA`
- `ENTREGUE`

---

## Respostas Padrão de Sucesso

### CREATE (201 Created)
```json
{
  "message": "Recurso criado com sucesso!",
  "id": 1,
  "recurso": { ... }
}
```

### UPDATE (200 OK)
```json
{
  "message": "Recurso atualizado com sucesso!",
  "recurso": { ... }
}
```

### DELETE (200 OK)
```json
{
  "message": "Recurso deletado com sucesso!"
}
```

### GET (200 OK)
```json
[
  { ... },
  { ... }
]
```

---

## Respostas Padrão de Erro

### 400 Bad Request
```json
{
  "error": "Requisição inválida",
  "message": "Campo obrigatório: nome"
}
```

### 404 Not Found
```json
{
  "error": "Recurso não encontrado",
  "message": "Cliente com ID 999 não existe"
}
```

### 409 Conflict
```json
{
  "error": "Conflito de dados",
  "message": "Cliente com este telefone já existe"
}
```

### 500 Internal Server Error
```json
{
  "error": "Erro no servidor",
  "message": "Erro ao processar requisição"
}
```

---

## TypeScript Interfaces

### Cliente
```typescript
export interface Cliente {
  id?: number;
  nome: string;
  telefone: string;
  endereco: string;
  instagram?: string;
}
```

### Bicicleta
```typescript
export interface Bicicleta {
  id?: number;
  marca: string;
  modelo: string;
  tamanhoAro: number;
  cor: string;
  cliente: Cliente;
}
```

### Peça
```typescript
export interface Peca {
  id?: number;
  descricao: string;
  valor: number;
  quantidade: number;
}
```

### Serviço
```typescript
export interface Servico {
  id?: number;
  descricao: string;
  valor: number;
}
```

### OrdemServico
```typescript
export interface OrdemServico {
  id?: number;
  cliente: Cliente;
  bicicleta: Bicicleta;
  dataEntrada: string; // ISO 8601
  dataPrevisaoSaida: string;
  dataSaidaReal?: string;
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE';
  observacoes?: string;
  servicos?: Array<{
    servico: Servico;
    quantidade: number;
    valor: number;
  }>;
  pecas?: Array<{
    peca: Peca;
    quantidade: number;
    valor: number;
  }>;
  valorTotal: number;
}
```

---

## Validações Esperadas do Backend

### Cliente
- `nome`: Obrigatório, mínimo 3 caracteres
- `telefone`: Formato válido (11 dígitos)
- `endereco`: Obrigatório
- `instagram`: Opcional

### Bicicleta
- `marca`: Obrigatório
- `modelo`: Obrigatório
- `tamanhoAro`: Número entre 12 e 29
- `cor`: Obrigatório
- `cliente`: Obrigatório e deve existir

### Peça
- `descricao`: Obrigatório
- `valor`: Número positivo
- `quantidade`: Número inteiro positivo

### Serviço
- `descricao`: Obrigatório
- `valor`: Número positivo

### OrdemServico
- `cliente`: Obrigatório e deve existir
- `bicicleta`: Obrigatório e deve existir
- `status`: Um dos valores válidos
- `dataPrevisaoSaida`: Data válida

---

## Exemplo de Requisição Completa

### Frontend (TypeScript)
```typescript
const novaOrdem = {
  clienteId: 1,
  bicicletaId: 1,
  dataPrevisaoSaida: '2025-02-04T18:00:00Z',
  observacoes: 'Trocar pneu e freio'
};

this.ordemServicoService.create(novaOrdem)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (response) => {
      console.log('✅ Ordem criada:', response);
      // response.ordem contém os dados da ordem criada
    },
    error: (error) => {
      console.error('❌ Erro:', error);
    }
  });
```

### Backend (HTTP)
```
POST http://localhost:8080/ordens-servico

Request Body:
{
  "clienteId": 1,
  "bicicletaId": 1,
  "dataPrevisaoSaida": "2025-02-04T18:00:00Z",
  "observacoes": "Trocar pneu e freio"
}

Response (201 Created):
{
  "message": "Ordem de serviço criada com sucesso!",
  "id": "1",
  "ordem": {
    "id": 1,
    "cliente": { ... },
    "bicicleta": { ... },
    "dataEntrada": "2025-02-01T10:30:00Z",
    "dataPrevisaoSaida": "2025-02-04T18:00:00Z",
    "status": "ABERTA",
    "observacoes": "Trocar pneu e freio",
    "servicos": [],
    "pecas": [],
    "valorTotal": 0
  }
}
```

---

## Campos de Data

Todas as datas são enviadas em formato ISO 8601 (UTC):
```
2025-02-01T10:30:00Z
```

No TypeScript, converter assim:
```typescript
const data = new Date().toISOString();
// Resultado: "2025-02-01T14:35:22.123Z"

// Para exibir
const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
// Resultado: "01/02/2025"
```

---

## Tratamento de Datas

### Enviar para Backend
```typescript
const dataPrevisao = new Date('2025-02-04');
const dataIso = dataPrevisao.toISOString();
// "2025-02-04T00:00:00.000Z"
```

### Receber do Backend
```typescript
const dataIso = "2025-02-01T10:30:00Z";
const data = new Date(dataIso);
const dataFormatada = data.toLocaleDateString('pt-BR');
// "01/02/2025"
```

---

## Notas Importantes

1. **IDs do banco:** Serão números inteiros (Long)
2. **Valores monetários:** Usar BigDecimal no backend, number no frontend
3. **Datas:** Sempre em UTC (Z no final)
4. **Status:** Sempre em SNAKE_CASE
5. **Telefone:** Validar formato (11 dígitos)
6. **Relacionamentos:** Cliente e Bicicleta são objetos completos (não apenas IDs)

---

**Documentação de Modelos Completa! 📊**
