package br.net.manutencao;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ViaCepResponse {
    private String logradouro;
    private String bairro;
    private String localidade;
    private String uf;
    private Boolean erro;
}

