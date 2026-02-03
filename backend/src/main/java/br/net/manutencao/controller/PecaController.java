package br.net.manutencao.controller;

import br.net.manutencao.model.Peca;
import br.net.manutencao.service.PecaService;
import br.net.manutencao.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pecas")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PecaController {

    @Autowired
    private PecaService pecaService;

    /**
     * GET /pecas - Listar todas as peças
     */
    @GetMapping
    public ResponseEntity<List<Peca>> listarTodas() {
        List<Peca> pecas = pecaService.listarTodas();
        if (pecas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(pecas);
    }

    /**
     * GET /pecas/{id} - Buscar peça por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            Peca peca = pecaService.buscarPorId(id);
            return ResponseEntity.ok(peca);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(criarErro("Recurso não encontrado", e.getMessage()));
        }
    }

    /**
     * GET /pecas/buscar?descricao=... - Buscar peças por descrição
     */
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorDescricao(@RequestParam String descricao) {
        try {
            List<Peca> pecas = pecaService.buscarPorDescricao(descricao);
            if (pecas.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(pecas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(criarErro("Requisição inválida", e.getMessage()));
        }
    }

    /**
     * POST /pecas - Criar nova peça
     */
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Peca peca) {
        try {
            Peca pecaCriada = pecaService.criar(peca);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Peça criada com sucesso!");
            response.put("id", pecaCriada.getId());
            response.put("peca", pecaCriada);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(criarErro("Requisição inválida", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(criarErro("Erro no servidor", "Erro ao criar peça: " + e.getMessage()));
        }
    }

    /**
     * PUT /pecas/{id} - Atualizar peça
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Peca peca) {
        try {
            Peca pecaAtualizada = pecaService.atualizar(id, peca);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Peça atualizada com sucesso!");
            response.put("peca", pecaAtualizada);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(criarErro("Recurso não encontrado", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(criarErro("Requisição inválida", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(criarErro("Erro no servidor", "Erro ao atualizar peça: " + e.getMessage()));
        }
    }

    /**
     * DELETE /pecas/{id} - Deletar peça
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        try {
            pecaService.deletar(id);
            return ResponseEntity.ok(criarSucesso("Peça deletada com sucesso!"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(criarErro("Recurso não encontrado", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(criarErro("Conflito de dados", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(criarErro("Erro no servidor", "Erro ao deletar peça: " + e.getMessage()));
        }
    }

    /**
     * PUT /pecas/{id}/quantidade - Atualizar quantidade de peça
     */
    @PutMapping("/{id}/quantidade")
    public ResponseEntity<?> atualizarQuantidade(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Integer novaQuantidade = request.get("quantidade");
            if (novaQuantidade == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(criarErro("Requisição inválida", "Campo 'quantidade' é obrigatório"));
            }
            
            Peca pecaAtualizada = pecaService.atualizarQuantidade(id, novaQuantidade);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Quantidade atualizada com sucesso!");
            response.put("peca", pecaAtualizada);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(criarErro("Recurso não encontrado", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(criarErro("Requisição inválida", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(criarErro("Erro no servidor", e.getMessage()));
        }
    }

    // Métodos auxiliares
    private Map<String, String> criarErro(String erro, String mensagem) {
        Map<String, String> map = new HashMap<>();
        map.put("error", erro);
        map.put("message", mensagem);
        return map;
    }

    private Map<String, String> criarSucesso(String mensagem) {
        Map<String, String> map = new HashMap<>();
        map.put("message", mensagem);
        return map;
    }
}
