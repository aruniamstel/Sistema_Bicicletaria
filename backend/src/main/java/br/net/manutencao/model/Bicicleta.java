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
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "bicicleta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bicicleta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String marca;

    @NotBlank
    private String modelo;

    @Column(name = "tamanho_aro")
    private Integer tamanhoAro;

    @NotBlank
    private String cor;

    // Relacionamento com Cliente - lado "Many"
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    @JsonBackReference("cliente-bicicletas")
    private Cliente cliente;

    // Relacionamento com OrdemServico - lado "Many"
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "ordem_servico_id")
    @JsonIgnore
    private OrdemServico ordemServico;
}
