package br.net.manutencao.service;

import br.net.manutencao.model.*;
import br.net.manutencao.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportarService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private BicicletaRepository bicicletaRepository;

    @Autowired
    private PecaRepository pecaRepository;

    @Autowired
    private OrdemServicoRepository ordemServicoRepository;

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
     */
    @Transactional(readOnly = true)
    public String gerarOrdensServicoCSV() {
        StringBuilder csv = new StringBuilder();

        // Header
        csv.append(String.format("ID%sCliente%sBicicleta%sStatus%sData Entrada%sData Previsão Saída%sData Saída Real%sValor Total%sObservações\n",
                SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR, SEPARADOR));

        // Dados
        List<OrdemServico> ordens = ordemServicoRepository.findAll();
        for (OrdemServico ordem : ordens) {
            String nomeCliente = ordem.getCliente() != null ? ordem.getCliente().getNome() : "";
            String descricaoBicicleta = "";
            if (ordem.getBicicletas() != null && !ordem.getBicicletas().isEmpty()) {
                Bicicleta primeira = ordem.getBicicletas().get(0);
                descricaoBicicleta = primeira.getMarca() + " " + primeira.getModelo();
            }
            String status = ordem.getStatus() != null ? ordem.getStatus().toString() : "";
            
            csv.append(String.format("%d%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s\n",
                    ordem.getId(),
                    SEPARADOR,
                    escaparCSV(nomeCliente),
                    SEPARADOR,
                    escaparCSV(descricaoBicicleta),
                    SEPARADOR,
                    escaparCSV(status),
                    SEPARADOR,
                    formatarDataHora(ordem.getDataEntrada()),
                    SEPARADOR,
                    formatarDataHora(ordem.getDataPrevisaoSaida()),
                    SEPARADOR,
                    formatarDataHora(ordem.getDataSaidaReal()),
                    SEPARADOR,
                    formatarValor(ordem.getValorTotal()),
                    SEPARADOR,
                    escaparCSV(ordem.getObservacoes() != null ? ordem.getObservacoes() : "")
            ));
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
}
