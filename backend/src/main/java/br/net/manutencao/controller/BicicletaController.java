package br.net.manutencao.controller;

import br.net.manutencao.model.Bicicleta;
import br.net.manutencao.service.BicicletaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bicicletas")
public class BicicletaController {

    @Autowired
    private BicicletaService bicicletaService;

    @GetMapping
    public ResponseEntity<List<Bicicleta>> listarTodas() {
        List<Bicicleta> bicicletas = bicicletaService.listarTodas();
        return ResponseEntity.ok(bicicletas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bicicleta> buscarPorId(@PathVariable Long id) {
        Bicicleta bicicleta = bicicletaService.buscarPorId(id);
        return ResponseEntity.ok(bicicleta);
    }

    @PostMapping
    public ResponseEntity<Bicicleta> criar(@RequestBody Bicicleta bicicleta) {
        Bicicleta novaBicicleta = bicicletaService.criar(bicicleta);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaBicicleta);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Bicicleta>> listarPorCliente(@PathVariable Long clienteId) {
        List<Bicicleta> bicicletas = bicicletaService.listarPorCliente(clienteId);
        return ResponseEntity.ok(bicicletas);
    }
}