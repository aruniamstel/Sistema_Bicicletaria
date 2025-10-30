package br.net.manutencao.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
public class Bicicleta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String marca;
    private String modelo;
    private Integer tamanhoAro; // ou String se for "29", "26", etc
    private String cor;
    
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
    
    @OneToMany(mappedBy = "bicicleta")
    private List<OrdemServico> ordensServico = new ArrayList<>();
    
    // constructors, getters, setters

    public Cliente getCliente() {
        return cliente;
    }

    public String getCor() {
        return cor;
    }

    public Long getId() {
        return id;
    }

    public String getMarca() {
        return marca;
    }

    public String getModelo() {
        return modelo;
    }

    public List<OrdemServico> getOrdensServico() {
        return ordensServico;
    }

    public Integer getTamanhoAro() {
        return tamanhoAro;
    }
}
