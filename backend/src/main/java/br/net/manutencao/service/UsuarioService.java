package br.net.manutencao.service;


import br.net.manutencao.HashUtil;

import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    public boolean verificarSenha(String senhaDigitada, String hashArmazenado, String salt) {
        try {
            // Usa a lógica centralizada no HashUtil
            String hashGerado = HashUtil.hashSenhaComSalt(senhaDigitada, salt);
            return hashGerado.equals(hashArmazenado);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}