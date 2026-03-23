# ✅ Arquitetura JPA Corrigida - Mapeamento Linear sem Dependências Circulares

## 📋 Estrutura Hierárquica Definitiva

```
OrdemServico (1)
    ├── FK: cliente_id
    └── (1:N) ─── BicicletaComItens (N)
                    ├── FK: ordem_id
                    ├── (1:N) ─── ItemServico (N)
                    │              └── FK: bicicleta_item_id
                    │
                    └── (1:N) ─── ItemPeca (N)
                                  └── FK: bicicleta_item_id
```

## 🔑 Regras Técnicas Implementadas

### 1. **Sem Dependência Circular**
- ❌ `OrdemServico` NÃO possui `servicos` e `pecas` diretos com `@JoinColumn(name = "ordem_id")`
- ✅ `OrdemServico` acessa `servicos` e `pecas` APENAS via `BicicletaComItens`

### 2. **Mapeamento Bidirecional Correto**
- `@JsonManagedReference` nas listas (lado "one")
- `@JsonBackReference` nos campos `@ManyToOne` (lado "many")
- Nomes explícitos para evitar conflitos:
  ```java
  @JsonManagedReference("ordem-bicicletas")
  @JsonBackReference("ordem-bicicletas")
  
  @JsonManagedReference("bicicleta-servicos")
  @JsonBackReference("bicicleta-servicos")
  
  @JsonManagedReference("bicicleta-pecas")
  @JsonBackReference("bicicleta-pecas")
  ```

### 3. **Cascade Correto**
```java
cascade = CascadeType.ALL  // Salva/atualiza/deleta em cascata
orphanRemoval = true       // Remove órfãos automaticamente
fetch = FetchType.LAZY     // Carregamento sob demanda
```

### 4. **Construtores Vazios Obrigatórios**
- Todas as classes utilizam `@NoArgsConstructor` do Lombok
- JPA necessita disso para desserialização

## 📁 Classes Envolvidas

### `OrdemServico.java`
```java
@OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
@JsonManagedReference("ordem-bicicletas")
private List<BicicletaComItens> bicicletasComItens = new ArrayList<>();
```

**Mudanças:**
- ❌ Removidas: `servicos` e `pecas` com `@JoinColumn(name = "ordem_id")`
- ✅ Mantida: Lista `bicicletasComItens` com relacionamento bidirecional limpo

### `BicicletaComItens.java`
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "ordem_id")
@JsonBackReference("ordem-bicicletas")
private OrdemServico ordemServico;

@OneToMany(mappedBy = "bicicletaItem", cascade = CascadeType.ALL, orphanRemoval = true)
@JsonManagedReference("bicicleta-servicos")
private List<ItemServico> servicos = new ArrayList<>();

@OneToMany(mappedBy = "bicicletaItem", cascade = CascadeType.ALL, orphanRemoval = true)
@JsonManagedReference("bicicleta-pecas")
private List<ItemPeca> pecas = new ArrayList<>();
```

**Mudanças:**
- ✅ Referencia `OrdemServico` via FK `ordem_id`
- ✅ Listas de `ItemServico` e `ItemPeca` mapeadas corretamente
- ❌ Removidas referencias diretas a `OrdemServicoServico` e `OrdemServicoPeca`

### `ItemServico.java` (NOVA - antes: `OrdemServicoServico`)
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "bicicleta_item_id")
@JsonBackReference("bicicleta-servicos")
private BicicletaComItens bicicletaItem;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "servico_id")
private Servico servico;
```

**Características:**
- ❌ NÃO possui FK para `OrdemServico`
- ✅ Vinculado APENAS via `BicicletaComItens`
- ✅ FK para `Servico` (referência para dados do serviço)

### `ItemPeca.java` (NOVA - antes: `OrdemServicoPeca`)
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "bicicleta_item_id")
@JsonBackReference("bicicleta-pecas")
private BicicletaComItens bicicletaItem;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "peca_id")
private Peca peca;
```

**Características:**
- ❌ NÃO possui FK para `OrdemServico`
- ✅ Vinculado APENAS via `BicicletaComItens`
- ✅ FK para `Peca` (referência para dados da peça)

## 🔗 Vínculo Manual em Cascata (OrdemServicoService)

```java
@Transactional
public OrdemServico criarOrdemComBicicletas(OrdemServico ordem) {
    // 1. Salvar a ordem
    OrdemServico ordemSalva = ordemServicoRepository.save(ordem);

    // 2. Vincular bicicletas à ordem
    for (BicicletaComItens bicicleta : ordem.getBicicletasComItens()) {
        bicicleta.setOrdemServico(ordemSalva);  // ✅ FK definida
        BicicletaComItens bicicletaSalva = bicicletaComItensRepository.save(bicicleta);

        // 3. Vincular serviços à bicicleta
        for (ItemServico servico : bicicleta.getServicos()) {
            servico.setBicicletaItem(bicicletaSalva);  // ✅ FK definida
            itemServicoRepository.save(servico);
        }

        // 4. Vincular peças à bicicleta
        for (ItemPeca peca : bicicleta.getPecas()) {
            peca.setBicicletaItem(bicicletaSalva);  // ✅ FK definida
            itemPecaRepository.save(peca);
        }
    }

    // 5. Calcular e atualizar valor total
    ordemSalva.calcularValorTotal();
    return ordemServicoRepository.save(ordemSalva);
}
```

## 📊 Exemplo de Payload JSON

```json
{
  "cliente": {
    "id": 1
  },
  "observacoes": "Manutenção completa",
  "dataPrevisaoSaida": "2026-03-15T10:00:00",
  "bicicletas": [
    {
      "marca": "Caloi",
      "modelo": "Mountain Bike",
      "cor": "Vermelha",
      "tamanhoAro": 26,
      "servicos": [
        {
          "servico": { "id": 1 },
          "quantidade": 1
        }
      ],
      "pecas": [
        {
          "peca": { "id": 1 },
          "quantidade": 2
        }
      ]
    }
  ]
}
```

## ✅ Vantagens da Nova Arquitetura

1. **Sem Dependência Circular**
   - Não há relacionamento direto entre `OrdemServico` e `ItemServico`/`ItemPeca`
   - Evita `IllegalStateException` do JPA

2. **Modelagem Semântica Correta**
   - `ItemServico` e `ItemPeca` pertencem a uma bicicleta específica na ordem
   - Não a ordem genérica

3. **Flexibilidade 1:N**
   - Suporta múltiplas bicicletas por ordem
   - Cada bicicleta tem seus próprios serviços e peças

4. **Integridade de Dados**
   - Cascade remove itens órfãos automaticamente
   - FK garante consistência referencial

5. **Performance**
   - LAZY loading evita N+1 queries
   - Índices em FK otimizam buscas

## 🔄 Migration Script (Flyway/Liquibase)

```sql
-- Renomear tabelas
ALTER TABLE ordem_servico_servico RENAME TO item_servico;
ALTER TABLE ordem_servico_peca RENAME TO item_peca;

-- Remover FKs de ordem_id (não devem existir em item_servico/item_peca)
ALTER TABLE item_servico DROP CONSTRAINT fk_item_servico_ordem;
ALTER TABLE item_peca DROP CONSTRAINT fk_item_peca_ordem;

-- Garantir FKs para bicicleta_item_id (já devem existir)
ALTER TABLE item_servico ADD CONSTRAINT fk_item_servico_bike FOREIGN KEY (bicicleta_item_id) REFERENCES bicicletas_com_itens(id);
ALTER TABLE item_peca ADD CONSTRAINT fk_item_peca_bike FOREIGN KEY (bicicleta_item_id) REFERENCES bicicletas_com_itens(id);
```

## 🧪 Teste de Integração

```java
@Test
@Transactional
public void testCriarOrdemComMultiplasBicicletas() {
    // Arrange
    OrdemServico ordem = new OrdemServico();
    ordem.setCliente(cliente);
    
    BicicletaComItens bike1 = new BicicletaComItens();
    bike1.setMarca("Caloi");
    bike1.setModelo("Mountain");
    
    ItemServico servico = new ItemServico();
    servico.setServico(servicoRepository.findById(1L).get());
    servico.setQuantidade(1);
    bike1.getServicos().add(servico);
    
    ordem.getBicicletasComItens().add(bike1);
    
    // Act
    OrdemServico resultado = ordemServicoService.criarOrdemComBicicletas(ordem);
    
    // Assert
    assertNotNull(resultado.getId());
    assertEquals(1, resultado.getBicicletasComItens().size());
    assertEquals(1, resultado.getBicicletasComItens().get(0).getServicos().size());
}
```

---

**Status:** ✅ Implementado
**Última Atualização:** Fev 26, 2026
