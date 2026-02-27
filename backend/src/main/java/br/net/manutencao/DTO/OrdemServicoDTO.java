package br.net.manutencao.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdemServicoDTO {
    private Long id;
    private ClienteDTO cliente;
    
    // NOVO: Múltiplas bicicletas com seus itens aninhados
    private List<BicicletaComItensDTO> bicicletas;
    
    // Mantido para compatibilidade (será preenchido com a primeira bicicleta se houver)
    private BicicletaDTO bicicleta;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataEntrada;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataPrevisaoSaida;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataSaidaReal;
    
    private String observacoes;
    private String status;
    
    // Mantido para compatibilidade (agrupa todos os itens)
    private List<ItemServicoDTO> servicos;
    private List<ItemPecaDTO> pecas;
    
    private BigDecimal valorTotal;
    private boolean exibirAviso30Dias;
}