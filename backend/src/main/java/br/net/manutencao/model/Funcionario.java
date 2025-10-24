package br.net.manutencao.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "td_funcionario")
@EqualsAndHashCode(callSuper = true)
public class Funcionario extends Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_funcionario")
    private Long id;

    @Column(name = "data_nasc", nullable = false)
    @NotBlank(message = "A data de nascimento não pode estar vazia.")
    private String dataNasc;

    public Funcionario() {
        super.setPerfil(Perfil.FUNCIONARIO);
    }

    public Funcionario(
            String email,
            String nome,
            String senha,
            String salt,
            String dataNasc) {
        super(nome, email, senha, salt, Perfil.FUNCIONARIO);
        this.dataNasc = dataNasc;
    }
}
