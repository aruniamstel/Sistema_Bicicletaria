package br.net.manutencao.service;

import br.net.manutencao.model.*;
import br.net.manutencao.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExportarService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private BicicletaRepository bicicletaRepository;

    @Autowired
    private PecaRepository pecaRepository;

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private OrdemServicoRepository ordemServicoRepository;

    @Autowired
    private BicicletaComItensRepository bicicletaComItensRepository;

    private static final String CHARSET_UTF8 = "UTF-8";
    private static final String SEPARADOR = ";";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Gera CSV com todos os clientes
     */
    @Transactional(readOnly = true)
    public String gerarClientesCSV() {
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append(String.format("ID%sNome%sTelefone%sEndereço%sInstagram\n",
                SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR));

        // Dados
        List<Cliente> clientes = clienteRepository.findAll();
        for (Cliente cliente : clientes) {
            csv.append(String.format("%d%s%s%s%s%s%s%s%s\n",
                    cliente.getId(),
                    SEPARADOR,
                    escaparCSV(cliente.getNome()),
                    SEPARADOR,
                    escaparCSV(cliente.getTelefone()),
                    SEPARADOR,
                    escaparCSV(cliente.getEndereco() != null ? cliente.getEndereco() : ""),
                    SEPARADOR,
                    escaparCSV(cliente.getInstagram() != null ? cliente.getInstagram() : "")
            ));
        }

        return csv.toString();
    }

    /**
     * Gera CSV com todas as bicicletas
     */
    @Transactional(readOnly = true)
    public String gerarBicicletasCSV() {
        StringBuilder csv = new StringBuilder();

        // Header
        csv.append(String.format("ID%sMarca%sModelo%sAro%sCor%sCliente\n",
                SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR));

        // Dados
        List<Bicicleta> bicicletas = bicicletaRepository.findAll();
        for (Bicicleta bicicleta : bicicletas) {
            String nomeCliente = bicicleta.getCliente() != null ? bicicleta.getCliente().getNome() : "";
            csv.append(String.format("%d%s%s%s%s%s%d%s%s%s%s\n",
                    bicicleta.getId(),
                    SEPARADOR,
                    escaparCSV(bicicleta.getMarca()),
                    SEPARADOR,
                    escaparCSV(bicicleta.getModelo()),
                    SEPARADOR,
                    bicicleta.getTamanhoAro() != null ? bicicleta.getTamanhoAro() : 0,
                    SEPARADOR,
                    escaparCSV(bicicleta.getCor()),
                    SEPARADOR,
                    escaparCSV(nomeCliente)
            ));
        }

        return csv.toString();
    }

    /**
     * Gera CSV com todas as peças
     */
    @Transactional(readOnly = true)
    public String gerarPecasCSV() {
        StringBuilder csv = new StringBuilder();

        // Header
        csv.append(String.format("ID%sDescrição%sValor%sQuantidade%sCódigo Interno%sCategoria%sSubcategoria\n",
                SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR));

        // Dados
        List<Peca> pecas = pecaRepository.findAll();
        for (Peca peca : pecas) {
            csv.append(String.format("%d%s%s%s%s%s%d%s%s%s%s%s%s\n",
                    peca.getId(),
                    SEPARADOR,
                    escaparCSV(peca.getDescricao()),
                    SEPARADOR,
                    formatarValor(peca.getValor()),
                    SEPARADOR,
                    peca.getQuantidade() != null ? peca.getQuantidade() : 0,
                    SEPARADOR,
                    escaparCSV(peca.getCodigoInterno() != null ? peca.getCodigoInterno() : ""),
                    SEPARADOR,
                    escaparCSV(peca.getCategoria() != null ? peca.getCategoria() : ""),
                    SEPARADOR,
                    escaparCSV(peca.getSubcategoria() != null ? peca.getSubcategoria() : "")
            ));
        }

        return csv.toString();
    }

    /**
     * Gera CSV com todas as ordens de serviço
     * Cada bicicleta da ordem gera uma linha separada (1:N)
     */
    @Transactional(readOnly = true)
    public String gerarOrdensServicoCSV() {
        StringBuilder csv = new StringBuilder();

        // Header
        csv.append(String.format("ID OS%sCliente%sMarca Bicicleta%sModelo%sCor%sAro%sStatus%sData Entrada%sData Previsão Saída%sData Saída Real%sValor OS Total%sObservações\n",
                SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR));

        // Dados - iterar sobre ordens de serviço
        List<OrdemServico> ordens = ordemServicoRepository.findAll();
        for (OrdemServico ordem : ordens) {
            String nomeCliente = ordem.getCliente() != null ? ordem.getCliente().getNome() : "";
            String status = ordem.getStatus() != null ? ordem.getStatus().toString() : "";
            String dataEntrada = formatarDataHora(ordem.getDataEntrada());
            String dataPrevisao = formatarDataHora(ordem.getDataPrevisaoSaida());
            String dataSaida = formatarDataHora(ordem.getDataSaidaReal());
            String valorTotal = formatarValor(ordem.getValorTotal());
            String observacoes = escaparCSV(ordem.getObservacoes() != null ? ordem.getObservacoes() : "");

            // Se a ordem tem bicicletas, gera uma linha por bicicleta
            if (ordem.getBicicletasComItens() != null && !ordem.getBicicletasComItens().isEmpty()) {
                for (BicicletaComItens bici : ordem.getBicicletasComItens()) {
                    csv.append(String.format("%d%s%s%s%s%s%s%s%s%s%d%s%s%s%s%s%s%s%s\n",
                            ordem.getId(),
                            SEPARADOR,
                            escaparCSV(nomeCliente),
                            SEPARADOR,
                            escaparCSV(bici.getMarca()),
                            SEPARADOR,
                            escaparCSV(bici.getModelo()),
                            SEPARADOR,
                            escaparCSV(bici.getCor()),
                            SEPARADOR,
                            bici.getTamanhoAro() != null ? bici.getTamanhoAro() : 0,
                            SEPARADOR,
                            escaparCSV(status),
                            SEPARADOR,
                            dataEntrada,
                            SEPARADOR,
                            dataPrevisao,
                            SEPARADOR,
                            dataSaida,
                            SEPARADOR,
                            valorTotal,
                            SEPARADOR,
                            observacoes
                    ));
                }
            } else {
                // Ordem sem bicicletas: gera uma linha vazia para as bicicletas
                csv.append(String.format("%d%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s\n",
                        ordem.getId(),
                        SEPARADOR,
                        escaparCSV(nomeCliente),
                        SEPARADOR,
                        "",
                        SEPARADOR,
                        "",
                        SEPARADOR,
                        "",
                        SEPARADOR,
                        0,
                        SEPARADOR,
                        escaparCSV(status),
                        SEPARADOR,
                        dataEntrada,
                        SEPARADOR,
                        dataPrevisao,
                        SEPARADOR,
                        dataSaida,
                        SEPARADOR,
                        valorTotal,
                        SEPARADOR,
                        observacoes
                ));
            }
        }

        return csv.toString();
    }

    /**
     * Escapa caracteres especiais para CSV
     */
    private String escaparCSV(String valor) {
        if (valor == null) {
            return "";
        }
        // Se contém separador, quebra de linha ou aspas, envolve em aspas e duplica aspas internas
        if (valor.contains(SEPARADOR) || valor.contains("\n") || valor.contains("\"")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }

    /**
     * Formata data e hora para dd/MM/yyyy HH:mm
     */
    private String formatarDataHora(LocalDateTime dataHora) {
        if (dataHora == null) {
            return "";
        }
        return dataHora.format(DATE_TIME_FORMATTER);
    }

    /**
     * Formata valor monetário
     */
    private String formatarValor(BigDecimal valor) {
        if (valor == null) {
            return "0.00";
        }
        return valor.setScale(2, java.math.RoundingMode.HALF_UP).toString();
    }

    // ==================== IMPORTAÇÃO DE CSV ====================

    /**
     * Importa dados do CSV para a entidade especificada
     * 
     * @param entidade clientes, bicicletas, pecas ou servicos
     * @param file arquivo CSV
     * @return mensagem com quantidade de registros importados
     * @throws IllegalArgumentException se houver erro de validação
     */
    @Transactional
    public String importarCSV(String entidade, MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo CSV não pode estar vazio");
        }

        try {
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
            
            String linha = reader.readLine();
            if (linha == null) {
                throw new IllegalArgumentException("Arquivo CSV vazio ou inválido");
            }

            String[] headers = parseCSVLine(linha);
            List<String> linhasData = new ArrayList<>();
            int numeroLinha = 1;

            while ((linha = reader.readLine()) != null) {
                numeroLinha++;
                if (linha.trim().isEmpty()) continue;
                linhasData.add(linha);
            }

            reader.close();

            switch (entidade.toLowerCase().trim()) {
                case "clientes":
                    return importarClientes(headers, linhasData);
                case "bicicletas":
                    return importarBicicletas(headers, linhasData);
                case "pecas":
                    return importarPecas(headers, linhasData);
                case "servicos":
                    return importarServicos(headers, linhasData);
                default:
                    throw new IllegalArgumentException("Entidade inválida: " + entidade + 
                            ". Válidas: clientes, bicicletas, pecas, servicos");
            }

        } catch (Exception e) {
            throw new IllegalArgumentException("Erro ao processar arquivo CSV: " + e.getMessage(), e);
        }
    }

    /**
     * Importa clientes do CSV
     * Chave única: telefone
     */
    private String importarClientes(String[] headers, List<String> linhas) {
        // Validar headers obrigatórios
        Map<String, Integer> headerMap = validarHeaders(headers, 
                new String[]{"Nome", "Telefone", "Endereço", "Instagram"});

        int importados = 0;
        int skipped = 0;

        for (int i = 0; i < linhas.size(); i++) {
            int numeroLinha = i + 2; // +2 porque linha 1 é header
            String[] campos = parseCSVLine(linhas.get(i));
            
            if (campos.length == 0) continue;

            try {
                String nome = getCampo(campos, headerMap, "Nome", numeroLinha);
                String telefone = getCampo(campos, headerMap, "Telefone", numeroLinha);
                String endereco = getCampo(campos, headerMap, "Endereço", numeroLinha);
                String instagram = getCampo(campos, headerMap, "Instagram", numeroLinha);

                validarTelefone(telefone, numeroLinha);

                // Verificar se cliente com este telefone já existe
                Optional<Cliente> existente = clienteRepository.findByTelefone(telefone);
                if (existente.isPresent()) {
                    skipped++;
                    continue;
                }

                Cliente cliente = new Cliente();
                cliente.setNome(nome.trim());
                cliente.setTelefone(telefone.trim());
                cliente.setEndereco(endereco != null ? endereco.trim() : null);
                cliente.setInstagram(instagram != null ? instagram.trim() : null);

                clienteRepository.save(cliente);
                importados++;

            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Erro na linha " + numeroLinha + ": " + e.getMessage(), e);
            }
        }

        return "Importação de Clientes: " + importados + " registros importados, " + skipped + " duplicados ignorados";
    }

    /**
     * Importa bicicletas do CSV
     * Chave única: marca + modelo + cor + cliente
     */
    private String importarBicicletas(String[] headers, List<String> linhas) {
        Map<String, Integer> headerMap = validarHeaders(headers, 
                new String[]{"Marca", "Modelo", "Aro", "Cor", "Cliente"});

        int importados = 0;
        int skipped = 0;

        for (int i = 0; i < linhas.size(); i++) {
            int numeroLinha = i + 2;
            String[] campos = parseCSVLine(linhas.get(i));
            
            if (campos.length == 0) continue;

            try {
                String marca = getCampo(campos, headerMap, "Marca", numeroLinha);
                String modelo = getCampo(campos, headerMap, "Modelo", numeroLinha);
                String cor = getCampo(campos, headerMap, "Cor", numeroLinha);
                String aroStr = getCampo(campos, headerMap, "Aro", numeroLinha);
                String nomeCliente = getCampo(campos, headerMap, "Cliente", numeroLinha);

                int aro = validarInteiro(aroStr, "Aro", numeroLinha);

                // Buscar cliente por nome
                List<Cliente> clientes = clienteRepository.findByNomeContainingIgnoreCase(nomeCliente.trim());
                if (clientes.isEmpty()) {
                    throw new IllegalArgumentException("Cliente '" + nomeCliente + "' não encontrado");
                }
                Cliente cliente = clientes.get(0); // Pega o primeiro se houver múltiplos

                // Verificar se bicicleta já existe (chave única)
                List<Bicicleta> existentes = bicicletaRepository.findByClienteId(cliente.getId());
                boolean temDuplicada = existentes.stream()
                        .anyMatch(b -> b.getMarca().equalsIgnoreCase(marca.trim()) &&
                                      b.getModelo().equalsIgnoreCase(modelo.trim()) &&
                                      b.getCor().equalsIgnoreCase(cor.trim()));
                
                if (temDuplicada) {
                    skipped++;
                    continue;
                }

                Bicicleta bicicleta = new Bicicleta();
                bicicleta.setMarca(marca.trim());
                bicicleta.setModelo(modelo.trim());
                bicicleta.setCor(cor.trim());
                bicicleta.setTamanhoAro(aro);
                bicicleta.setCliente(cliente);

                bicicletaRepository.save(bicicleta);
                importados++;

            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Erro na linha " + numeroLinha + ": " + e.getMessage(), e);
            }
        }

        return "Importação de Bicicletas: " + importados + " registros importados, " + skipped + " duplicados ignorados";
    }

    /**
     * Importa peças do CSV
     * Chave única: descrição
     */
    private String importarPecas(String[] headers, List<String> linhas) {
        Map<String, Integer> headerMap = validarHeaders(headers, 
                new String[]{"Descrição", "Valor", "Quantidade", "Código Interno", "Categoria", "Subcategoria"});

        int importados = 0;
        int skipped = 0;

        for (int i = 0; i < linhas.size(); i++) {
            int numeroLinha = i + 2;
            String[] campos = parseCSVLine(linhas.get(i));
            
            if (campos.length == 0) continue;

            try {
                String descricao = getCampo(campos, headerMap, "Descrição", numeroLinha);
                String valorStr = getCampo(campos, headerMap, "Valor", numeroLinha);
                String qtdStr = getCampo(campos, headerMap, "Quantidade", numeroLinha);
                String codigoInterno = getCampo(campos, headerMap, "Código Interno", numeroLinha);
                String categoria = getCampo(campos, headerMap, "Categoria", numeroLinha);
                String subcategoria = getCampo(campos, headerMap, "Subcategoria", numeroLinha);

                BigDecimal valor = validarBigDecimal(valorStr, "Valor", numeroLinha);
                Integer quantidade = validarInteiro(qtdStr, "Quantidade", numeroLinha);

                // Verificar se peça já existe (chave única: descrição)
                List<Peca> existentes = pecaRepository.findByDescricao(descricao.trim());
                if (!existentes.isEmpty()) {
                    skipped++;
                    continue;
                }

                Peca peca = new Peca();
                peca.setDescricao(descricao.trim());
                peca.setValor(valor);
                peca.setQuantidade(quantidade);
                peca.setCodigoInterno(codigoInterno != null ? codigoInterno.trim() : null);
                peca.setCategoria(categoria != null ? categoria.trim() : null);
                peca.setSubcategoria(subcategoria != null ? subcategoria.trim() : null);

                pecaRepository.save(peca);
                importados++;

            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Erro na linha " + numeroLinha + ": " + e.getMessage(), e);
            }
        }

        return "Importação de Peças: " + importados + " registros importados, " + skipped + " duplicados ignorados";
    }

    /**
     * Importa serviços do CSV
     * Chave única: descrição
     */
    private String importarServicos(String[] headers, List<String> linhas) {
        Map<String, Integer> headerMap = validarHeaders(headers, 
                new String[]{"Descrição", "Valor"});

        int importados = 0;
        int skipped = 0;

        for (int i = 0; i < linhas.size(); i++) {
            int numeroLinha = i + 2;
            String[] campos = parseCSVLine(linhas.get(i));
            
            if (campos.length == 0) continue;

            try {
                String descricao = getCampo(campos, headerMap, "Descrição", numeroLinha);
                String valorStr = getCampo(campos, headerMap, "Valor", numeroLinha);

                BigDecimal valor = validarBigDecimal(valorStr, "Valor", numeroLinha);

                // Verificar se serviço já existe (chave única: descrição)
                List<Servico> existentes = servicoRepository.findByDescricao(descricao.trim());
                if (!existentes.isEmpty()) {
                    skipped++;
                    continue;
                }

                Servico servico = new Servico();
                servico.setDescricao(descricao.trim());
                servico.setValor(valor);

                servicoRepository.save(servico);
                importados++;

            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Erro na linha " + numeroLinha + ": " + e.getMessage(), e);
            }
        }

        return "Importação de Serviços: " + importados + " registros importados, " + skipped + " duplicados ignorados";
    }

    // ==================== MÉTODOS AUXILIARES ====================

    /**
     * Parseia uma linha CSV respeitando aspas
     */
    private String[] parseCSVLine(String linha) {
        List<String> campos = new ArrayList<>();
        StringBuilder campo = new StringBuilder();
        boolean emAspas = false;

        for (int i = 0; i < linha.length(); i++) {
            char c = linha.charAt(i);

            if (c == '"') {
                emAspas = !emAspas;
            } else if (c == ';' && !emAspas) {
                campos.add(campo.toString().trim());
                campo = new StringBuilder();
            } else {
                campo.append(c);
            }
        }

        campos.add(campo.toString().trim());
        return campos.toArray(new String[0]);
    }

    /**
     * Valida que todos os headers obrigatórios existem no CSV
     */
    private Map<String, Integer> validarHeaders(String[] headers, String[] obrigatorios) {
        Map<String, Integer> headerMap = new HashMap<>();
        
        for (int i = 0; i < headers.length; i++) {
            headerMap.put(headers[i].trim(), i);
        }

        List<String> faltantes = new ArrayList<>();
        for (String header : obrigatorios) {
            if (!headerMap.containsKey(header)) {
                faltantes.add(header);
            }
        }

        if (!faltantes.isEmpty()) {
            throw new IllegalArgumentException("Colunas obrigatórias não encontradas: " + String.join(", ", faltantes));
        }

        return headerMap;
    }

    /**
     * Obtém valor de um campo pelo nome da coluna
     */
    private String getCampo(String[] campos, Map<String, Integer> headerMap, String nomeColuna, int numeroLinha) {
        Integer index = headerMap.get(nomeColuna);
        if (index == null) {
            throw new IllegalArgumentException("Coluna '" + nomeColuna + "' não encontrada no header");
        }
        if (index >= campos.length) {
            throw new IllegalArgumentException("Coluna '" + nomeColuna + "' não tem valor definido na linha");
        }
        
        String valor = campos[index].trim();
        if (valor.isEmpty()) {
            throw new IllegalArgumentException("Campo obrigatório '" + nomeColuna + "' está vazio");
        }
        
        return valor;
    }

    /**
     * Valida e converte para BigDecimal
     */
    private BigDecimal validarBigDecimal(String valor, String nomeColuna, int numeroLinha) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Campo '" + nomeColuna + "' está vazio");
        }
        
        try {
            // Suporta ponto ou vírgula como separador decimal
            String normalizado = valor.replace(",", ".");
            return new BigDecimal(normalizado);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Campo '" + nomeColuna + "' contém valor inválido: " + valor);
        }
    }

    /**
     * Valida e converte para Integer
     */
    private Integer validarInteiro(String valor, String nomeColuna, int numeroLinha) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Campo '" + nomeColuna + "' está vazio");
        }
        
        try {
            return Integer.parseInt(valor.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Campo '" + nomeColuna + "' contém valor não-numérico: " + valor);
        }
    }

    /**
     * Valida formato de telefone
     */
    private void validarTelefone(String telefone, int numeroLinha) {
        if (telefone == null || telefone.trim().isEmpty()) {
            throw new IllegalArgumentException("Campo 'Telefone' está vazio");
        }
        // Aceita telefones com apenas dígitos, espaços, parênteses, hífens
        if (!telefone.matches("[0-9\\s\\(\\)\\-]+")) {
            throw new IllegalArgumentException("Campo 'Telefone' tem formato inválido: " + telefone);
        }
    }
}
