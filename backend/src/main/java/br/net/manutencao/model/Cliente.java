package br.net.manutencao.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "td_cliente")
@EqualsAndHashCode(callSuper = true)
public class Cliente extends Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long id;
    
    private String nome;
    private String telefone;
    private String endereco;
    private String instagram;
    private String senha;
    
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL)
    private List<Bicicleta> bicicletas = new ArrayList<>();

    public Cliente() {
        super.setPerfil(Perfil.CLIENTE);
    }

    public Cliente(
            String nome,
            String senha,
            String telefone,
            String endereco,
            String instagram
            ) {
        super(nome, senha, instagram, Perfil.CLIENTE);
        this.telefone = telefone;
        this.endereco = endereco;
        this.instagram = instagram;
    }
}