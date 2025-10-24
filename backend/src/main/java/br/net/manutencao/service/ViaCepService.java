package br.net.manutencao.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import br.net.manutencao.ViaCepResponse;

@Service
public class ViaCepService {

    public String buscarEnderecoPorCEP(String cep) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://viacep.com.br/ws/" + cep + "/json/";
        ViaCepResponse response = restTemplate.getForObject(url, ViaCepResponse.class);
        
        if (response != null && response.getErro() == null) {
            return response.getLogradouro() + ", " + response.getBairro() + ", " +
                   response.getLocalidade() + " - " + response.getUf();
        }
        throw new RuntimeException("CEP inválido ou não encontrado.");
    }
}
