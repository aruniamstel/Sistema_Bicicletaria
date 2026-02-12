package br.net.manutencao.service;

import br.net.manutencao.DTO.OrdemServicoCreateDTO;
import br.net.manutencao.DTO.OrdemServicoCreateComplexDTO;
import br.net.manutencao.model.*;
import br.net.manutencao.repository.*;
import br.net.manutencao.exception.ResourceNotFoundException;

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
    private ClienteRepository clienteRepository;

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

    @Autowired
    private PDFService pdfService;

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

    public OrdemServico getOrdemServicoById(Long id) {
        return ordemServicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de serviço não encontrada com o ID: " + id));
    }

    // Método auxiliar para buscar ordem com todas as relações inicializadas
    @Transactional
    public OrdemServico getOrdemServicoCompletoById(Long id) {
        OrdemServico ordem = ordemServicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de serviço não encontrada com o ID: " + id));
        
        // Forçar inicialização das relações lazy
        if (ordem.getCliente() != null) {
            ordem.getCliente().getNome(); // acessa propriedade para inicializar
        }
        if (ordem.getBicicleta() != null) {
            ordem.getBicicleta().getMarca(); // acessa propriedade para inicializar
        }
        ordem.getServicos().size(); // inicializa lista
        ordem.getPecas().size(); // inicializa lista
        
        // ⭐ CRÍTICO: Recalcular valorTotal
        ordem.calcularValorTotal();
        ordemServicoRepository.save(ordem);
        
        return ordem;
    }

    /**
     * Método auxiliar PRIVADO para recalcular e persistir o valor total
     * Deve ser chamado após modificações em servicos/pecas
     */
    @Transactional
    private OrdemServico atualizarValorTotal(OrdemServico ordem) {
        // Inicializar as listas
        ordem.getServicos().size();
        ordem.getPecas().size();
        
        // Recalcular valor
        ordem.calcularValorTotal();
        
        // Persistir
        ordemServicoRepository.save(ordem);
        
        return ordem;
    }

    /**
     * Método auxiliar para gerar PDF da ordem de serviço
     * Log de erros de PDF não bloqueiam a transação
     */
    private void gerarPDFOrdem(OrdemServico ordem) {
        try {
            byte[] pdfBytes = pdfService.gerarPdfOrdemServico(ordem);
            System.out.println("✓ PDF gerado com sucesso para Ordem #" + ordem.getId() + " (" + pdfBytes.length + " bytes)");
            // TODO: Opcional - salvar PDF em diretório ou banco de dados
        } catch (Exception e) {
            System.err.println("⚠️ Erro ao gerar PDF da Ordem #" + ordem.getId() + ": " + e.getMessage());
            e.printStackTrace();
            // Não lançar exceção - PDF é informativo, não crítico para a OS
        }
    }

    // Método principal para criar nova ordem de serviço
    @Transactional
    public OrdemServico criarOrdemServico(OrdemServicoCreateDTO ordemDTO) {
        OrdemServico novaOrdem = new OrdemServico();

        // Buscar cliente
        Cliente cliente = clienteRepository.findById(ordemDTO.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + ordemDTO.getClienteId()));

        // Buscar bicicleta
        Bicicleta bicicleta = bicicletaRepository.findById(ordemDTO.getBicicletaId())
                .orElseThrow(() -> new ResourceNotFoundException("Bicicleta não encontrada com ID: " + ordemDTO.getBicicletaId()));

        novaOrdem.setCliente(cliente);
        novaOrdem.setBicicleta(bicicleta);
        novaOrdem.setObservacoes(ordemDTO.getObservacoes());
        novaOrdem.setDataEntrada(LocalDateTime.now());
        novaOrdem.setDataPrevisaoSaida(ordemDTO.getDataPrevisaoSaida() != null ?
            ordemDTO.getDataPrevisaoSaida() : LocalDateTime.now().plusDays(3));
        novaOrdem.setStatus(StatusOrdem.ABERTA);
        novaOrdem.setValorTotal(BigDecimal.ZERO);
        novaOrdem.setExibirAviso30Dias(false);

        OrdemServico ordemSalva = ordemServicoRepository.save(novaOrdem);
        
        // Obter ordem com relações inicializadas (evita LazyInitializationException)
        OrdemServico ordemCompleta = getOrdemServicoCompletoById(ordemSalva.getId());
        
        // Gerar PDF da ordem de serviço
        gerarPDFOrdem(ordemCompleta);
        
        // Retornar ordem com relações inicializadas (evita LazyInitializationException)
        return ordemCompleta;
    }

    // Método para adicionar serviço à ordem
    @Transactional
    public OrdemServico adicionarServico(Long ordemId, Long servicoId, Integer quantidade) {
        OrdemServico ordem = getOrdemServicoById(ordemId);
        Servico servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com ID: " + servicoId));
        
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
            ordemServicoServico.setValor(servico.getValor());
            
            ordemServicoServicoRepository.save(ordemServicoServico);
            ordem.getServicos().add(ordemServicoServico);
        }
        
        // ⭐ CRÍTICO: Recalcular e persistir valorTotal
        atualizarValorTotal(ordem);
        
        // Retornar ordem com relações inicializadas
        return getOrdemServicoCompletoById(ordem.getId());
    }

    // Método para adicionar peça à ordem
    @Transactional
    public OrdemServico adicionarPeca(Long ordemId, Long pecaId, Integer quantidade) {
        OrdemServico ordem = getOrdemServicoById(ordemId);
        Peca peca = pecaRepository.findById(pecaId)
                .orElseThrow(() -> new ResourceNotFoundException("Peça não encontrada com ID: " + pecaId));
        
        // Verificar estoque
        if (peca.getQuantidade() < quantidade) {
            throw new IllegalArgumentException("Estoque insuficiente para a peça: " + peca.getDescricao() + 
                    ". Disponível: " + peca.getQuantidade() + ", Solicitado: " + quantidade);
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
            ordemServicoPeca.setValor(peca.getValor());
            
            ordemServicoPecaRepository.save(ordemServicoPeca);
            ordem.getPecas().add(ordemServicoPeca);
        }
        
        // Atualizar estoque
        peca.setQuantidade(peca.getQuantidade() - quantidade);
        pecaRepository.save(peca);
        
        // ⭐ CRÍTICO: Recalcular e persistir valorTotal
        atualizarValorTotal(ordem);
        
        // Retornar ordem com relações inicializadas
        return getOrdemServicoCompletoById(ordem.getId());
    }

    // Método para alterar status da ordem
    @Transactional
    public OrdemServico alterarStatus(Long ordemId, StatusOrdem novoStatus) {
        OrdemServico ordem = getOrdemServicoById(ordemId);

        // Lógica para datas automáticas
        if (novoStatus == StatusOrdem.CONCLUIDA && ordem.getStatus() != StatusOrdem.CONCLUIDA) {
            // Se está sendo concluída pela primeira vez, seta data atual
            ordem.setDataSaidaReal(LocalDateTime.now());
        } else if (novoStatus == StatusOrdem.ENTREGUE && ordem.getStatus() != StatusOrdem.ENTREGUE) {
            // Se está sendo entregue, confirma data de saída
            if (ordem.getDataSaidaReal() == null) {
                ordem.setDataSaidaReal(LocalDateTime.now());
            }
        }

        ordem.setStatus(novoStatus);
        ordemServicoRepository.save(ordem);
        
        // Retornar ordem com relações inicializadas
        return getOrdemServicoCompletoById(ordem.getId());
    }

    // Método para calcular valor total
    @Transactional
    public BigDecimal calcularValorTotal(Long ordemId) {
        OrdemServico ordem = getOrdemServicoById(ordemId);
        
        // ⭐ Recalcular o valor total
        BigDecimal totalCalculado = ordem.calcularValorTotal();
        
        // ⭐ Persistir a mudança
        ordemServicoRepository.save(ordem);
        
        return totalCalculado;
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
            throw new ResourceNotFoundException("Serviço não encontrado na ordem de serviço");
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
            peca.setQuantidade(peca.getQuantidade() + osp.getQuantidade());
            pecaRepository.save(peca);
            
            // Remover da ordem
            ordem.getPecas().remove(osp);
            ordemServicoPecaRepository.delete(osp);
            
            return ordemServicoRepository.save(ordem);
        } else {
            throw new ResourceNotFoundException("Peça não encontrada na ordem de serviço");
        }
    }

    // Método para buscar ordens por período
    @Transactional(readOnly = true)
    public List<OrdemServico> buscarOrdensPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        return ordemServicoRepository.findByPeriodo(dataInicio, dataFim);
    }

    /**
     * Método para criar ordem de serviço com payload completo do frontend
     * Suporta objeto com cliente, bicicleta, serviços e peças aninhados
     */
    @Transactional
    public OrdemServico criarOrdemServicoCompleta(OrdemServicoCreateComplexDTO ordemDTO) {
        OrdemServico novaOrdem = new OrdemServico();

        // 1. Buscar e validar cliente
        if (ordemDTO.getCliente() == null || ordemDTO.getCliente().getId() == null) {
            throw new IllegalArgumentException("Cliente é obrigatório");
        }
        Cliente cliente = clienteRepository.findById(ordemDTO.getCliente().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + ordemDTO.getCliente().getId()));

        // 2. Buscar e validar bicicleta (opcional)
        Bicicleta bicicleta = null;
        if (ordemDTO.getBicicleta() != null && ordemDTO.getBicicleta().getId() != null) {
            bicicleta = bicicletaRepository.findById(ordemDTO.getBicicleta().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bicicleta não encontrada com ID: " + ordemDTO.getBicicleta().getId()));
        }

        // 3. Definir dados básicos
        novaOrdem.setCliente(cliente);
        novaOrdem.setBicicleta(bicicleta);
        novaOrdem.setObservacoes(ordemDTO.getObservacoes() != null ? ordemDTO.getObservacoes() : "");
        novaOrdem.setDataEntrada(LocalDateTime.now());
        
        // Usar a data de previsão fornecida ou padrão de 3 dias
        LocalDateTime dataPrevisao = LocalDateTime.now().plusDays(3); // Padrão: 3 dias
        if (ordemDTO.getDataPrevisaoSaida() != null) {
            // Jackson já converte para LocalDateTime automaticamente via @JsonFormat
            dataPrevisao = ordemDTO.getDataPrevisaoSaida();
        }
        novaOrdem.setDataPrevisaoSaida(dataPrevisao);
        
        novaOrdem.setStatus(StatusOrdem.ABERTA);
        novaOrdem.setValorTotal(BigDecimal.ZERO);
        novaOrdem.setExibirAviso30Dias(ordemDTO.getExibirAviso30Dias() != null ? ordemDTO.getExibirAviso30Dias() : false);

        // Salvar ordem básica
        OrdemServico ordemSalva = ordemServicoRepository.save(novaOrdem);

        // 4. Adicionar serviços
        if (ordemDTO.getServicos() != null && !ordemDTO.getServicos().isEmpty()) {
            for (OrdemServicoCreateComplexDTO.ServicoSelecionado servicoSel : ordemDTO.getServicos()) {
                if (servicoSel.getServico() != null && servicoSel.getServico().getId() != null) {
                    Long servicoId = servicoSel.getServico().getId();
                    Integer quantidade = servicoSel.getQuantidade() != null ? servicoSel.getQuantidade() : 1;
                    
                    Servico servico = servicoRepository.findById(servicoId)
                            .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com ID: " + servicoId));
                    
                    OrdemServicoServico ordemServicoServico = new OrdemServicoServico();
                    ordemServicoServico.setOrdemServico(ordemSalva);
                    ordemServicoServico.setServico(servico);
                    ordemServicoServico.setQuantidade(quantidade);
                    ordemServicoServico.setValor(servico.getValor());
                    
                    ordemServicoServicoRepository.save(ordemServicoServico);
                    ordemSalva.getServicos().add(ordemServicoServico);
                }
            }
        }

        // 5. Adicionar peças
        if (ordemDTO.getPecas() != null && !ordemDTO.getPecas().isEmpty()) {
            for (OrdemServicoCreateComplexDTO.PecaSelecionada pecaSel : ordemDTO.getPecas()) {
                if (pecaSel.getPeca() != null && pecaSel.getPeca().getId() != null) {
                    Long pecaId = pecaSel.getPeca().getId();
                    Integer quantidade = pecaSel.getQuantidade() != null ? pecaSel.getQuantidade() : 1;
                    
                    Peca peca = pecaRepository.findById(pecaId)
                            .orElseThrow(() -> new ResourceNotFoundException("Peça não encontrada com ID: " + pecaId));
                    
                    // Validar estoque
                    if (peca.getQuantidade() < quantidade) {
                        throw new IllegalArgumentException("Estoque insuficiente para a peça: " + peca.getDescricao() + 
                                ". Disponível: " + peca.getQuantidade() + ", Solicitado: " + quantidade);
                    }
                    
                    OrdemServicoPeca ordemServicoPeca = new OrdemServicoPeca();
                    ordemServicoPeca.setOrdemServico(ordemSalva);
                    ordemServicoPeca.setPeca(peca);
                    ordemServicoPeca.setQuantidade(quantidade);
                    ordemServicoPeca.setValor(peca.getValor());
                    
                    ordemServicoPecaRepository.save(ordemServicoPeca);
                    ordemSalva.getPecas().add(ordemServicoPeca);
                }
            }
        }

        // 6. Calcular valor total
        calcularValorTotal(ordemSalva.getId());

        ordemServicoRepository.save(ordemSalva);
        
        // 7. Gerar PDF da ordem de serviço
        OrdemServico ordemCompleta = getOrdemServicoCompletoById(ordemSalva.getId());
        gerarPDFOrdem(ordemCompleta);
        
        // Retornar ordem com relações inicializadas (evita LazyInitializationException)
        return ordemCompleta;
    }
}