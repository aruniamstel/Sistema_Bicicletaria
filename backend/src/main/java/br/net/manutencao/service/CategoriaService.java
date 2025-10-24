package br.net.manutencao.service;


import br.net.manutencao.DTO.CategoriaCreateDTO;
import br.net.manutencao.model.Categoria;
import br.net.manutencao.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public void createCategoria(CategoriaCreateDTO categoriaCreateDTO) {
        try {
            Categoria categoria = new Categoria(
            categoriaCreateDTO.getNome());
            categoriaRepository.save(categoria);
        } catch (Exception e) {
            e.printStackTrace(); 
            throw new RuntimeException("Erro ao criar categoria: " + e.getMessage(), e);
        }
    }

    public List<Categoria> getAllCategorias() {
        return categoriaRepository.findAll();
    }

    public void editar(Long id, Categoria categoriaAtualizada) {
        Categoria categoriaExistente = categoriaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o id: " + id));


        categoriaExistente.setNome(categoriaAtualizada.getNome());
        categoriaRepository.save(categoriaExistente);
    }

    public Categoria buscarPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
    }

    public Categoria atualizarPorNome(Categoria categoria) {

        Categoria categoriaExistente = categoriaRepository.findById(categoria.getId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        categoriaExistente.setNome(categoria.getNome());
        return categoriaRepository.save(categoriaExistente);
    }

    public void excluir(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new IllegalArgumentException("Categoria não encontrada");
        }
        categoriaRepository.deleteById(id);
    }

}
