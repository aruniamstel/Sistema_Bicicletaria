package br.net.manutencao.DTO;

import br.net.manutencao.model.Categoria;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitacaoCreateDTO {
    private String description;
    private Categoria categoria;
    private String defeito;
    private Long idCliente;
}
