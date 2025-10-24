package br.net.manutencao.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuncionarioListDTO {
    private Long id;
    private String email;
    private String nome;
    private String dataNasc;

}
