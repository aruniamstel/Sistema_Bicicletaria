package br.net.manutencao.controller;

import br.net.manutencao.service.ExportarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/exportar")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ExportarController {

    @Autowired
    private ExportarService exportarService;

    /**
     * Exporta dados em CSV de diferentes entidades
     * Aceita: clientes, bicicletas, pecas, ordens
     */
    @GetMapping("/{entidade}")
    public ResponseEntity<?> exportarCSV(@PathVariable String entidade) {
        try {
            String csvData;
            String nomeArquivo;

            switch (entidade.toLowerCase()) {
                case "clientes":
                    csvData = exportarService.gerarClientesCSV();
                    nomeArquivo = "clientes.csv";
                    break;
                case "bicicletas":
                    csvData = exportarService.gerarBicicletasCSV();
                    nomeArquivo = "bicicletas.csv";
                    break;
                case "pecas":
                    csvData = exportarService.gerarPecasCSV();
                    nomeArquivo = "pecas.csv";
                    break;
                case "ordens":
                    csvData = exportarService.gerarOrdensServicoCSV();
                    nomeArquivo = "ordens_servico.csv";
                    break;
                default:
                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "error", "Entidade inválida",
                                    "mensagem", "Entidades válidas: clientes, bicicletas, pecas, ordens"
                            ));
            }

            if (csvData.isEmpty() || csvData.equals("")) {
                return ResponseEntity.noContent().build();
            }

            // Configurar headers para forçar download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
            headers.setContentDispositionFormData("attachment", nomeArquivo);
            headers.add("Content-Length", String.valueOf(csvData.getBytes(StandardCharsets.UTF_8).length));

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvData);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Erro ao gerar relatório",
                            "mensagem", e.getMessage()
                    ));
        }
    }

    /**
     * Endpoint de health check para exportação
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "OK", "servico", "Exportação CSV"));
    }
}
