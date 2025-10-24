package br.net.manutencao.model;

import lombok.Data;


@Data
public class Login {
    private String login;
    private String senha;

    public Login(String login, String senha) {
        this.login = login;
        this.senha = senha;
    } 
}
