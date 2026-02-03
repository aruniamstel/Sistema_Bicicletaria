package br.net.manutencao.service;

import br.net.manutencao.model.Servico;
import br.net.manutencao.repository.ServicoRepository;
import br.net.manutencao.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServicoService {

    @Autowired
    private ServicoRepository servicoRepository;

    /**
     * Listar todos os serviços
     */
    @Transactional(readOnly = true)
    public List<Servico> listarTodos() {
        return servicoRepository.findAll();
    }

    /**
     * Buscar serviço por ID
     */
    @Transactional(readOnly = true)
    public Servico buscarPorId(Long id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com ID: " + id));
    }

    /**
     * Criar novo serviço
     */
    @Transactional
    public Servico criar(Servico servico) {
        // Validações básicas
        if (servico.getDescricao() == null || servico.getDescricao().trim().isEmpty()) {
            throw new IllegalArgumentException("Descrição do serviço é obrigatória");
        }
        
        if (servico.getValor() == null || servico.getValor().doubleValue() <= 0) {
            throw new IllegalArgumentException("Valor do serviço deve ser maior que zero");
        }
        
        return servicoRepository.save(servico);
    }

    /**
     * Atualizar serviço existente
     */
    @Transactional
    public Servico atualizar(Long id, Servico servicoAtualizado) {
        Servico servicoExistente = buscarPorId(id);
        
        // Validações
        if (servicoAtualizado.getDescricao() != null && !servicoAtualizado.getDescricao().trim().isEmpty()) {
            servicoExistente.setDescricao(servicoAtualizado.getDescricao());
        }
        
        if (servicoAtualizado.getValor() != null && servicoAtualizado.getValor().doubleValue() > 0) {
            servicoExistente.setValor(servicoAtualizado.getValor());
        }
        
        return servicoRepository.save(servicoExistente);
    }

    /**
     * Deletar serviço
     */
    @Transactional
    public void deletar(Long id) {
        Servico servico = buscarPorId(id);
        
        // Verificar se o serviço está em uso em ordens de serviço
        if (!servico.getOrdemServicoServicos().isEmpty()) {
            throw new IllegalStateException(
                "Não é possível excluir o serviço pois ele está vinculado a ordens de serviço"
            );
        }
        
        servicoRepository.delete(servico);
    }

    /**
     * Verificar se serviço existe
     */
    @Transactional(readOnly = true)
    public boolean existe(Long id) {
        return servicoRepository.existsById(id);
    }

}
