package br.net.manutencao.service;

import br.net.manutencao.model.Peca;
import br.net.manutencao.repository.ItemPecaRepository;
import br.net.manutencao.repository.PecaRepository;
import br.net.manutencao.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PecaService {

    @Autowired
    private PecaRepository pecaRepository;

    /**
     * Listar todas as peças
     */
    @Transactional(readOnly = true)
    public List<Peca> listarTodas() {
        return pecaRepository.findAll();
    }

    /**
     * Buscar peça por ID
     */
    @Transactional(readOnly = true)
    public Peca buscarPorId(Long id) {
        return pecaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Peça não encontrada com ID: " + id));
    }

    /**
     * Criar nova peça
     */
    @Transactional
    public Peca criar(Peca peca) {
        // Validações básicas
        if (peca.getDescricao() == null || peca.getDescricao().trim().isEmpty()) {
            throw new IllegalArgumentException("Descrição da peça é obrigatória");
        }
        
        if (peca.getValor() == null || peca.getValor().doubleValue() <= 0) {
            throw new IllegalArgumentException("Valor da peça deve ser maior que zero");
        }
        
        if (peca.getQuantidade() == null || peca.getQuantidade() < 0) {
            peca.setQuantidade(0);
        }
        
        return pecaRepository.save(peca);
    }

    /**
     * Atualizar peça existente
     */
    @Transactional
    public Peca atualizar(Long id, Peca pecaAtualizada) {
        Peca pecaExistente = buscarPorId(id);
        
        // Atualizar campos obrigatórios
        if (pecaAtualizada.getDescricao() != null && !pecaAtualizada.getDescricao().trim().isEmpty()) {
            pecaExistente.setDescricao(pecaAtualizada.getDescricao());
        }
        
        if (pecaAtualizada.getValor() != null && pecaAtualizada.getValor().doubleValue() > 0) {
            pecaExistente.setValor(pecaAtualizada.getValor());
        }
        
        // Atualizar campos opcionais
        if (pecaAtualizada.getQuantidade() != null) {
            pecaExistente.setQuantidade(pecaAtualizada.getQuantidade());
        }
        
        if (pecaAtualizada.getCodigoInterno() != null) {
            pecaExistente.setCodigoInterno(pecaAtualizada.getCodigoInterno());
        }
        
        if (pecaAtualizada.getCategoria() != null) {
            pecaExistente.setCategoria(pecaAtualizada.getCategoria());
        }
        
        if (pecaAtualizada.getSubcategoria() != null) {
            pecaExistente.setSubcategoria(pecaAtualizada.getSubcategoria());
        }
        
        return pecaRepository.save(pecaExistente);
    }

    @Autowired
private ItemPecaRepository itemPecaRepository;

    /**
     * Deletar peça
     */
    @Transactional
    public void deletar(Long id) {
        // 1. Verificar se a peça existe
        if (!pecaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Peça não encontrada");
        }
        
        // 2. NOVA LÓGICA: Verificar se a peça está em uso consultando a tabela de itens
        boolean emUso = itemPecaRepository.existsByPecaId(id);
        
        if (emUso) {
            throw new IllegalStateException(
                "Não é possível excluir a peça pois ela está vinculada a ordens de serviço (histórico de manutenção)"
            );
        }
        
        pecaRepository.deleteById(id);
    }

    /**
     * Verificar se peça existe
     */
    @Transactional(readOnly = true)
    public boolean existe(Long id) {
        return pecaRepository.existsById(id);
    }

    /**
     * Buscar peças por descrição (parcial)
     */
    @Transactional(readOnly = true)
    public List<Peca> buscarPorDescricao(String descricao) {
        return pecaRepository.findByDescricao(descricao);
    }

    /**
     * Atualizar quantidade de peça (para controle de estoque)
     */
    @Transactional
    public Peca atualizarQuantidade(Long id, Integer novaQuantidade) {
        Peca peca = buscarPorId(id);
        
        if (novaQuantidade < 0) {
            throw new IllegalArgumentException("Quantidade não pode ser negativa");
        }
        
        peca.setQuantidade(novaQuantidade);
        return pecaRepository.save(peca);
    }
}
