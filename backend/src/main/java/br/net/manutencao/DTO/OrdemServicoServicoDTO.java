package br.net.manutencao.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdemServicoServicoDTO {
    private Long id;
    private ServicoDTO servico;
    private Integer quantidade;
    private BigDecimal valor;
    
    // NOVO: Referência à bicicleta a qual este serviço pertence
    private Long bicicletaId;
    
    public BigDecimal getValorTotal() {
        if (valor == null || quantidade == null) {
            return BigDecimal.ZERO;
        }
        return valor.multiply(BigDecimal.valueOf(quantidade));
    }
}