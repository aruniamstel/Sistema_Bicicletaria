package br.net.manutencao.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.net.manutencao.DTO.FuncionarioCreateDTO;
import br.net.manutencao.DTO.FuncionarioListDTO;
import br.net.manutencao.model.Funcionario;
import br.net.manutencao.service.FuncionarioService;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/funcionario")
@CrossOrigin(origins = "http://localhost:4200")
public class FuncionarioController {

    @Autowired
    private FuncionarioService funcionarioService;

    // listar todos os funcionários
    @GetMapping("/listar")
    public ResponseEntity<?> listFuncionarios() {
        try {
            List<FuncionarioListDTO> funcionarios = funcionarioService.getAllFuncionarios()
                    .stream()
                    .map(func -> new FuncionarioListDTO(func.getId(), func.getEmail(), func.getNome(),
                            func.getDataNasc()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(funcionarios);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Erro ao listar funcionários. Tente novamente mais tarde."));
        }
    }

    // criar um novo funcionário
    @PostMapping("/criar")
    public ResponseEntity<Map<String, String>> createFuncionario(
            @RequestBody FuncionarioCreateDTO funcionarioCreateDTO) {
        System.out.println("Dados recebidos: " + funcionarioCreateDTO);
        Map<String, String> response = new HashMap<>();
        try {
            funcionarioService.createFuncionario(funcionarioCreateDTO);
            response.put("message", "Funcionário criado com sucesso!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            response.put("error", e.getMessage());
            return ResponseEntity.status(409).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("error", "Erro no servidor. Tente novamente mais tarde.");
            return ResponseEntity.status(500).body(response);
        }
    }

    // alterar os dados de um funcionário
    @PutMapping("/alterar/{id}")
    public ResponseEntity<?> alterarFuncionario(@PathVariable Long id,
            @RequestBody FuncionarioCreateDTO funcionarioCreateDTO) {
        try {
            Funcionario funcionarioAtualizado = funcionarioService.atualizar(id, funcionarioCreateDTO);
            return ResponseEntity.ok(funcionarioAtualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Erro no servidor. Tente novamente mais tarde."));
        }
    }

    // excluir um funcionário
    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<?> excluirFuncionario(@PathVariable Long id) {
        try {
            funcionarioService.excluir(id);
            return ResponseEntity.ok(Map.of("message", "Funcionário excluído com sucesso."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Erro no servidor. Tente novamente mais tarde."));
        }
    }
}
