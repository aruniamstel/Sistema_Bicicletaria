package br.net.manutencao.controller;

import br.net.manutencao.DTO.BicicletaDTO;
import br.net.manutencao.model.Bicicleta;
import br.net.manutencao.service.BicicletaService;
import br.net.manutencao.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bicicletas")
public class BicicletaController {

    @Autowired
    private BicicletaService bicicletaService;

    @GetMapping
    public ResponseEntity<List<BicicletaDTO>> listarTodas() {
        List<Bicicleta> bicicletas = bicicletaService.listarTodas();
        List<BicicletaDTO> dtos = bicicletas.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BicicletaDTO> buscarPorId(@PathVariable Long id) {
        Bicicleta bicicleta = bicicletaService.buscarPorId(id);
        return ResponseEntity.ok(toDTO(bicicleta));
    }

    @PostMapping
    public ResponseEntity<BicicletaDTO> criar(@RequestBody Bicicleta bicicleta) {
        Bicicleta novaBicicleta = bicicletaService.criar(bicicleta);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(novaBicicleta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Bicicleta bicicletaAtualizada) {
        try {
            Bicicleta bicicletaAtualizadaResult = bicicletaService.atualizar(id, bicicletaAtualizada);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bicicleta atualizada com sucesso!");
            response.put("bicicleta", toDTO(bicicletaAtualizadaResult));
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Bicicleta não encontrada");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Dados inválidos");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro no servidor");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        try {
            bicicletaService.deletar(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Bicicleta deletada com sucesso!");
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Bicicleta não encontrada");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Não é possível deletar");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro no servidor");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<BicicletaDTO>> listarPorCliente(@PathVariable Long clienteId) {
        List<Bicicleta> bicicletas = bicicletaService.listarPorCliente(clienteId);
        List<BicicletaDTO> dtos = bicicletas.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private BicicletaDTO toDTO(Bicicleta bicicleta) {
        BicicletaDTO dto = new BicicletaDTO();
        dto.setId(bicicleta.getId());
        dto.setMarca(bicicleta.getMarca());
        dto.setModelo(bicicleta.getModelo());
        dto.setTamanhoAro(bicicleta.getTamanhoAro());
        dto.setCor(bicicleta.getCor());
        if (bicicleta.getCliente() != null) {
            dto.setCliente(new br.net.manutencao.DTO.ClienteDTO(
                bicicleta.getCliente().getId(),
                bicicleta.getCliente().getNome(),
                bicicleta.getCliente().getTelefone(),
                bicicleta.getCliente().getEndereco(),
                bicicleta.getCliente().getInstagram()
            ));
        }
        return dto;
    }
}