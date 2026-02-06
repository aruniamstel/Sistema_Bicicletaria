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
    
    // Dados básicos da ordem
    @JsonProperty("dataEntrada")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataEntrada;
    
    @JsonProperty("dataPrevisaoSaida")
    private String dataPrevisaoSaida; // Pode ser string ou LocalDateTime
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("observacoes")
    private String observacoes;
    
    @JsonProperty("exibirAviso30Dias")
    private Boolean exibirAviso30Dias;
    
    // Cliente (objeto completo)
    @JsonProperty("cliente")
    private ClienteData cliente;
    
    // Bicicleta (objeto completo)
    @JsonProperty("bicicleta")
    private BicicletaData bicicleta;
    
    // Serviços selecionados
    @JsonProperty("servicos")
    private List<ServicoSelecionado> servicos;
    
    // Peças selecionadas
    @JsonProperty("pecas")
    private List<PecaSelecionada> pecas;
    
    // Classe interna para dados do cliente
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ClienteData {
        private Long id;
        private String nome;
        private String telefone;
        private String endereco;
        private String instagram;
    }
    
    // Classe interna para dados da bicicleta
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BicicletaData {
        private Long id;
        private String marca;
        private String modelo;
        private Integer tamanhoAro;
        private String cor;
    }
    
    // Classe interna para serviço selecionado
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ServicoSelecionado {
        private ServicoData servico;
        private Integer quantidade;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class ServicoData {
            private Long id;
            private String descricao;
            private Object valor; // Pode ser Double ou BigDecimal
        }
    }
    
    // Classe interna para peça selecionada
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PecaSelecionada {
        private PecaData peca;
        private Integer quantidade;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class PecaData {
            private Long id;
            private String descricao;
            private Object valor; // Pode ser Double ou BigDecimal
            private Integer quantidade;
        }
    }
}
