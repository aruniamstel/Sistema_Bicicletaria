package br.net.manutencao.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Servico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String descricao;
    private String categoria; // "Manutenção", "Reparo", "Limpeza"
    private BigDecimal valorPadrao; // valor sugerido
    
    @OneToMany(mappedBy = "servico")
    private List<OrdemServicoServico> ordemServicoServicos = new ArrayList<>();
    
    // constructors, getters, setters

    public BigDecimal getValorPadrao() {
        return valorPadrao;
    }

    public String getCategoria() {
        return categoria;
    }

    public String getDescricao() {
        return descricao;
    }

    public List<OrdemServicoServico> getOrdemServicoServicos() {
        return ordemServicoServicos;
    }

    public Long getId() {
        return id;
    }
    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setOrdemServicoServicos(List<OrdemServicoServico> ordemServicoServicos) {
        this.ordemServicoServicos = ordemServicoServicos;
    }

    public void setValorPadrao(BigDecimal valorPadrao) {
        this.valorPadrao = valorPadrao;
    }
}
