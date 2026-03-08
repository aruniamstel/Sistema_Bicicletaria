package br.net.manutencao.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String telefone;
    private String endereco;
    private String instagram;

    // Relacionamento 1:N com Bicicleta
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonManagedReference("cliente-bicicletas")
    private List<Bicicleta> bicicletas = new ArrayList<>();

    // Relacionamento 1:N com OrdemServico
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonManagedReference("cliente-ordens")
    private List<OrdemServico> ordensServico = new ArrayList<>();

    @PreRemove
    public void preRemove() {
        // Limpar associações antes de remover para evitar constraint violations
        for (OrdemServico ordem : this.ordensServico) {
            ordem.getBicicletas().forEach(bicicleta -> bicicleta.setOrdemServico(null));
            ordem.getBicicletas().clear();
        }
        this.ordensServico.clear();
        this.bicicletas.clear();
    }
}