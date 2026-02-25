package br.net.manutencao.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdemServicoPeca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantidade;
    private BigDecimal valor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordem_servico_id")
    @JsonIgnore
    private OrdemServico ordemServico;

    // NOVO: Vincular à peça de uma bicicleta específica
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bicicleta_id")
    private Bicicleta bicicleta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "peca_id")
    private Peca peca;

    public BigDecimal getValorTotal() {
        return valor.multiply(BigDecimal.valueOf(quantidade));
    }
}