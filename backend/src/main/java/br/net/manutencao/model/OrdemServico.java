package br.net.manutencao.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "td_solicitacao")
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    // NOVO: Múltiplas bicicletas em uma OS (mappedBy para relacionamento bidirecional)
    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Bicicleta> bicicletas = new ArrayList<>();

    // NOVO: Bicicletas com itens (serviços/peças) para cada ordem
    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BicicletaComItens> bicicletasComItens = new ArrayList<>();

    // Datas conforme frontend
    private LocalDateTime dataEntrada;
    private LocalDateTime dataPrevisaoSaida;
    private LocalDateTime dataSaidaReal;

    private String observacoes;
    private StatusOrdem status;

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrdemServicoServico> servicos = new ArrayList<>();

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrdemServicoPeca> pecas = new ArrayList<>();

    private BigDecimal valorTotal;

    private boolean exibirAviso30Dias;

    // Auto-preencher dataEntrada ao criar uma nova ordem
    @PrePersist
    protected void onCreate() {
        if (this.dataEntrada == null) {
            this.dataEntrada = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = StatusOrdem.ABERTA;
        }
        if (this.valorTotal == null) {
            this.valorTotal = BigDecimal.ZERO;
        }
    }

    // Método para calcular valor total
    public BigDecimal calcularValorTotal() {
        BigDecimal totalServicos = servicos.stream()
            .map(OrdemServicoServico::getValorTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPecas = pecas.stream()
            .map(OrdemServicoPeca::getValorTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.valorTotal = totalServicos.add(totalPecas);
        return this.valorTotal;
    }
}

