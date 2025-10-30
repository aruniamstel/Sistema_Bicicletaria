package br.net.manutencao.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class OrdemServicoPeca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Integer quantidade;
    private BigDecimal valorUnitario;
    
    @ManyToOne
    @JoinColumn(name = "ordem_servico_id")
    private OrdemServico ordemServico;
    
    @ManyToOne
    @JoinColumn(name = "peca_id")
    private Peca peca;
    
    public BigDecimal getValorTotal() {
        return valorUnitario.multiply(BigDecimal.valueOf(quantidade));
    }

    public OrdemServico getOrdemServico() {
        return ordemServico;
    }

    public Long getId() {
        return id;
    }

    public Peca getPeca() {
        return peca;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public BigDecimal getValorUnitario() {
        return valorUnitario;
    }

     // Setters
    
    public void setId(Long id) { this.id = id; }  
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; } 
    public void setValorUnitario(BigDecimal valorUnitario) { this.valorUnitario = valorUnitario; }
    public void setOrdemServico(OrdemServico ordemServico) { this.ordemServico = ordemServico; }
    public void setPeca(Peca peca) { this.peca = peca; }

}