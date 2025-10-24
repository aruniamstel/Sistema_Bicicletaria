package br.net.manutencao.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.net.manutencao.model.Cliente;
import br.net.manutencao.service.ClienteService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/cliente")
@CrossOrigin(origins = "http://localhost:4200")
public class ClienteController {

    @Autowired
    private ClienteService cadastroService;
    
    @PostMapping("/cadastrar")
    public ResponseEntity<?> autocadastrar(@Valid @RequestBody Cliente cliente) {
        try {
            Cliente clienteCadastrado = cadastroService.autocadastrar(cliente);
            return ResponseEntity.status(201).body(clienteCadastrado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Erro no servidor. Tente novamente mais tarde."));
        }
    }
}
