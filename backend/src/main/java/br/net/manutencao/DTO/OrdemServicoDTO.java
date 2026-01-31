package br.net.manutencao.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdemServicoDTO {
    private Long id;
    private ClienteDTO cliente;
    private BicicletaDTO bicicleta;
    private LocalDateTime dataEntrada;
    private LocalDateTime dataPrevisaoSaida;
    private LocalDateTime dataSaidaReal;
    private String observacoes;
    private String status;
    private List<OrdemServicoServicoDTO> servicos;
    private List<OrdemServicoPecaDTO> pecas;
    private BigDecimal valorTotal;
    private boolean exibirAviso30Dias;
}