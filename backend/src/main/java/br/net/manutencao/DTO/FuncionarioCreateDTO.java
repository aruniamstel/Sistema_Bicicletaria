package br.net.manutencao.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuncionarioCreateDTO {

    private String nome;
    private String email;
    private String dataNasc;
    private String senha;

}
