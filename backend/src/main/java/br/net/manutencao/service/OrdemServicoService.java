package br.net.manutencao.service;

import br.net.manutencao.DTO.OrdemServicoCreateDTO;
import br.net.manutencao.DTO.OrdemServicoCreateComplexDTO;
import br.net.manutencao.DTO.BicicletaComItensDTO;
import br.net.manutencao.DTO.ItemServicoDTO;
import br.net.manutencao.DTO.ItemPecaDTO;
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

    //@Autowired
    //private ItemServicoRepository ItemServicoRepository;

    @Autowired
    private ItemServicoRepository itemServicoRepository; // Verifique se o nome é este mesmo

    @Autowired
    private ItemPecaRepository ItemPecaRepository;

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
    public List<OrdemServico> getFaturamentoDiario() {
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
        
        ordem.getBicicletasComItens().forEach(bike -> {
        bike.setOrdemServico(ordem);
        bike.getServicos().forEach(s -> s.setBicicletaItem(bike));
        bike.getPecas().forEach(p -> p.setBicicletaItem(bike));
        });

        /*ordem.getServicos().size(); // inicializa lista
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
        }); */
        
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
        //ordem.getServicos().size();
       // ordem.getPecas().size();
        if (ordem.getBicicletasComItens() != null) {
            ordem.getBicicletasComItens().forEach(bike -> {
            if (bike.getServicos() != null) bike.getServicos().size();
            if (bike.getPecas() != null) bike.getPecas().size();
            });
        }
        
        // Recalcular valor
        ordem.calcularValorTotal();
        
        // Persistir
        ordemServicoRepository.save(ordem);
        
        return ordem;
    }

    /**
     * Método auxiliar para gerar PDF da ordem de serviço
     * Log de erros de PDF não bloqueiam a transação a
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

    @Transactional
    public OrdemServico adicionarServico(Long bicicletaItemId, Long servicoId, Integer quantidade) {
        // 1. Buscar a "Bicicleta com Itens" específica
        // Presumindo que você tenha o BicicletaComItensRepository injetado
        BicicletaComItens bikeItem = bicicletaComItensRepository.findById(bicicletaItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item de bicicleta não encontrado com ID: " + bicicletaItemId));

        // 2. Buscar o serviço no catálogo
        Servico servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com ID: " + servicoId));
        
        // 3. Verificar se o serviço já existe NESTA bicicleta
        Optional<ItemServico> existing = bikeItem.getServicos().stream()
                .filter(is -> is.getServico().getId().equals(servicoId))
                .findFirst();
        
        if (existing.isPresent()) {
            // Atualizar quantidade se já existir na bike
            ItemServico itemExistente = existing.get();
            itemExistente.setQuantidade(itemExistente.getQuantidade() + quantidade);
            // O valor pode ser atualizado caso o preço do catálogo tenha mudado, ou manter o antigo
            itemServicoRepository.save(itemExistente);
        } else {
            // Criar novo ItemServico vinculado à BicicletaComItens
            ItemServico novoItem = new ItemServico();
            novoItem.setBicicletaItem(bikeItem); // Vínculo FK bicicleta_item_id
            novoItem.setServico(servico);
            novoItem.setQuantidade(quantidade);
            novoItem.setValor(servico.getValor());
            novoItem.setDescricao(servico.getDescricao());
            
            itemServicoRepository.save(novoItem);
            bikeItem.getServicos().add(novoItem);
        }
        
        // 4. Recuperar a Ordem de Serviço pai para atualizar o valor total
        OrdemServico ordem = bikeItem.getOrdemServico();
        
        // ⭐ CRÍTICO: Recalcular o valor total da Ordem toda
        // Como você implementou calcularValorTotal() na Entidade OrdemServico, use-o:
        ordem.setValorTotal(ordem.calcularValorTotal());
        ordemServicoRepository.save(ordem);
        
        // Retornar ordem com relações inicializadas (evita LazyInitializationException no PDF/Controller)
        return getOrdemServicoCompletoById(ordem.getId());
    }

    @Transactional
    public OrdemServico adicionarPeca(Long bicicletaItemId, Long pecaId, Integer quantidade) {
        // 1. Procurar a "Bicicleta com Itens" específica (o novo "pai" dos itens)
        BicicletaComItens bikeItem = bicicletaComItensRepository.findById(bicicletaItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item de bicicleta não encontrado com ID: " + bicicletaItemId));

        // 2. Procurar a peça no catálogo/estoque
        Peca peca = pecaRepository.findById(pecaId)
                .orElseThrow(() -> new ResourceNotFoundException("Peça não encontrada com ID: " + pecaId));
        
        // 3. Verificar estoque antes de qualquer operação
        if (peca.getQuantidade() < quantidade) {
            throw new IllegalArgumentException("Estoque insuficiente para a peça: " + peca.getDescricao() + 
                    ". Disponível: " + peca.getQuantidade() + ", Solicitado: " + quantidade);
        }
        
        // 4. Verificar se a peça já existe NESTA bicicleta específica
        Optional<ItemPeca> existing = bikeItem.getPecas().stream()
                .filter(ip -> ip.getPeca().getId().equals(pecaId))
                .findFirst();
        
        if (existing.isPresent()) {
            // Atualizar quantidade se já existir na bike
            ItemPeca itemExistente = existing.get();
            itemExistente.setQuantidade(itemExistente.getQuantidade() + quantidade);
            ItemPecaRepository.save(itemExistente);
        } else {
            // Criar novo ItemPeca vinculado à BicicletaComItens
            ItemPeca novoItem = new ItemPeca();
            novoItem.setBicicletaItem(bikeItem); // Vínculo FK bicicleta_item_id (ESSENCIAL)
            novoItem.setPeca(peca);
            novoItem.setQuantidade(quantidade);
            novoItem.setValor(peca.getValor());
            novoItem.setDescricao(peca.getDescricao());
            
            ItemPecaRepository.save(novoItem);
            bikeItem.getPecas().add(novoItem);
        }
        
        // 5. Atualizar o estoque da peça no catálogo
        peca.setQuantidade(peca.getQuantidade() - quantidade);
        pecaRepository.save(peca);
        
        // 6. Recuperar a Ordem de Serviço pai para atualizar o valor total
        OrdemServico ordem = bikeItem.getOrdemServico();
        
        // ⭐ CRÍTICO: Recalcular o valor total usando o novo método da Entidade
        ordem.setValorTotal(ordem.calcularValorTotal());
        ordemServicoRepository.save(ordem);
        
        // Retornar ordem completa para o frontend/PDF
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
    public OrdemServico removerServico(Long itemServicoId) {
        // 1. Buscar o item específico que será removido
        ItemServico itemServico = itemServicoRepository.findById(itemServicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Item de serviço não encontrado com ID: " + itemServicoId));

        // 2. Identificar a Bicicleta e a Ordem de Serviço pai antes de deletar
        BicicletaComItens bikeItem = itemServico.getBicicletaItem();
        if (bikeItem == null) {
            throw new IllegalStateException("O item de serviço não está vinculado a nenhuma bicicleta.");
        }
        
        OrdemServico ordem = bikeItem.getOrdemServico();

        // 3. Remover a referência da lista da bicicleta (importante para manter o estado em memória)
        bikeItem.getServicos().remove(itemServico);

        // 4. Deletar o registro do banco de dados
        itemServicoRepository.delete(itemServico);

        // 5. Recalcular o valor total da Ordem de Serviço
        // O método calcularValorTotal() na entidade OrdemServico já percorre todas as bikes e itens restantes
        ordem.setValorTotal(ordem.calcularValorTotal());
        
        // 6. Salvar a ordem atualizada
        ordemServicoRepository.save(ordem);

        // Retornar a ordem completa inicializada para o frontend
        return getOrdemServicoCompletoById(ordem.getId());
    }

    // Método para remover peça da ordem (e devolver ao estoque)
    @Transactional
    public OrdemServico removerPeca(Long itemPecaId) {
        // 1. Buscar o item de peça específico que será removido
        ItemPeca itemPeca = ItemPecaRepository.findById(itemPecaId)
                .orElseThrow(() -> new ResourceNotFoundException("Item de peça não encontrado com ID: " + itemPecaId));

        // 2. Identificar a Peça (catálogo), a Bicicleta e a Ordem pai
        Peca pecaCatalogo = itemPeca.getPeca();
        BicicletaComItens bikeItem = itemPeca.getBicicletaItem();
        
        if (bikeItem == null) {
            throw new IllegalStateException("O item de peça não está vinculado a nenhuma bicicleta.");
        }
        
        OrdemServico ordem = bikeItem.getOrdemServico();

        // 3. Devolver a quantidade ao estoque no catálogo de peças
        if (pecaCatalogo != null) {
            pecaCatalogo.setQuantidade(pecaCatalogo.getQuantidade() + itemPeca.getQuantidade());
            pecaRepository.save(pecaCatalogo);
        }

        // 4. Remover a referência da lista da bicicleta (memória)
        bikeItem.getPecas().remove(itemPeca);

        // 5. Deletar o registro do banco de dados
        ItemPecaRepository.delete(itemPeca);

        // 6. Recalcular o valor total da Ordem de Serviço
        // O seu método calcularValorTotal() percorre todas as bikes e itens atualizados
        ordem.setValorTotal(ordem.calcularValorTotal());
        
        // 7. Salvar a ordem com o novo valor total
        ordemServicoRepository.save(ordem);

        // Retornar a ordem completa com as relações inicializadas
        return getOrdemServicoCompletoById(ordem.getId());
    }

    // // ✅ NOVO MÉTODO: Vincular bicicletas com itens aninhados (serviços e peças por bike)
    @Transactional
    private void vincularBicicletasComItens(OrdemServico ordem, List<BicicletaComItensDTO> bicicletasData) {
        if (bicicletasData == null || bicicletasData.isEmpty()) {
            return;
        }

        for (BicicletaComItensDTO bikeData : bicicletasData) {
            // 1. Buscar ou criar a entidade Bicicleta (o cadastro físico da bike)
            Bicicleta bicicleta;
            if (bikeData.getId() != null) {
                bicicleta = bicicletaRepository.findById(bikeData.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bicicleta não encontrada: " + bikeData.getId()));
            } else {
                bicicleta = new Bicicleta();
                bicicleta.setMarca(bikeData.getMarca());
                bicicleta.setModelo(bikeData.getModelo());
                bicicleta.setCor(bikeData.getCor());
                bicicleta.setTamanhoAro(bikeData.getTamanhoAro());
                // Vincular ao cliente da ordem
                bicicleta.setCliente(ordem.getCliente());
                bicicleta = bicicletaRepository.save(bicicleta);
            }

            // 2. Criar a entidade intermediária BicicletaComItens (o "pacote" de manutenção)
            BicicletaComItens bikeItem = new BicicletaComItens();
            bikeItem.setOrdemServico(ordem);

            // Em vez de bikeItem.setBicicleta(bicicleta), copiamos os dados
            // Já que o seu modelo BicicletaComItens armazena os dados da bike diretamente
            bikeItem.setMarca(bicicleta.getMarca());
            bikeItem.setModelo(bicicleta.getModelo());
            bikeItem.setCor(bicicleta.getCor());
            bikeItem.setTamanhoAro(bicicleta.getTamanhoAro());

            // Salvar para gerar o ID
            bikeItem = bicicletaComItensRepository.save(bikeItem);
            ordem.getBicicletasComItens().add(bikeItem);
            
            // Salvar primeiro para gerar o ID que será usado como FK pelos itens
            bikeItem = bicicletaComItensRepository.save(bikeItem);
            ordem.getBicicletasComItens().add(bikeItem);

            // 3. Adicionar serviços a ESTA bicicleta específica
            if (bikeData.getServicos() != null) {
                for (ItemServicoDTO servicoData : bikeData.getServicos()) {
                    if (servicoData.getServico() != null && servicoData.getServico().getId() != null) {
                        Servico servico = servicoRepository.findById(servicoData.getServico().getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado: " + servicoData.getServico().getId()));
                        
                        ItemServico itemServico = new ItemServico();
                        itemServico.setBicicletaItem(bikeItem); // Vínculo correto
                        itemServico.setServico(servico);
                        itemServico.setDescricao(servico.getDescricao());
                        itemServico.setQuantidade(servicoData.getQuantidade() != null ? servicoData.getQuantidade() : 1);
                        itemServico.setValor(servico.getValor());
                        
                        itemServicoRepository.save(itemServico);
                        bikeItem.getServicos().add(itemServico);
                    }
                }
            }

            // 4. Adicionar peças a ESTA bicicleta específica
            if (bikeData.getPecas() != null) {
                for (ItemPecaDTO pecaData : bikeData.getPecas()) {
                    if (pecaData.getPeca() != null && pecaData.getPeca().getId() != null) {
                        Peca peca = pecaRepository.findById(pecaData.getPeca().getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Peça não encontrada: " + pecaData.getPeca().getId()));
                        
                        // Validar estoque
                        Integer qtd = pecaData.getQuantidade() != null ? pecaData.getQuantidade() : 1;
                        if (peca.getQuantidade() < qtd) {
                            throw new IllegalArgumentException("Estoque insuficiente para a peça: " + peca.getDescricao() + 
                                ". Disponível: " + peca.getQuantidade() + ", Solicitado: " + qtd);
                        }
                        
                        ItemPeca itemPeca = new ItemPeca();
                        itemPeca.setBicicletaItem(bikeItem); // Vínculo correto
                        itemPeca.setPeca(peca);
                        itemPeca.setDescricao(peca.getDescricao());
                        itemPeca.setQuantidade(qtd);
                        itemPeca.setValor(peca.getValor());
                        
                        ItemPecaRepository.save(itemPeca);
                        bikeItem.getPecas().add(itemPeca);
                        
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

        // ✅ NOVO: Criar ItemServico vinculado à BicicletaComItens
        ItemServico osServico = new ItemServico();
        osServico.setBicicletaItem(bikeItem);
        osServico.setServico(servico);
        osServico.setDescricao(servico.getDescricao()); // Adicionado para manter histórico
        osServico.setQuantidade(quantidade);
        osServico.setValor(servico.getValor());

        // ⚡ CORREÇÃO AQUI: Use a variável injetada (minúscula) e não o tipo da classe
        itemServicoRepository.save(osServico); 
        
        bikeItem.getServicos().add(osServico);
        System.out.println("     ✓ Serviço adicionado: " + servico.getDescricao() + " (x" + quantidade + ")");
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

        // ✅ NOVO: Criar ItemPeca com BicicletaComItens
        ItemPeca osPeca = new ItemPeca();
        osPeca.setBicicletaItem(bikeItem);
        osPeca.setPeca(peca);
        osPeca.setQuantidade(quantidade);
        osPeca.setValor(peca.getValor());

        ItemPecaRepository.save(osPeca);
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

        // 2. Definir dados básicos da Ordem
        novaOrdem.setCliente(cliente);
        novaOrdem.setObservacoes(ordemDTO.getObservacoes() != null ? ordemDTO.getObservacoes() : "");
        novaOrdem.setDataEntrada(LocalDateTime.now());
        
        LocalDateTime dataPrevisao = ordemDTO.getDataPrevisaoSaida() != null 
                ? ordemDTO.getDataPrevisaoSaida() 
                : LocalDateTime.now().plusDays(3);
        novaOrdem.setDataPrevisaoSaida(dataPrevisao);
        
        novaOrdem.setStatus(StatusOrdem.ABERTA);
        novaOrdem.setValorTotal(BigDecimal.ZERO);
        novaOrdem.setExibirAviso30Dias(ordemDTO.getExibirAviso30Dias() != null ? ordemDTO.getExibirAviso30Dias() : false);

        // Salvar a ordem primeiro para ter o ID
        final OrdemServico ordemSalva = ordemServicoRepository.save(novaOrdem);

        // ✅ NOVA LÓGICA: Processar a lista de bicicletas que vem no DTO
        if (ordemDTO.getBicicletas() != null && !ordemDTO.getBicicletas().isEmpty()) {
            for (OrdemServicoCreateComplexDTO.BicicletaEntradaData bikeData : ordemDTO.getBicicletas()) {
                
                // 1. Criar o container para cada bicicleta da lista
                BicicletaComItens container = new BicicletaComItens();
                container.setOrdemServico(ordemSalva);
                container.setMarca(bikeData.getMarca());
                container.setModelo(bikeData.getModelo());
                container.setCor(bikeData.getCor());
                container.setTamanhoAro(bikeData.getTamanhoAro());
                
                // Salvar o container para vincular os itens abaixo
                final BicicletaComItens containerSalvo = bicicletaComItensRepository.save(container);

                // 2. Processar SERVIÇOS desta bicicleta específica
                if (bikeData.getServicos() != null) {
                    for (OrdemServicoCreateComplexDTO.ServicoSelecionado servSel : bikeData.getServicos()) {
                        Long servicoId = servSel.getServico().getId();
                        Servico servico = servicoRepository.findById(servicoId)
                                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado: " + servicoId));

                        ItemServico item = new ItemServico();
                        item.setBicicletaItem(containerSalvo); // Vínculo correto
                        item.setServico(servico);
                        item.setDescricao(servico.getDescricao());
                        item.setQuantidade(servSel.getQuantidade() != null ? servSel.getQuantidade() : 1);
                        item.setValor(servico.getValor());

                        itemServicoRepository.save(item);
                        containerSalvo.getServicos().add(item);
                    }
                }

                // 3. Processar PEÇAS desta bicicleta específica
                if (bikeData.getPecas() != null) {
                    for (OrdemServicoCreateComplexDTO.PecaSelecionada pecaSel : bikeData.getPecas()) {
                        Long pecaId = pecaSel.getPeca().getId();
                        Peca peca = pecaRepository.findById(pecaId)
                                .orElseThrow(() -> new ResourceNotFoundException("Peça não encontrada: " + pecaId));

                        int qtd = pecaSel.getQuantidade() != null ? pecaSel.getQuantidade() : 1;
                        
                        // Validação de estoque básica
                        if (peca.getQuantidade() < qtd) {
                            throw new IllegalArgumentException("Estoque insuficiente para a peça: " + peca.getDescricao());
                        }

                        ItemPeca itemPeca = new ItemPeca();
                        itemPeca.setBicicletaItem(containerSalvo); // Vínculo correto
                        itemPeca.setPeca(peca);
                        itemPeca.setDescricao(peca.getDescricao());
                        itemPeca.setQuantidade(qtd);
                        itemPeca.setValor(peca.getValor());

                        ItemPecaRepository.save(itemPeca);
                        containerSalvo.getPecas().add(itemPeca);

                        // Atualizar estoque
                        peca.setQuantidade(peca.getQuantidade() - qtd);
                        pecaRepository.save(peca);
                    }
                }
                
                // Adicionar o container pronto à ordem
                ordemSalva.getBicicletasComItens().add(containerSalvo);
            }
        }

        // 6. Calcular valor total usando a lógica da entidade
        ordemSalva.setValorTotal(ordemSalva.calcularValorTotal());
        ordemServicoRepository.save(ordemSalva);
        
        // 7. Finalização e PDF
        OrdemServico ordemCompleta = getOrdemServicoCompletoById(ordemSalva.getId());
        gerarPDFOrdem(ordemCompleta);
        
        return ordemCompleta;
    }
}