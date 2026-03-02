package br.net.manutencao.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Peca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descricao;
    private BigDecimal valor;
    private Integer quantidade;
    private String codigoInterno;
    private String categoria;
    private String subcategoria;

    @OneToMany(mappedBy = "peca", fetch = jakarta.persistence.FetchType.LAZY)
    @JsonIgnoreProperties ("peca") // Evita referência circular
    private List<ItemPeca> ItemPecas = new ArrayList<>();
}
    

