package br.net.manutencao.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Entity
@Data
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "td_usuario")

public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usu")
    private Long id;
    
    @Column(name = "email_usu", nullable = false, unique = true)
    @NotBlank(message = "O email não pode estar vazio.")
    @Email(message = "O email deve ser válido.")
    private String email;

    @Column(name = "nome_usu", nullable = false)
    @NotBlank(message = "O nome não pode estar vazio.")
    private String nome;

    @Column(name = "senha_usu", nullable = false)
    @NotBlank(message = "A senha não pode estar vazia.")
    @JsonIgnore
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(name = "perfil_usu", nullable = false)
    @NotNull(message = "O perfil é obrigatório.")
    private Perfil perfil;

   
    public Usuario(String nome, String email, String senha, Perfil perfil) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
    }

    public Usuario(String email, String nome, String senha, String salt, Perfil perfil) {
        this.email = email;
        this.nome = nome;
        this.senha = senha;
        this.salt = salt;
        this.perfil = perfil;
    }
    
    @Column(nullable = false)
    @JsonIgnore
    private String salt; 
    
    public enum Perfil {
        FUNCIONARIO("Funcionário"),
        CLIENTE("Cliente");

        private final String descricao;

        Perfil(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }
}
