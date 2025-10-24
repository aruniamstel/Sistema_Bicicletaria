package br.net.manutencao.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaListDTO {
    private Long id;
    private String nome;

    public CategoriaListDTO(String nome) {
        this.nome = nome;
    }
}
