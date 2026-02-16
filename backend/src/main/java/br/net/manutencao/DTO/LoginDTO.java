package br.net.manutencao.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para receber as credenciais de login do cliente
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginDTO {
    private String login;
    private String senha;
}
