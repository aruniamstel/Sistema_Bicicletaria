package br.net.manutencao.service;

import br.net.manutencao.DTO.OrdemServicoCreateDTO;
import br.net.manutencao.model.*;
import br.net.manutencao.repository.*;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;

@Service
public class OrdemServicoService {

    @Autowired
    private OrdemServicoRepository ordemServicoRepository;

    @Autowired
    private BicicletaRepository bicicletaRepository;

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private PecaRepository pecaRepository;

    @Autowired
    private OrdemServicoServicoRepository ordemServicoServicoRepository;

    @Autowired
    private OrdemServicoPecaRepository ordemServicoPecaRepository;

    // Métodos básicos de listagem
    @Transactional(readOnly = true)
    public List<OrdemServico> listarTodasOrdens() {
        return ordemServicoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<OrdemServico> listarOrdensPorCliente(Long clienteId) {
        return ordemServicoRepository.findByClienteId(clienteId);
    }

    @Transactional(readOnly = true)
    public List<OrdemServico> listarOrdensPorBicicleta(Long bicicletaId) {
        return ordemServicoRepository.findByBicicletaId(bicicletaId);
    }

    @Transactional(readOnly = true)
    public List<OrdemServico> listarOrdensPorStatus(StatusOrdem status) {
        return ordemServicoRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<OrdemServico> listarOrdensEmAberto() {
        return ordemServicoRepository.findByStatusIn(
            Arrays.asList(StatusOrdem.ABERTA, StatusOrdem.EM_ANDAMENTO)
        );
    }

    // Métodos de relatório
    public List<Object[]> getFaturamentoDiario() {
        return ordemServicoRepository.findOrdensEntreguesPorData();
    }

    public List<Object[]> getFaturamentoPorServico() {
        return ordemServicoRepository.findFaturamentoPorServico();
    }

    public List<Object[]> getFaturamentoPorPeca() {
        return ordemServicoRepository.findFaturamentoPorPeca();
    }

    public Map<String, Long> getContagemPorStatus() {
        List<Object[]> resultados = ordemServicoRepository.countOrdensByStatus();
        Map<String, Long> contagem = new HashMap<>();
        
        for (Object[] resultado : resultados) {
            StatusOrdem status = (StatusOrdem) resultado[0];
            Long count = (Long) resultado[1];
            contagem.put(status.name(), count);
        }
        return contagem;
    }

    public List<OrdemServico> getOrdensAtrasadas(int diasAtraso) {
        LocalDate dataLimite = LocalDate.now().minusDays(diasAtraso);
        return ordemServicoRepository.findOrdensAtrasadas(dataLimite);
    }

    // Método para buscar ordem por ID
    @Transactional(readOnly = true)
    public OrdemServico getOrdemServicoById(Long id) {
        return ordemServicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ordem de serviço não encontrada com o ID: " + id));
    }

    // Método principal para criar nova ordem de serviço
    @Transactional
    public OrdemServico criarOrdemServico(OrdemServicoCreateDTO ordemDTO) {
        OrdemServico novaOrdem = new OrdemServico();
        
        // Buscar a bicicleta
        Bicicleta bicicleta = bicicletaRepository.findById(ordemDTO.getBicicletaId())
                .orElseThrow(() -> new EntityNotFoundException("Bicicleta não encontrada com ID: " + ordemDTO.getBicicletaId()));
        
        novaOrdem.setBicicleta(bicicleta);
        novaOrdem.setProblemaRelatado(ordemDTO.getProblemaRelatado());
        novaOrdem.setObservacoes(ordemDTO.getObservacoes());
        novaOrdem.setDataEntrada(LocalDateTime.now());
        novaOrdem.setStatus(StatusOrdem.ABERTA);
        
        return ordemServicoRepository.save(novaOrdem);
    }

    // Método para adicionar serviço à ordem
    @Transactional
    public OrdemServico adicionarServico(Long ordemId, Long servicoId, Integer quantidade) {
        OrdemServico ordem = getOrdemServicoById(ordemId);
        Servico servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado com ID: " + servicoId));
        
        // Verificar se o serviço já foi adicionado à ordem
        Optional<OrdemServicoServico> existing = ordem.getServicos().stream()
                .filter(oss -> oss.getServico().getId().equals(servicoId))
                .findFirst();
        
        if (existing.isPresent()) {
            // Atualizar quantidade se já existir
            OrdemServicoServico oss = existing.get();
            oss.setQuantidade(oss.getQuantidade() + quantidade);
            ordemServicoServicoRepository.save(oss);
        } else {
            // Criar novo relacionamento
            OrdemServicoServico ordemServicoServico = new OrdemServicoServico();
            ordemServicoServico.setOrdemServico(ordem);
            ordemServicoServico.setServico(servico);
            ordemServicoServico.setQuantidade(quantidade);
            ordemServicoServico.setValorUnitario(servico.getValorPadrao());
            
            ordemServicoServicoRepository.save(ordemServicoServico);
            ordem.getServicos().add(ordemServicoServico);
        }
        
        return ordemServicoRepository.save(ordem);
    }

    // Método para adicionar peça à ordem
    @Transactional
    public OrdemServico adicionarPeca(Long ordemId, Long pecaId, Integer quantidade) {
        OrdemServico ordem = getOrdemServicoById(ordemId);
        Peca peca = pecaRepository.findById(pecaId)
                .orElseThrow(() -> new EntityNotFoundException("Peça não encontrada com ID: " + pecaId));
        
        // Verificar estoque
        if (peca.getEstoque() < quantidade) {
            throw new IllegalArgumentException("Estoque insuficiente para a peça: " + peca.getNome() + 
                    ". Disponível: " + peca.getEstoque() + ", Solicitado: " + quantidade);
        }
        
        // Verificar se a peça já foi adicionada à ordem
        Optional<OrdemServicoPeca> existing = ordem.getPecas().stream()
                .filter(osp -> osp.getPeca().getId().equals(pecaId))
                .findFirst();
        
        if (existing.isPresent()) {
            // Atualizar quantidade se já existir
            OrdemServicoPeca osp = existing.get();
            osp.setQuantidade(osp.getQuantidade() + quantidade);
            ordemServicoPecaRepository.save(osp);
        } else {
            // Criar novo relacionamento
            OrdemServicoPeca ordemServicoPeca = new OrdemServicoPeca();
            ordemServicoPeca.setOrdemServico(ordem);
            ordemServicoPeca.setPeca(peca);
            ordemServicoPeca.setQuantidade(quantidade);
            ordemServicoPeca.setValorUnitario(peca.getValorUnitario());
            
            ordemServicoPecaRepository.save(ordemServicoPeca);
            ordem.getPecas().add(ordemServicoPeca);
        }
        
        // Atualizar estoque
        peca.setEstoque(peca.getEstoque() - quantidade);
        pecaRepository.save(peca);
        
        return ordemServicoRepository.save(ordem);
    }

    // Método para alterar status da ordem
    @Transactional
    public OrdemServico alterarStatus(Long ordemId, StatusOrdem novoStatus) {
        OrdemServico ordem = getOrdemServicoById(ordemId);
        
        // Lógica para datas automáticas
        if (novoStatus == StatusOrdem.CONCLUIDA && ordem.getStatus() != StatusOrdem.CONCLUIDA) {
            // Se está sendo concluída pela primeira vez, seta data atual
            ordem.setDataSaida(LocalDateTime.now());
        } else if (novoStatus == StatusOrdem.ENTREGUE && ordem.getStatus() != StatusOrdem.ENTREGUE) {
            // Se está sendo entregue, confirma data de saída
            if (ordem.getDataSaida() == null) {
                ordem.setDataSaida(LocalDateTime.now());
            }
        }
        
        ordem.setStatus(novoStatus);
        return ordemServicoRepository.save(ordem);
    }

    // Método para calcular valor total
    @Transactional(readOnly = true)
    public BigDecimal calcularValorTotal(Long ordemId) {
        OrdemServico ordem = getOrdemServicoById(ordemId);
        return ordem.getValorTotal();
    }

    // Método para atualizar observações
    @Transactional
    public OrdemServico atualizarObservacoes(Long ordemId, String observacoes) {
        OrdemServico ordem = getOrdemServicoById(ordemId);
        ordem.setObservacoes(observacoes);
        return ordemServicoRepository.save(ordem);
    }

    // Método para remover serviço da ordem
    @Transactional
    public OrdemServico removerServico(Long ordemId, Long servicoId) {
        OrdemServico ordem = getOrdemServicoById(ordemId);
        
        Optional<OrdemServicoServico> servicoToRemove = ordem.getServicos().stream()
                .filter(oss -> oss.getServico().getId().equals(servicoId))
                .findFirst();
        
        if (servicoToRemove.isPresent()) {
            ordem.getServicos().remove(servicoToRemove.get());
            ordemServicoServicoRepository.delete(servicoToRemove.get());
            return ordemServicoRepository.save(ordem);
        } else {
            throw new EntityNotFoundException("Serviço não encontrado na ordem de serviço");
        }
    }

    // Método para remover peça da ordem (e devolver ao estoque)
    @Transactional
    public OrdemServico removerPeca(Long ordemId, Long pecaId) {
        OrdemServico ordem = getOrdemServicoById(ordemId);
        
        Optional<OrdemServicoPeca> pecaToRemove = ordem.getPecas().stream()
                .filter(osp -> osp.getPeca().getId().equals(pecaId))
                .findFirst();
        
        if (pecaToRemove.isPresent()) {
            OrdemServicoPeca osp = pecaToRemove.get();
            Peca peca = osp.getPeca();
            
            // Devolver ao estoque
            peca.setEstoque(peca.getEstoque() + osp.getQuantidade());
            pecaRepository.save(peca);
            
            // Remover da ordem
            ordem.getPecas().remove(osp);
            ordemServicoPecaRepository.delete(osp);
            
            return ordemServicoRepository.save(ordem);
        } else {
            throw new EntityNotFoundException("Peça não encontrada na ordem de serviço");
        }
    }

    // Método para buscar ordens por período
    @Transactional(readOnly = true)
    public List<OrdemServico> buscarOrdensPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        return ordemServicoRepository.findByPeriodo(dataInicio, dataFim);
    }
}