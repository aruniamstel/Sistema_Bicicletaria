package br.net.manutencao.controller;

import br.net.manutencao.service.ExportarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/exportar")
public class ExportarController {

    @Autowired
    private ExportarService exportarService;

    /**
     * Exporta dados em CSV de diferentes entidades
     * Aceita: clientes, bicicletas, pecas, ordens
     * 
     * @param entidade: clientes, bicicletas, pecas ou ordens
     * @return CSV com dados da entidade especificada
     */
    @GetMapping("/{entidade}")
    public ResponseEntity<String> exportarCSV(@PathVariable(name = "entidade") String entidade) {
        // Validação inicial
        if (entidade == null || entidade.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Entidade não pode estar vazia");
        }

        try {
            String csvData;
            String nomeArquivo;

            switch (entidade.toLowerCase().trim()) {
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
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Entidade inválida. Válidas: clientes, bicicletas, pecas, ordens");
            }

            if (csvData == null || csvData.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .build();
            }

            // Configurar headers para forçar download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
            headers.setContentDispositionFormData("attachment", nomeArquivo);
            headers.add("Content-Length", String.valueOf(csvData.getBytes(StandardCharsets.UTF_8).length));

            return new ResponseEntity<>(csvData, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao gerar relatório: " + e.getMessage());
        }
    }

    /**
     * Importa dados em CSV para diferentes entidades
     * 
     * @param entidade: clientes, bicicletas, pecas ou servicos
     * @param file: arquivo CSV com os dados a importar
     * @return 200 OK com mensagem de sucesso ou 400 Bad Request com detalhamento do erro
     */
    @PostMapping("/importar/{entidade}")
    public ResponseEntity<?> importarCSV(
            @PathVariable(name = "entidade") String entidade,
            @RequestParam("file") MultipartFile file) {
        
        if (entidade == null || entidade.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", "Entidade não pode estar vazia"));
        }

        try {
            String resultado = exportarService.importarCSV(entidade, file);
            return ResponseEntity.ok(Map.of(
                    "sucesso", true,
                    "mensagem", resultado
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "erro", true,
                            "mensagem", e.getMessage()
                    ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "erro", true,
                            "mensagem", "Erro interno ao processar importação: " + e.getMessage()
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
