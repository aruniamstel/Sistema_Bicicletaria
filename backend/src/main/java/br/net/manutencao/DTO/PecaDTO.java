package br.net.manutencao.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PecaDTO {
    private Long id;
    private String descricao;
    private BigDecimal valor;
    private Integer quantidade;
}