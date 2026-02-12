package br.net.manutencao.controller;

import br.net.manutencao.DTO.OrdemServicoCreateDTO;
import br.net.manutencao.DTO.OrdemServicoCreateComplexDTO;
import br.net.manutencao.DTO.OrdemServicoDTO;
import br.net.manutencao.DTO.OrdemServicoMapper;
import br.net.manutencao.DTO.AdicionarServicoPecaDTO;
import br.net.manutencao.model.OrdemServico;
import br.net.manutencao.model.StatusOrdem;
import br.net.manutencao.service.OrdemServicoService;
import br.net.manutencao.service.PDFService;
import br.net.manutencao.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ordens-servico")
public class OrdemServicoController {

    @Autowired
    private OrdemServicoService ordemServicoService;

    @Autowired
    private PDFService pdfService;

    @Autowired
    private OrdemServicoMapper mapper;

    @Autowired
    private ObjectMapper objectMapper;

    // Endpoint para listar todas as ordens de serviço
    @GetMapping
    public ResponseEntity<List<OrdemServicoDTO>> listarTodasOrdens() {
        List<OrdemServico> ordens = ordemServicoService.listarTodasOrdens();
        if (ordens.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(mapper.toDTOList(ordens));
    }

    // Endpoint para listar ordens por cliente
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<OrdemServicoDTO>> listarOrdensPorCliente(@PathVariable Long clienteId) {
        List<OrdemServico> ordens = ordemServicoService.listarOrdensPorCliente(clienteId);
        if (ordens.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(mapper.toDTOList(ordens));
    }

    // Endpoint para listar ordens por bicicleta
    @GetMapping("/bicicleta/{bicicletaId}")
    public ResponseEntity<List<OrdemServicoDTO>> listarOrdensPorBicicleta(@PathVariable Long bicicletaId) {
        List<OrdemServico> ordens = ordemServicoService.listarOrdensPorBicicleta(bicicletaId);
        if (ordens.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(mapper.toDTOList(ordens));
    }

    // Endpoint para listar ordens por status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrdemServicoDTO>> listarOrdensPorStatus(@PathVariable StatusOrdem status) {
        List<OrdemServico> ordens = ordemServicoService.listarOrdensPorStatus(status);
        if (ordens.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(mapper.toDTOList(ordens));
    }

    // Endpoint para buscar ordem específica
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrdemServico(@PathVariable Long id) {
        try {
            OrdemServico ordemServico = ordemServicoService.getOrdemServicoById(id);
            return ResponseEntity.ok(mapper.toDTO(ordemServico));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body("Ordem de serviço não encontrada.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro no servidor. Tente novamente mais tarde.");
        }
    }

    // Endpoint para criar nova ordem de serviço
    @PostMapping
    public ResponseEntity<?> criarOrdemServico(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Detectar qual formato baseado na presença de campos
            boolean isComplexFormat = payload.containsKey("cliente") && payload.get("cliente") instanceof Map;
            boolean isSimpleFormat = payload.containsKey("clienteId") && payload.get("clienteId") != null;
            
            if (!isComplexFormat && !isSimpleFormat) {
                response.put("error", "Payload inválido");
                response.put("details", "Deve conter 'cliente' (objeto) ou 'clienteId' (número)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            try {
                if (isComplexFormat) {
                    System.out.println("✅ Detectado formato complexo (cliente como objeto)");
                    OrdemServicoCreateComplexDTO ordemDTO = objectMapper.convertValue(payload, OrdemServicoCreateComplexDTO.class);
                    OrdemServico ordemCriada = ordemServicoService.criarOrdemServicoCompleta(ordemDTO);
                    response.put("message", "Ordem de serviço criada com sucesso!");
                    response.put("id", ordemCriada.getId().toString());
                    response.put("ordem", mapper.toDTO(ordemCriada));
                    return ResponseEntity.status(HttpStatus.CREATED).body(response);
                } else {
                    System.out.println("✅ Detectado formato simples (clienteId como número)");
                    OrdemServicoCreateDTO ordemDTO = objectMapper.convertValue(payload, OrdemServicoCreateDTO.class);
                    OrdemServico ordemCriada = ordemServicoService.criarOrdemServico(ordemDTO);
                    response.put("message", "Ordem de serviço criada com sucesso!");
                    response.put("id", ordemCriada.getId().toString());
                    response.put("ordem", mapper.toDTO(ordemCriada));
                    return ResponseEntity.status(HttpStatus.CREATED).body(response);
                }
            } catch (IllegalArgumentException e) {
                System.err.println("❌ Erro de validação: " + e.getMessage());
                response.put("error", "Dados inválidos");
                response.put("details", e.getMessage());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            } catch (Exception e) {
                System.err.println("❌ Erro ao desserializar: " + e.getMessage());
                response.put("error", "Erro ao processar payload");
                response.put("details", e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (ResourceNotFoundException e) {
            System.err.println("❌ Recurso não encontrado: " + e.getMessage());
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            System.err.println("❌ Erro no servidor: " + e.getMessage());
            e.printStackTrace();
            response.put("error", "Erro no servidor. Tente novamente mais tarde.");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint para adicionar serviço à ordem
    @PostMapping("/{id}/servicos")
    public ResponseEntity<?> adicionarServico(@PathVariable Long id, @RequestBody AdicionarServicoPecaDTO servicoDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            OrdemServico ordem = ordemServicoService.adicionarServico(
                id, 
                servicoDTO.getItemId(), 
                servicoDTO.getQuantidade()
            );
            response.put("message", "Serviço adicionado com sucesso!");
            response.put("ordem", mapper.toDTO(ordem));
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            response.put("error", "Recurso não encontrado");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (IllegalArgumentException e) {
            response.put("error", "Dados inválidos");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("error", "Erro ao adicionar serviço");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint para adicionar peça à ordem
    @PostMapping("/{id}/pecas")
    public ResponseEntity<?> adicionarPeca(@PathVariable Long id, @RequestBody AdicionarServicoPecaDTO pecaDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            OrdemServico ordem = ordemServicoService.adicionarPeca(
                id, 
                pecaDTO.getItemId(), 
                pecaDTO.getQuantidade()
            );
            response.put("message", "Peça adicionada com sucesso!");
            response.put("ordem", mapper.toDTO(ordem));
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            response.put("error", "Recurso não encontrado");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (IllegalArgumentException e) {
            response.put("error", "Dados inválidos");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("error", "Erro ao adicionar peça");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint para alterar status da ordem
    @PutMapping("/{id}/status")
    public ResponseEntity<?> alterarStatus(@PathVariable Long id, 
                                          @RequestParam(required = false) StatusOrdem novoStatus,
                                          @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Tentar extrair status do body se não fornecido como query parameter
            StatusOrdem statusParaAlterar = novoStatus;
            
            if (statusParaAlterar == null && body != null && body.containsKey("status")) {
                String statusStr = body.get("status").toString().toUpperCase();
                statusParaAlterar = StatusOrdem.valueOf(statusStr);
            }
            
            if (statusParaAlterar == null) {
                response.put("error", "Status não fornecido");
                response.put("details", "Envie 'novoStatus' como query parameter ou 'status' no body da requisição");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            OrdemServico ordem = ordemServicoService.alterarStatus(id, statusParaAlterar);
            response.put("message", "Status alterado com sucesso!");
            response.put("novoStatus", ordem.getStatus().toString());
            response.put("ordem", mapper.toDTO(ordem));
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("error", "Status inválido");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (ResourceNotFoundException e) {
            response.put("error", "Ordem não encontrada");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("error", "Erro ao alterar status");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint para calcular valor total
    @GetMapping("/{id}/valor-total")
    public ResponseEntity<?> calcularValorTotal(@PathVariable Long id) {
        try {
            BigDecimal valorTotal = ordemServicoService.calcularValorTotal(id);
            return ResponseEntity.ok(Map.of("valorTotal", valorTotal));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Erro ao calcular valor total",
                "details", e.getMessage()
            ));
        }
    }

    // Endpoint para relatório de faturamento diário
    @GetMapping("/relatorios/faturamento-diario")
    public ResponseEntity<?> getFaturamentoDiario() {
        try {
            List<Object[]> faturamento = ordemServicoService.getFaturamentoDiario();
            if (faturamento.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(faturamento);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message",
                            "Erro ao gerar relatório de faturamento. Tente novamente mais tarde."));
        }
    }

    // Endpoint para relatório de faturamento por serviço
    @GetMapping("/relatorios/faturamento-servicos")
    public ResponseEntity<?> getFaturamentoPorServico() {
        try {
            List<Object[]> faturamento = ordemServicoService.getFaturamentoPorServico();
            if (faturamento.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(faturamento);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message",
                            "Erro ao gerar relatório de serviços. Tente novamente mais tarde."));
        }
    }

    // Endpoint para contagem de ordens por status
    @GetMapping("/relatorios/contagem-status")
    public ResponseEntity<?> getContagemPorStatus() {
        try {
            Map<String, Long> contagem = ordemServicoService.getContagemPorStatus();
            if (contagem.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(contagem);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message",
                            "Erro ao gerar relatório de status. Tente novamente mais tarde."));
        }
    }

    // Endpoint para buscar ordens atrasadas
    @GetMapping("/relatorios/ordens-atrasadas")
    public ResponseEntity<?> getOrdensAtrasadas(@RequestParam(defaultValue = "7") int diasAtraso) {
        try {
            List<OrdemServico> ordensAtrasadas = ordemServicoService.getOrdensAtrasadas(diasAtraso);
            if (ordensAtrasadas.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(ordensAtrasadas);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message",
                            "Erro ao buscar ordens atrasadas. Tente novamente mais tarde."));
        }
    }

    // Endpoint para atualizar observações
    @PutMapping("/{id}/observacoes")
    public ResponseEntity<?> atualizarObservacoes(@PathVariable Long id, @RequestParam String observacoes) {
        try {
            OrdemServico ordem = ordemServicoService.atualizarObservacoes(id, observacoes);
            return ResponseEntity.ok(Map.of(
                "message", "Observações atualizadas com sucesso!",
                "observacoes", ordem.getObservacoes()
            ));
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao atualizar observações");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Endpoint para gerar e baixar PDF da ordem de serviço
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPDF(@PathVariable Long id) {
        try {
            // Buscar a ordem completa
            OrdemServico ordem = ordemServicoService.getOrdemServicoCompletoById(id);
            
            // Gerar PDF
            byte[] pdfBytes = pdfService.gerarPdfOrdemServico(ordem);
            
            // Retornar como anexo
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header("Content-Disposition", "attachment; filename=OS_" + id + ".pdf")
                    .body(pdfBytes);
                    
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            System.err.println("❌ Erro ao gerar PDF: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}