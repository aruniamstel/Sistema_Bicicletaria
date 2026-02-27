package br.net.manutencao.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "item_servico")
public class ItemServico {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantidade;
    private BigDecimal valor;

    // Descrição do serviço (nome, tipo, etc.)
    private String descricao;

    // Vínculo obrigatório com BicicletaComItens (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bicicleta_item_id")
    @JsonBackReference("bicicleta-servicos")
    private BicicletaComItens bicicletaItem;

    // Vínculo opcional com Serviço (tabela de referência)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id")
    private Servico servico;

    public BigDecimal getValorTotal() {
        if (valor == null || quantidade == null) return BigDecimal.ZERO;
        return valor.multiply(BigDecimal.valueOf(quantidade));
    }
}
