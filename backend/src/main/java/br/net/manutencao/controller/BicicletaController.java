package br.net.manutencao.controller;

import br.net.manutencao.DTO.BicicletaDTO;
import br.net.manutencao.model.Bicicleta;
import br.net.manutencao.service.BicicletaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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