package br.net.manutencao.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "bicicletas_com_itens")
public class BicicletaComItens {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String marca;
    private String modelo;
    private String cor;
    private Integer tamanhoAro;
    
    // Vínculo obrigatório com a Ordem de Serviço (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordem_id")
    @JsonBackReference("ordem-bicicletas")
    private OrdemServico ordemServico;
    
    // Serviços específicos desta bicicleta dentro da OS
    @OneToMany(mappedBy = "bicicletaItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("bicicleta-servicos")
    private List<ItemServico> servicos = new ArrayList<>();
    
    // Peças específicas desta bicicleta dentro da OS
    @OneToMany(mappedBy = "bicicletaItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("bicicleta-pecas")
    private List<ItemPeca> pecas = new ArrayList<>();
}
