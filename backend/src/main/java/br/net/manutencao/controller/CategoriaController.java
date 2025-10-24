package br.net.manutencao.controller;

import org.springframework.web.bind.annotation.RestController;

import br.net.manutencao.DTO.CategoriaCreateDTO;
import br.net.manutencao.DTO.CategoriaListDTO;
import br.net.manutencao.model.Categoria;
import br.net.manutencao.service.CategoriaService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/categorias")
@CrossOrigin(origins = "http://localhost:4200")
public class CategoriaController {
    
    @Autowired
    private CategoriaService categoriaService;

    @GetMapping("/listar")
    public ResponseEntity<?> listCategorias() {
        try {
            List<CategoriaListDTO> categorias = categoriaService.getAllCategorias()
                    .stream()
                    .map(func -> new CategoriaListDTO(func.getId(), func.getNome()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            e.printStackTrace();  // Adicione isso para imprimir a exceção no log
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Erro ao listar categorias. Tente novamente mais tarde."));
        }
    }
    
    @GetMapping("/buscar/{id}")
    public ResponseEntity<Categoria> buscarCategoria(@PathVariable Long id) {
        Categoria categoria = categoriaService.buscarPorId(id);
        return ResponseEntity.ok(categoria);
    }

    @PostMapping("/criar")
    public ResponseEntity<Map<String, String>> createCategoria(@RequestBody CategoriaCreateDTO categoriaCreateDTO) {
        Map<String, String> response = new HashMap<>();
        try {
            categoriaService.createCategoria(categoriaCreateDTO);
            response.put("message", "Categoria criada com sucesso!");
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            e.printStackTrace();  
            response.put("error", "Erro no servidor. Tente novamente mais tarde.");
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/alterar-nome")
    public ResponseEntity<Categoria> alterarNome(@RequestBody Categoria categoria) {
        Categoria categoriaAtualizada = categoriaService.atualizarPorNome(categoria);
        return ResponseEntity.ok(categoriaAtualizada);
}





    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<?> excluirCategoria(@PathVariable Long id) {
        try {
            categoriaService.excluir(id);
            return ResponseEntity.ok(Map.of("message", "Categoria excluída com sucesso."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Erro no servidor. Tente novamente mais tarde."));
        }
    }
}    

