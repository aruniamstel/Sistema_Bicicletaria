package br.net.manutencao.model;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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

    // Múltiplas bicicletas em uma OS (relacionamento bidirecional)
    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore // Evita referência circular direta (usamos BicicletaComItens para detalhes)
    private List<Bicicleta> bicicletas = new ArrayList<>();

    // Bicicletas com itens (serviços/peças) para cada ordem
    // ÚNICA lista de relacionamento 1:N para BicicletaComItens
    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("ordem-bicicletas")
    private List<BicicletaComItens> bicicletasComItens = new ArrayList<>();

    // Datas conforme frontend
    private LocalDateTime dataEntrada;
    private LocalDateTime dataPrevisaoSaida;
    private LocalDateTime dataSaidaReal;

    private String observacoes;

    @Enumerated(EnumType.STRING)
    private StatusOrdem status;

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

    // Método para calcular valor total (percorre as bicicletas e seus itens)
    public BigDecimal calcularValorTotal() {
        BigDecimal total = BigDecimal.ZERO;

        for (BicicletaComItens bicicleta : bicicletasComItens) {
            // Soma dos serviços
            BigDecimal totalServicos = bicicleta.getServicos().stream()
                .map(ItemServico::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Soma das peças
            BigDecimal totalPecas = bicicleta.getPecas().stream()
                .map(ItemPeca::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            total = total.add(totalServicos).add(totalPecas);
        }

        this.valorTotal = total;
        return this.valorTotal;
    }
}

