package br.net.manutencao.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * DTO para representar uma Bicicleta com seus Serviços e Peças aninhados
 * dentro de uma Ordem de Serviço
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BicicletaComItensDTO {
    private Long id;
    private String marca;
    private String modelo;
    private String cor;
    private Integer tamanhoAro;
    
    // Serviços específicos desta bicicleta
    private List<OrdemServicoServicoDTO> servicos;
    
    // Peças específicas desta bicicleta
    private List<OrdemServicoPecaDTO> pecas;
}
