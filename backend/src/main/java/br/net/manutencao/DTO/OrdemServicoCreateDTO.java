package br.net.manutencao.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdemServicoCreateDTO {
    private Long clienteId;
    private Long bicicletaId;
    private LocalDateTime dataPrevisaoSaida;
    private String observacoes;
}
