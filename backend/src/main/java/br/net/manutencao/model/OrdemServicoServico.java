package br.net.manutencao.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import br.net.manutencao.model.Servico;
import lombok.Data;

@Entity
public class OrdemServicoServico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Integer quantidade;
    private BigDecimal valorUnitario;
    
    @ManyToOne
    @JoinColumn(name = "ordem_servico_id")
    private OrdemServico ordemServico;
    
    @ManyToOne
    @JoinColumn(name = "servico_id")
    private Servico servico;
    
    public BigDecimal getValorTotal() {
        return valorUnitario.multiply(BigDecimal.valueOf(quantidade));
    }

     // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    
    public BigDecimal getValorUnitario() { return valorUnitario; }
    public void setValorUnitario(BigDecimal valorUnitario) { this.valorUnitario = valorUnitario; }
    
    public OrdemServico getOrdemServico() { return ordemServico; }
    public void setOrdemServico(OrdemServico ordemServico) { this.ordemServico = ordemServico; }
    
    public Servico getServico() { return servico; }
    public void setServico(Servico servico) { this.servico = servico; }
    
}
