package br.net.manutencao.controller;

import br.net.manutencao.model.Servico;
import br.net.manutencao.service.ServicoService;
import br.net.manutencao.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/servicos")
public class ServicoController {

    @Autowired
    private ServicoService servicoService;

    /**
     * GET /servicos - Listar todos os serviços
     */
    @GetMapping
    public ResponseEntity<List<Servico>> listarTodos() {
        List<Servico> servicos = servicoService.listarTodos();
        if (servicos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(servicos);
    }

    /**
     * GET /servicos/{id} - Buscar serviço por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            Servico servico = servicoService.buscarPorId(id);
            return ResponseEntity.ok(servico);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(criarErro("Recurso não encontrado", e.getMessage()));
        }
    }

    /**
     * GET /servicos/buscar?descricao=... - Buscar serviços por descrição
     */
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorDescricao(@RequestParam String descricao) {
        try {
            List<Servico> servicos = servicoService.buscarPorDescricao(descricao);
            if (servicos.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(servicos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(criarErro("Requisição inválida", e.getMessage()));
        }
    }

    /**
     * POST /servicos - Criar novo serviço
     */
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Servico servico) {
        try {
            Servico servicoCriado = servicoService.criar(servico);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Serviço criado com sucesso!");
            response.put("id", servicoCriado.getId());
            response.put("servico", servicoCriado);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(criarErro("Requisição inválida", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(criarErro("Erro no servidor", "Erro ao criar serviço: " + e.getMessage()));
        }
    }

    /**
     * PUT /servicos/{id} - Atualizar serviço
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Servico servico) {
        try {
            Servico servicoAtualizado = servicoService.atualizar(id, servico);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Serviço atualizado com sucesso!");
            response.put("servico", servicoAtualizado);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(criarErro("Recurso não encontrado", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(criarErro("Requisição inválida", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(criarErro("Erro no servidor", "Erro ao atualizar serviço: " + e.getMessage()));
        }
    }

    /**
     * DELETE /servicos/{id} - Deletar serviço
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        try {
            servicoService.deletar(id);
            return ResponseEntity.ok(criarSucesso("Serviço deletado com sucesso!"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(criarErro("Recurso não encontrado", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(criarErro("Conflito de dados", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(criarErro("Erro no servidor", "Erro ao deletar serviço: " + e.getMessage()));
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
