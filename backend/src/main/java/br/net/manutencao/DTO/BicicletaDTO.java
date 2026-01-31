package br.net.manutencao.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BicicletaDTO {
    private Long id;
    private String marca;
    private String modelo;
    private Integer tamanhoAro;
    private String cor;
    private ClienteDTO cliente;
}