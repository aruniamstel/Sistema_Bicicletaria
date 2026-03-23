# 🏗️ DIAGRAMA DE ARQUITETURA - Implementação 1:N

## 📊 Fluxo Completo (Frontend → Backend → Database)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ordem-form-novo.component.ts                                   │
│  ┌──────────────────────────────────────────────┐              │
│  │ - cliente: Cliente                            │              │
│  │ - bicicletasAdicionadas: BicicletaComItens[] │              │
│  │ - onSubmit()                                 │              │
│  │   └─ criarOrdemServico()                    │              │
│  │      └─ POST /ordens-servico                │              │
│  │         with bicicletas[N]                   │              │
│  └──────────────────────────────────────────────┘              │
│                          ↓                                       │
│                    JSON Payload:                                │
│                 {                                               │
│                   client: { id: 1 },                            │
│                   bicicletas: [                                 │
│                     { id: 1, servicos: [...] },                │
│                     { id: 2, servicos: [...] }                 │
│                   ]                                             │
│                 }                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                         HTTP POST ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  OrdemServicoController.java                                    │
│  ┌──────────────────────────────────────────────┐              │
│  │ @PostMapping("/ordens-servico")              │              │
│  │ criarOrdemServico(Map payload)               │              │
│  │   ├─ Detecta formato:                        │              │
│  │   │  ✓ isMultiplasOrdensBike = true?        │              │
│  │   │  → criarOrdemServicoComMultiplasBikes() │              │
│  │   └─ Retorna 201 Created + DTO               │              │
│  └──────────────────────────────────────────────┘              │
│                          ↓                                       │
│  OrdemServicoService.java                                       │
│  ┌──────────────────────────────────────────────┐              │
│  │ criarOrdemServicoComMultiplasBicicletas()    │              │
│  │   ├─ 1. Validar cliente                     │              │
│  │   ├─ 2. Criar OrdemServico base              │              │
│  │   └─ 3. Para cada bicicleta:                │              │
│  │       │                                      │              │
│  │       ├─ processarBicicletaComItens()       │              │
│  │       │   ├─ Buscar/criar Bicicleta         │              │
│  │       │   ├─ Processar serviços:            │              │
│  │       │   │  └─ processarServicoParaBike() │              │
│  │       │   │     └─ OrdemServicoServico      │              │
│  │       │   │        + bicicletaId ← NOVO!   │              │
│  │       │   └─ Processar peças:               │              │
│  │       │      └─ processarPecaParaBike()    │              │
│  │       │         └─ OrdemServicoPeca         │              │
│  │       │            + bicicletaId ← NOVO!   │              │
│  │       │                                     │              │
│  │   ├─ 4. Calcular valor total               │              │
│  │   ├─ 5. Gerar PDF                           │              │
│  │   └─ 6. Retornar DTO com bicicletas[]      │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                         SQL INSERT ↓
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE (H2 / PostgreSQL)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ordem_servico (1:N)                                            │
│  ┌──────────────────────────────────────┐                      │
│  │ id: 42                                │                      │
│  │ cliente_id: 1                         │                      │
│  │ data_entrada: 2026-02-24 10:30       │                      │
│  │ status: ABERTA                        │                      │
│  │ valor_total: 600.00                  │                      │
│  └──────────────────────────────────────┘                      │
│     ↓          ↓          ↓                                      │
│     │          │          │                                      │
│   bicicleta  servico    peca                                    │
│   (N:1)      (N:1)      (N:1)                                   │
│     ↓          ↓          ↓                                      │
│  ┌─────┐  ┌────────┐  ┌──────┐                                  │
│  │ 1   │  │ 1      │  │ 1    │                                  │
│  │ 2   │  │ 2      │  │ 2    │                                  │
│  │ ... │  │ 3      │  │ 3    │                                  │
│  │     │  │ ...    │  │ ...  │                                  │
│  └─────┘  └────────┘  └──────┘                                  │
│                                                                 │
│  ordem_servico_servico (NOVO)                                  │
│  ┌─────────────────────────────────┐                           │
│  │ id | ordem_id | servico_id |    │                           │
│  │    | bicicleta_id ← NOVO!   │   │ ← Rastreia qual bike!    │
│  ├─────────────────────────────────┤                           │
│  │ 100 │  42    │    1      │  1    │ Serviço da Bike 1       │
│  │ 101 │  42    │    2      │  2    │ Serviço da Bike 2       │
│  │ 102 │  42    │    3      │  1    │ Serviço da Bike 1       │
│  └─────────────────────────────────┘                           │
│                                                                 │
│  ordem_servico_peca (NOVO)                                     │
│  ┌─────────────────────────────────┐                           │
│  │ id | ordem_id | peca_id |       │                           │
│  │    | bicicleta_id ← NOVO! │     │ ← Rastreia qual bike!    │
│  ├─────────────────────────────────┤                           │
│  │ 50  │  42    │    1     │  1    │ Peca da Bike 1          │
│  │ 51  │  42    │    2     │  2    │ Peca da Bike 2          │
│  │ 52  │  42    │    3     │  1    │ Peca da Bike 1          │
│  └─────────────────────────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Processamento (Service Layer)

```
┌─ criarOrdemServicoComMultiplasBicicletas(payload)
│
├─→ 1️⃣ VALIDAÇÃO
│   ├─ cliente.id obrigatório?
│   ├─ BicicletaRepository.findById(id)
│   │  ├─ Encontrada? → Usar
│   │  └─ Não? → Criar nova
│   └─ Salvar OrdemServico base
│
├─→ 2️⃣ LOOP: Para cada bicicleta em bicicletas[]
│   │
│   ├─→ processarBicicletaComItens(ordem, bikeData)
│   │   │
│   │   ├─ Buscar ou criar Bicicleta
│   │   │  ├─ Se bikeData.id → BicicletaRepository.findById()
│   │   │  └─ Se vazio → Criar nova (marca, modelo, cor, aro)
│   │   │
│   │   ├─ Vincular à ordem: ordem.bicicletas.add(bike)
│   │   │
│   │   ├─→ LOOP: Para cada serviço
│   │   │   │
│   │   │   ├─→ processarServicoParaBicicleta()
│   │   │   │   ├─ Buscar Servico
│   │   │   │   ├─ Criar OrdemServicoServico
│   │   │   │   ├─ Vincular:
│   │   │   │   │  ├─ .ordem = ordem
│   │   │   │   │  ├─ .bicicleta = bike ← NOVO!
│   │   │   │   │  ├─ .servico = servico
│   │   │   │   │  └─ .quantidade = qtd
│   │   │   │   ├─ Salvar
│   │   │   │   └─ ordem.servicos.add(osServico)
│   │   │
│   │   ├─→ LOOP: Para cada peça
│   │   │   │
│   │   │   ├─→ processarPecaParaBicicleta()
│   │   │   │   ├─ Buscar Peca
│   │   │   │   ├─ Validar estoque (peca.quantidade >= qtd)
│   │   │   │   ├─ Criar OrdemServicoPeca
│   │   │   │   ├─ Vincular:
│   │   │   │   │  ├─ .ordem = ordem
│   │   │   │   │  ├─ .bicicleta = bike ← NOVO!
│   │   │   │   │  ├─ .peca = peca
│   │   │   │   │  └─ .quantidade = qtd
│   │   │   │   ├─ Salvar
│   │   │   │   ├─ Decrementar estoque
│   │   │   │   └─ ordem.pecas.add(osPeca)
│
├─→ 3️⃣ CÁLCULO
│   └─ atualizarValorTotal(ordem)
│      └─ Somar: servicos.sum() + pecas.sum()
│
├─→ 4️⃣ PERSISTÊNCIA
│   └─ ordemServicoRepository.save(ordem)
│
├─→ 5️⃣ GERAÇÃO
│   └─ gerarPDFOrdem(ordem)
│
└─→ 6️⃣ RETORNO
    └─ getOrdemServicoCompletoById(id)
       └─ Retorna com bicicletas[] inicializadas
```

---

## 🎯 Detecção de Formato (Controller)

```
┌─ criarOrdemServico(payload)
│
├─ Verificação 1: payload.bicicletas instanceof List?
│  ├─ SIM → Múltiplas bicicletas (NOVO)
│  │        isMultiplasOrdensBike = true
│  │        ✓ Chamar criarOrdemServicoComMultiplasBicicletas()
│  │
│  └─ NÃO → Verificação 2
│
├─ Verificação 2: payload.cliente instanceof Map?
│  ├─ SIM → Formato complexo (COMPATÍVEL)
│  │        isComplexFormat = true
│  │        ✓ Chamar criarOrdemServicoCompleta()
│  │
│  └─ NÃO → Verificação 3
│
└─ Verificação 3: payload.clienteId != null?
   ├─ SIM → Formato simples (LEGADO)
   │        isSimpleFormat = true
   │        ✓ Chamar criarOrdemServico()
   │
   └─ NÃO → Erro 400 (Payload inválido)
```

---

## 📊 Antes vs Depois

```
ANTES (1:1)                        DEPOIS (1:N)
═════════════════════════════════════════════════════════

OrdemServico                       OrdemServico
├─ id: 42                          ├─ id: 42
├─ cliente: Cliente 1              ├─ cliente: Cliente 1
├─ bicicleta: Bicicleta 1 ← UMA!  ├─ bicicletas: List ← VÁRIAS!
│                                  │  ├─ Bike 1
│                                  │  ├─ Bike 2
│                                  │  └─ Bike 3
├─ servicos: List                  ├─ servicos: List
│  ├─ Limpeza (qtd: 1)             │  ├─ Limpeza (qtd: 1) 🆕 bicicletaId: 1
│  ├─ Ajuste (qtd: 1)              │  ├─ Ajuste (qtd: 1) 🆕 bicicletaId: 2
│  └─ Reparo (qtd: 2)              │  └─ Reparo (qtd: 2) 🆕 bicicletaId: 1
│                                  │
└─ pecas: List                     └─ pecas: List
   ├─ Pneu (qtd: 1)                  ├─ Pneu (qtd: 1) 🆕 bicicletaId: 1
   ├─ Corrente (qtd: 1)              ├─ Corrente (qtd: 1) 🆕 bicicletaId: 2
   └─ Freio (qtd: 2)                 └─ Freio (qtd: 2) 🆕 bicicletaId: 1

Problema: Não sabe qual item        Solução: Cada item sabe sua bike!
é de qual bike quando há múltiplas
```

---

## 🔗 Relacionamentos JPA

```
┌──────────────────────────┐
│    OrdemServico          │
│  ────────────────────    │
│  - id: Long (PK)         │
│  - cliente_id: Long (FK) │
│  - bicicletas: List ←────┼────┐
│    (1:N)                 │    │
└──────────────────────────┘    │
                                 ├─→ @OneToMany
                                 │   (cascade, orphanRemoval)
                                 │
                      ┌──────────┴─────────────────┐
                      │                            │
              ┌───────────────────┐        ┌───────────────┐
              │    Bicicleta      │        │   ...outras   │
              │ ───────────────── │        │  ...          │
              │ - id: Long (PK)   │        │               │
              │ - marca: String   │        └───────────────┘
              │ - modelo: String  │
              └───────────────────┘
                      ↑
         @ManyToOne (cada item)
                      │
        ┌─────────────┴──────────────┐
        │                            │
┌──────────────────────┐  ┌──────────────────────┐
│ OrdemServicoServico  │  │  OrdemServicoPeca    │
│────────────────────  │  │ ───────────────────  │
│ - id: Long (PK)      │  │ - id: Long (PK)      │
│ - ordem_id: Long (FK)│  │ - ordem_id: Long (FK)│
│ - servico_id: Long   │  │ - peca_id: Long (FK) │
│ - bicicleta_id ←NEW! │  │ - bicicleta_id ←NEW! │
│   (RASTREIA BIKE)    │  │   (RASTREIA BIKE)    │
└──────────────────────┘  └──────────────────────┘
```

---

## 💾 Dados no Banco (Exemplo)

```sql
-- ORDEM
INSERT INTO ordem_servico VALUES 
(42, 1, '2026-02-24', NULL, 'ABERTA', 600.00, 'Cliente com 2 bikes');

-- BICICLETAS (vinculadas a ordem 42)
INSERT INTO ordem_servico_bicicleta VALUES 
(1, 42),  -- Bike 1
(2, 42);  -- Bike 2

-- SERVIÇOS (cada um sabe sua bike)
INSERT INTO ordem_servico_servico VALUES 
(100, 42, 1, 1, 150.00, 1),  -- Limpeza na Bike 1
(101, 42, 2, 1, 80.00, 2);   -- Ajuste na Bike 2
              │   │   │  │
              │   │   │  └─ bicicleta_id ← NOVO!
              │   │   │
              │   └─ ordem_id
              └─ servico_id

-- PEÇAS (cada uma sabe sua bike)
INSERT INTO ordem_servico_peca VALUES 
(50, 42, 1, 85.00, 1, 1),    -- Pneu na Bike 1
(51, 42, 2, 120.00, 1, 2);   -- Corrente na Bike 2
            │  │    │  │
            │  │    │  └─ bicicleta_id ← NOVO!
            │  │    │
            │  └─ quantidade
            └─ peca_id
```

---

## 🎬 Sequência de Requests/Responses

```
CLIENT                    SERVER
  │                        │
  │ 1. POST /ordens-servico│
  │    {bicicletas:[...]}  │
  ├───────────────────────→│
  │                        ├─ Detectar formato
  │                        ├─ Chamar novo método
  │                        ├─ Processar 2 bikes
  │                        ├─ Calcular valor
  │                        ├─ Gerar PDF
  │                        └─ Salvar no DB
  │                        │
  │   201 Created           │
  │   {                     │
  │     id: 42,            │
  │     bicicletas: [..],  │
  │     servicos: [..],    │
  │     pecas: [..]        │
  │   }                     │
  │←───────────────────────┤
  │                        │
  │ 2. GET /ordens-servico/42
  ├───────────────────────→│
  │                        ├─ Carregar ordem
  │                        ├─ Inicializar bicicletas
  │                        ├─ Inicializar itens
  │                        └─ Retornar DTO
  │                        │
  │   200 OK               │
  │   { ordem completa... }│
  │←───────────────────────┤
  │                        │
  │ 3. GET /ordens-servico │
  ├───────────────────────→│
  │                        ├─ Listar todas
  │                        └─ Retornar DTOs
  │                        │
  │   200 OK               │
  │   [ordem1, ordem2,...] │
  │←───────────────────────┤
```

---

## 📈 Logs do Backend (Esperado)

```
🚀 Detectado formato com MÚLTIPLAS BICICLETAS
🔧 Iniciando criação de ordem com múltiplas bicicletas...
✅ Ordem #42 criada
🚲 Processando 2 bicicleta(s)...
  ✓ Bicicleta existente encontrada: Caloi Mountain Bike Elite
  ✓ Serviço adicionado: Limpeza e Lubrificação (x1)
  ✓ Peça adicionada: Pneu Dianteiro (x1)
  ✓ Bicicleta existente encontrada: Sense Road Bike
  ✓ Serviço adicionado: Ajuste de Câmbio (x1)
  ✓ Peça adicionada: Corrente (x1)
💰 Valor total calculado: 600.00
✅ Ordem #42 criada com sucesso!
```

---

## 🎨 Arquitetura de Camadas

```
┌─────────────────────────────────────────────┐
│           APRESENTAÇÃO (Web Browser)        │
│  ┌────────────────────────────────────────┐ │
│  │  ordem-form-novo.component.html        │ │
│  │  (formulário com múltiplas bikes)      │ │
│  └────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────┘
               │ JSON (POST)
┌──────────────▼──────────────────────────────┐
│          APLICAÇÃO (API)                    │
│  ┌────────────────────────────────────────┐ │
│  │  OrdemServicoController                │ │
│  │  (rota: POST /ordens-servico)         │ │
│  │  (detecta formato automaticamente)     │ │
│  └────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────┘
               │ Método Service
┌──────────────▼──────────────────────────────┐
│        LÓGICA DE NEGÓCIO (Service)          │
│  ┌────────────────────────────────────────┐ │
│  │  OrdemServicoService                   │ │
│  │  - criarOrdemServicoComMultiplasBikes()│ │
│  │  - processarBicicletaComItens()        │ │
│  │  - processarServicoParaBicicleta()     │ │
│  │  - processarPecaParaBicicleta()        │ │
│  └────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────┘
               │ SQL (JPA/Hibernate)
┌──────────────▼──────────────────────────────┐
│        PERSISTÊNCIA (Database)              │
│  ┌────────────────────────────────────────┐ │
│  │  ordem_servico (1:N bicicletas)       │ │
│  │  ordem_servico_servico (N:M)          │ │
│  │  ordem_servico_peca (N:M)             │ │
│  │  ↓ Com bicicletaId (rastreamento!)    │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

**Diagrama de Arquitetura - Implementação 1:N**
**Data: 24 de Fevereiro de 2026**
