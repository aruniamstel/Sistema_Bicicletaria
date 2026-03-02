package br.net.manutencao.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrdemServicoCreateComplexDTO {
    
    private LocalDateTime dataEntrada;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataPrevisaoSaida;
    
    private String status;
    private String observacoes;
    private Boolean exibirAviso30Dias;
    private ClienteData cliente;

    // ✅ O SEGREDO ESTÁ AQUI:
    // O nome do campo deve ser "bicicletas" para dar match com o seu JSON
    @JsonProperty("bicicletas") 
    private List<BicicletaEntradaData> bicicletas;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BicicletaEntradaData {
        private Long id;
        private String marca;
        private String modelo;
        private String cor;
        private Integer tamanhoAro;
        
        // Itens específicos desta bicicleta
        private List<ServicoSelecionado> servicos;
        private List<PecaSelecionada> pecas;
    }

    @Data
    public static class ClienteData {
        private Long id;
    }

    @Data
    public static class ServicoSelecionado {
        private ServicoData servico;
        private Integer quantidade;
    }

    @Data
    public static class ServicoData {
        private Long id;
    }

    @Data
    public static class PecaSelecionada {
        private PecaData peca;
        private Integer quantidade;
    }

    @Data
    public static class PecaData {
        private Long id;
    }
}