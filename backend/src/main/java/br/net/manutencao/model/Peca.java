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
public class Peca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    private String descricao;
    private String categoria; // "Pneu", "Freio", "Corrente"
    private BigDecimal valorUnitario;
    private Integer estoque;
    
    @OneToMany(mappedBy = "peca")
    private List<OrdemServicoPeca> ordemServicoPecas = new ArrayList<>();
    
    // constructors, getters, setters

    public Integer getEstoque() {
        return estoque;
    }

    public String getCategoria() {
        return categoria;
    }

    public String getDescricao() {
        return descricao;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public List<OrdemServicoPeca> getOrdemServicoPecas() {
        return ordemServicoPecas;
    }

    public BigDecimal getValorUnitario() {
        return valorUnitario;
    }

    public void setEstoque(Integer estoque) {
        this.estoque = estoque;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public void setId(Long id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public void setValorUnitario(BigDecimal valorUnitario) { this.valorUnitario = valorUnitario; }
    public void setOrdemServicoPecas(List<OrdemServicoPeca> ordemServicoPecas) { 
        this.ordemServicoPecas = ordemServicoPecas; 
    }
}
    

