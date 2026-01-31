package br.net.manutencao.controller;

import br.net.manutencao.DTO.ClienteDTO;
import br.net.manutencao.model.Cliente;
import br.net.manutencao.service.ClienteService;
import br.net.manutencao.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // Listar todos os clientes
    @GetMapping
    public ResponseEntity<List<ClienteDTO>> listarTodos() {
        List<Cliente> clientes = clienteService.listarTodosClientes();
        if (clientes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        List<ClienteDTO> dtos = clientes.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Buscar cliente por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            Cliente cliente = clienteService.buscarClientePorId(id);
            return ResponseEntity.ok(toDTO(cliente));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Buscar cliente com bicicletas
    @GetMapping("/{id}/com-bicicletas")
    public ResponseEntity<?> buscarComBicicletas(@PathVariable Long id) {
        try {
            Cliente cliente = clienteService.buscarClienteComBicicletas(id);
            return ResponseEntity.ok(toDTO(cliente));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private ClienteDTO toDTO(Cliente cliente) {
        return new ClienteDTO(cliente.getId(), cliente.getNome(), cliente.getTelefone(),
                            cliente.getEndereco(), cliente.getInstagram());
    }

    // Buscar por telefone
    @GetMapping("/telefone/{telefone}")
    public ResponseEntity<?> buscarPorTelefone(@PathVariable String telefone) {
        Optional<Cliente> cliente = clienteService.buscarPorTelefone(telefone);
        if (cliente.isPresent()) {
            return ResponseEntity.ok(toDTO(cliente.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Cliente não encontrado com o telefone: " + telefone));
        }
    }

    // Buscar por nome
    @GetMapping("/buscar")
    public ResponseEntity<List<ClienteDTO>> buscarPorNome(@RequestParam String nome) {
        List<Cliente> clientes = clienteService.buscarPorNome(nome);
        if (clientes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        List<ClienteDTO> dtos = clientes.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Criar novo cliente
    @PostMapping
    public ResponseEntity<?> criarCliente(@RequestBody Cliente cliente) {
        try {
            Cliente clienteSalvo = clienteService.criarCliente(cliente);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                        "message", "Cliente criado com sucesso!",
                        "id", clienteSalvo.getId(),
                        "cliente", toDTO(clienteSalvo)
                    ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao criar cliente: " + e.getMessage()));
        }
    }

    // Atualizar cliente
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarCliente(@PathVariable Long id, @RequestBody Cliente cliente) {
        try {
            Cliente clienteAtualizado = clienteService.atualizarCliente(id, cliente);
            return ResponseEntity.ok(Map.of(
                "message", "Cliente atualizado com sucesso!",
                "cliente", toDTO(clienteAtualizado)
            ));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao atualizar cliente: " + e.getMessage()));
        }
    }

    // Deletar cliente
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarCliente(@PathVariable Long id) {
        try {
            clienteService.deletarCliente(id);
            return ResponseEntity.ok(Map.of("message", "Cliente deletado com sucesso!"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao deletar cliente: " + e.getMessage()));
        }
    }
}