package br.net.manutencao.service;

import br.net.manutencao.DTO.OrdemServicoCreateDTO;
import br.net.manutencao.DTO.OrdemServicoCreateComplexDTO;
import br.net.manutencao.DTO.BicicletaComItensDTO;
import br.net.manutencao.DTO.OrdemServicoServicoDTO;
import br.net.manutencao.DTO.OrdemServicoPecaDTO;
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
import java.util.ArrayList;
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

    @Autowired
    private BicicletaComItensRepository bicicletaComItensRepository;

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
        
        // ✅ Inicializar bicicletas (1:N)
        if (ordem.getBicicletas() != null) {
            ordem.getBicicletas().forEach(bike -> {
                bike.getMarca(); // Inicializar cada bicicleta
            });
        }
        
        ordem.getServicos().size(); // inicializa lista
        ordem.getPecas().size(); // inicializa lista
        
        // ✅ Inicializar bicicletaItem de cada serviço
        ordem.getServicos().forEach(s -> {
            if (s.getServico() != null) s.getServico().getId();
            if (s.getBicicletaItem() != null) s.getBicicletaItem().getId();
        });
        
        // ✅ Inicializar bicicletaItem de cada peça
        ordem.getPecas().forEach(p -> {
            if (p.getPeca() != null) p.getPeca().getId();
            if (p.getBicicletaItem() != null) p.getBicicletaItem().getId();
        });
        
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

        // Buscar bicicleta (primeira do DTO)
        Bicicleta bicicleta = bicicletaRepository.findById(ordemDTO.getBicicletaId())
                .orElseThrow(() -> new ResourceNotFoundException("Bicicleta não encontrada com ID: " + ordemDTO.getBicicletaId()));

        novaOrdem.setCliente(cliente);
        // Adicionar bicicleta à lista (agora é 1:N)
        if (novaOrdem.getBicicletas() != null) {
            novaOrdem.setBicicletas(new ArrayList<>());
        }
        novaOrdem.getBicicletas().add(bicicleta);
        bicicleta.setOrdemServico(novaOrdem);
        
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
            // NOTA: Para a nova arquitetura, use criarOrdemServicoComMultiplasBicicletas
            // ordemServicoServico.setOrdemServico(ordem); // REMOVIDO - use BicicletaComItens
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
            // NOTA: Para a nova arquitetura, use criarOrdemServicoComMultiplasBicicletas
            // ordemServicoPeca.setOrdemServico(ordem); // REMOVIDO - use BicicletaComItens
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

    // ✅ NOVO MÉTODO: Vincular bicicletas com itens aninhados (serviços e peças por bike)
    @Transactional
    private void vincularBicicletasComItens(OrdemServico ordem, List<BicicletaComItensDTO> bicicletasData) {
        if (bicicletasData == null || bicicletasData.isEmpty()) {
            return;
        }

        for (BicicletaComItensDTO bikeData : bicicletasData) {
            // Buscar ou criar bicicleta
            Bicicleta bicicleta;
            if (bikeData.getId() != null) {
                bicicleta = bicicletaRepository.findById(bikeData.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bicicleta não encontrada: " + bikeData.getId()));
            } else {
                // Nova bicicleta
                bicicleta = new Bicicleta();
                bicicleta.setMarca(bikeData.getMarca());
                bicicleta.setModelo(bikeData.getModelo());
                bicicleta.setCor(bikeData.getCor());
                bicicleta.setTamanhoAro(bikeData.getTamanhoAro());
                bicicleta = bicicletaRepository.save(bicicleta);
            }

            // Adicionar bicicleta à ordem
            if (!ordem.getBicicletas().contains(bicicleta)) {
                ordem.getBicicletas().add(bicicleta);
            }

            // Adicionar serviços desta bicicleta
            if (bikeData.getServicos() != null) {
                for (OrdemServicoServicoDTO servicoData : bikeData.getServicos()) {
                    if (servicoData.getServico() != null && servicoData.getServico().getId() != null) {
                        Servico servico = servicoRepository.findById(servicoData.getServico().getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado: " + servicoData.getServico().getId()));
                        
                        OrdemServicoServico osServico = new OrdemServicoServico();
                        // NOTA: Para nova arquitetura com BicicletaComItens, use criarOrdemServicoComMultiplasBicicletas
                        // osServico.setOrdemServico(ordem); // REMOVIDO
                        // osServico.setBicicleta(bicicleta); // REMOVIDO
                        osServico.setServico(servico);
                        osServico.setQuantidade(servicoData.getQuantidade() != null ? servicoData.getQuantidade() : 1);
                        osServico.setValor(servico.getValor());
                        
                        ordemServicoServicoRepository.save(osServico);
                        ordem.getServicos().add(osServico);
                    }
                }
            }

            // Adicionar peças desta bicicleta
            if (bikeData.getPecas() != null) {
                for (OrdemServicoPecaDTO pecaData : bikeData.getPecas()) {
                    if (pecaData.getPeca() != null && pecaData.getPeca().getId() != null) {
                        Peca peca = pecaRepository.findById(pecaData.getPeca().getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Peça não encontrada: " + pecaData.getPeca().getId()));
                        
                        // Validar estoque
                        Integer qtd = pecaData.getQuantidade() != null ? pecaData.getQuantidade() : 1;
                        if (peca.getQuantidade() < qtd) {
                            throw new IllegalArgumentException("Estoque insuficiente para a peça: " + peca.getDescricao() + 
                                ". Disponível: " + peca.getQuantidade() + ", Solicitado: " + qtd);
                        }
                        
                        OrdemServicoPeca osPeca = new OrdemServicoPeca();
                        // NOTA: Para nova arquitetura com BicicletaComItens, use criarOrdemServicoComMultiplasBicicletas
                        // osPeca.setOrdemServico(ordem); // REMOVIDO
                        // osPeca.setBicicleta(bicicleta); // REMOVIDO
                        osPeca.setPeca(peca);
                        osPeca.setQuantidade(qtd);
                        osPeca.setValor(peca.getValor());
                        
                        ordemServicoPecaRepository.save(osPeca);
                        ordem.getPecas().add(osPeca);
                        
                        // Atualizar estoque
                        peca.setQuantidade(peca.getQuantidade() - qtd);
                        pecaRepository.save(peca);
                    }
                }
            }
        }
    }

    // Método para buscar ordens por período
    @Transactional(readOnly = true)
    public List<OrdemServico> buscarOrdensPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        return ordemServicoRepository.findByPeriodo(dataInicio, dataFim);
    }

    // ✅ NOVO MÉTODO PRINCIPAL: Criar ordem com múltiplas bicicletas (1:N)
    @Transactional
    public OrdemServico criarOrdemServicoComMultiplasBicicletas(Map<String, Object> payload) {
        System.out.println("🔧 Iniciando criação de ordem com múltiplas bicicletas...");
        
        // Extrair cliente do payload
        Map<String, Object> clienteData = (Map<String, Object>) payload.get("cliente");
        if (clienteData == null) {
            throw new IllegalArgumentException("❌ Cliente é obrigatório no payload");
        }

        Number clienteId = (Number) clienteData.get("id");
        if (clienteId == null) {
            throw new IllegalArgumentException("❌ ID do cliente é obrigatório");
        }

        Cliente cliente = clienteRepository.findById(clienteId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("❌ Cliente não encontrado com ID: " + clienteId));

        // Criar ordem base
        OrdemServico novaOrdem = new OrdemServico();
        novaOrdem.setCliente(cliente);
        novaOrdem.setObservacoes(payload.get("observacoes") != null ? (String) payload.get("observacoes") : "");
        novaOrdem.setDataEntrada(LocalDateTime.now());

        // Data de previsão
        LocalDateTime dataPrevisao = LocalDateTime.now().plusDays(3);
        if (payload.get("dataPrevisaoSaida") != null) {
            dataPrevisao = LocalDateTime.parse((String) payload.get("dataPrevisaoSaida"));
        }
        novaOrdem.setDataPrevisaoSaida(dataPrevisao);

        novaOrdem.setStatus(StatusOrdem.ABERTA);
        novaOrdem.setValorTotal(BigDecimal.ZERO);
        novaOrdem.setExibirAviso30Dias(payload.get("exibirAviso30Dias") != null ? 
            (Boolean) payload.get("exibirAviso30Dias") : false);

        // Salvar ordem base
        OrdemServico ordemSalva = ordemServicoRepository.save(novaOrdem);
        System.out.println("✅ Ordem #" + ordemSalva.getId() + " criada");

        // Processar bicicletas com itens
        List<Map<String, Object>> bicicletasData = (List<Map<String, Object>>) payload.get("bicicletas");
        if (bicicletasData != null && !bicicletasData.isEmpty()) {
            System.out.println("🚲 Processando " + bicicletasData.size() + " bicicleta(s)...");
            
            for (Map<String, Object> bikeData : bicicletasData) {
                processarBicicletaComItens(ordemSalva, bikeData);
            }
        }

        // ✅ VÍNCULO OBRIGATÓRIO: Antes de persistir, vincular todas as bicicletas com itens
        if (ordemSalva.getBicicletasComItens() != null) {
            ordemSalva.getBicicletasComItens().forEach(bike -> {
                bike.setOrdemServico(ordemSalva);
                if (bike.getServicos() != null) {
                    bike.getServicos().forEach(s -> s.setBicicletaItem(bike));
                }
                if (bike.getPecas() != null) {
                    bike.getPecas().forEach(p -> p.setBicicletaItem(bike));
                }
            });
        }

        // Calcular valor total e persistir
        atualizarValorTotal(ordemSalva);
        System.out.println("💰 Valor total calculado: " + ordemSalva.getValorTotal());

        // Gerar PDF
        OrdemServico ordemCompleta = getOrdemServicoCompletoById(ordemSalva.getId());
        gerarPDFOrdem(ordemCompleta);

        System.out.println("✅ Ordem #" + ordemSalva.getId() + " criada com sucesso!");
        return ordemCompleta;
    }

    // ✅ MÉTODO AUXILIAR: Processar bicicleta individual com itens
    @Transactional
    private void processarBicicletaComItens(OrdemServico ordem, Map<String, Object> bikeData) {
        // ✅ NOVO: Criar BicicletaComItens ao invés de usar Bicicleta diretamente
        BicicletaComItens bikeItem = new BicicletaComItens();
        
        // Se possui ID, é referência a bicicleta do catálogo
        Object bikeIdObj = bikeData.get("id");
        if (bikeIdObj != null && !(bikeIdObj instanceof String && ((String) bikeIdObj).isEmpty())) {
            Long bikeId = bikeIdObj instanceof Number ? ((Number) bikeIdObj).longValue() : Long.parseLong(bikeIdObj.toString());
            Bicicleta bicicletaCatalogo = bicicletaRepository.findById(bikeId)
                .orElseThrow(() -> new ResourceNotFoundException("❌ Bicicleta não encontrada: " + bikeId));
            
            // Copiar dados da bicicleta do catálogo
            bikeItem.setMarca(bicicletaCatalogo.getMarca());
            bikeItem.setModelo(bicicletaCatalogo.getModelo());
            bikeItem.setCor(bicicletaCatalogo.getCor());
            bikeItem.setTamanhoAro(bicicletaCatalogo.getTamanhoAro());
            System.out.println("  ✓ Bicicleta do catálogo referenciada: " + bicicletaCatalogo.getMarca() + " " + bicicletaCatalogo.getModelo());
        } else {
            // Nova bicicleta (entrada manual)
            bikeItem.setMarca((String) bikeData.get("marca"));
            bikeItem.setModelo((String) bikeData.get("modelo"));
            bikeItem.setCor((String) bikeData.get("cor"));
            Number araObj = (Number) bikeData.get("tamanhoAro");
            Integer tamanho = araObj != null ? araObj.intValue() : 0;
            bikeItem.setTamanhoAro(tamanho);
            System.out.println("  ✓ Nova bicicleta criada (manual): " + bikeItem.getMarca() + " " + bikeItem.getModelo());
        }

        // ✅ OBRIGATÓRIO: Vincular a BicicletaComItens à ordem
        bikeItem.setOrdemServico(ordem);
        
        // Salvar BicicletaComItens
        BicicletaComItens bikeItemSalva = bicicletaComItensRepository.save(bikeItem);

        // Processar serviços para esta bicicleta
        List<Map<String, Object>> servicosData = (List<Map<String, Object>>) bikeData.get("servicos");
        if (servicosData != null) {
            for (Map<String, Object> servicoData : servicosData) {
                processarServicoParaBicicletaComItens(bikeItemSalva, servicoData);
            }
        }

        // Processar peças para esta bicicleta
        List<Map<String, Object>> pecasData = (List<Map<String, Object>>) bikeData.get("pecas");
        if (pecasData != null) {
            for (Map<String, Object> pecaData : pecasData) {
                processarPecaParaBicicletaComItens(bikeItemSalva, pecaData);
            }
        }
    }

    // ✅ MÉTODO AUXILIAR: Processar serviço para BicicletaComItens
    @Transactional
    private void processarServicoParaBicicletaComItens(BicicletaComItens bikeItem, Map<String, Object> servicoData) {
        Map<String, Object> servicoObj = (Map<String, Object>) servicoData.get("servico");
        if (servicoObj == null) {
            return;
        }

        Number servicoId = (Number) servicoObj.get("id");
        if (servicoId == null) {
            return;
        }

        Servico servico = servicoRepository.findById(servicoId.longValue())
            .orElseThrow(() -> new ResourceNotFoundException("❌ Serviço não encontrado: " + servicoId));

        Number qtdObj = (Number) servicoData.get("quantidade");
        Integer quantidade = qtdObj != null ? qtdObj.intValue() : 1;

        // ✅ NOVO: Criar OrdemServicoServico com BicicletaComItens
        OrdemServicoServico osServico = new OrdemServicoServico();
        osServico.setBicicletaItem(bikeItem);
        osServico.setServico(servico);
        osServico.setQuantidade(quantidade);
        osServico.setValor(servico.getValor());

        ordemServicoServicoRepository.save(osServico);
        bikeItem.getServicos().add(osServico);
        System.out.println("    ✓ Serviço adicionado: " + servico.getDescricao() + " (x" + quantidade + ")");
    }

    // ✅ MÉTODO AUXILIAR: Processar peça para BicicletaComItens
    @Transactional
    private void processarPecaParaBicicletaComItens(BicicletaComItens bikeItem, Map<String, Object> pecaData) {
        Map<String, Object> pecaObj = (Map<String, Object>) pecaData.get("peca");
        if (pecaObj == null) {
            return;
        }

        Number pecaId = (Number) pecaObj.get("id");
        if (pecaId == null) {
            return;
        }

        Peca peca = pecaRepository.findById(pecaId.longValue())
            .orElseThrow(() -> new ResourceNotFoundException("❌ Peça não encontrada: " + pecaId));

        Number qtdObj = (Number) pecaData.get("quantidade");
        Integer quantidade = qtdObj != null ? qtdObj.intValue() : 1;

        // Validar estoque
        if (peca.getQuantidade() < quantidade) {
            throw new IllegalArgumentException("❌ Estoque insuficiente para a peça: " + peca.getDescricao() + 
                ". Disponível: " + peca.getQuantidade() + ", Solicitado: " + quantidade);
        }

        // ✅ NOVO: Criar OrdemServicoPeca com BicicletaComItens
        OrdemServicoPeca osPeca = new OrdemServicoPeca();
        osPeca.setBicicletaItem(bikeItem);
        osPeca.setPeca(peca);
        osPeca.setQuantidade(quantidade);
        osPeca.setValor(peca.getValor());

        ordemServicoPecaRepository.save(osPeca);
        bikeItem.getPecas().add(osPeca);

        // Atualizar estoque
        peca.setQuantidade(peca.getQuantidade() - quantidade);
        pecaRepository.save(peca);
        System.out.println("    ✓ Peça adicionada: " + peca.getDescricao() + " (x" + quantidade + ")");
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

        // 2. Buscar e validar bicicleta (agora será adicionada à lista)
        List<Bicicleta> bicicletas = new ArrayList<>();
        if (ordemDTO.getBicicleta() != null && ordemDTO.getBicicleta().getId() != null) {
            Bicicleta bike = bicicletaRepository.findById(ordemDTO.getBicicleta().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bicicleta não encontrada com ID: " + ordemDTO.getBicicleta().getId()));
            bicicletas.add(bike);
        }

        // 3. Definir dados básicos
        novaOrdem.setCliente(cliente);
        // Adicionar bicicletas à ordem (1:N)
        for (Bicicleta bike : bicicletas) {
            novaOrdem.getBicicletas().add(bike);
            bike.setOrdemServico(novaOrdem);
        }
        
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
                    // NOTA: Para nova arquitetura com BicicletaComItens, use criarOrdemServicoComMultiplasBicicletas
                    // ordemServicoServico.setOrdemServico(ordemSalva); // REMOVIDO
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
                    // NOTA: Para nova arquitetura com BicicletaComItens, use criarOrdemServicoComMultiplasBicicletas
                    // ordemServicoPeca.setOrdemServico(ordemSalva); // REMOVIDO
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