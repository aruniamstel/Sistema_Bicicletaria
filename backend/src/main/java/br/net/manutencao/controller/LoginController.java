package br.net.manutencao.controller;

import br.net.manutencao.Config.JwtUtils;
import br.net.manutencao.DTO.LoginDTO;
import br.net.manutencao.DTO.UsuarioDTO;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para gerenciar autenticação simplificada de usuários
 * Endpoint de login com autenticação hardcoded para fins de desenvolvimento
 */
@RestController
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequestMapping("/login")
public class LoginController {

    // Injetar a utilidade de JWT que criamos
    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Endpoint de login que valida credenciais e retorna dados do usuário
     * 
     * Credenciais padrão:
     * - login: admin
     * - senha: admin123
     * 
     * @param loginDTO objeto contendo login e senha
     * @return ResponseEntity com status 200 e UsuarioDTO se autenticado, ou 401 se não autenticado
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginDTO loginDTO) {
        
        // Validação hardcoded para fins de desenvolvimento/demonstração
        if ("admin".equals(loginDTO.getLogin()) && "admin123".equals(loginDTO.getSenha())) {
            
            // 1. Gerar o Token para o usuário
            String token = jwtUtils.generateToken(loginDTO.getLogin());

            // Criar objeto de resposta com dados do usuário autenticado
            UsuarioDTO usuarioDTO = new UsuarioDTO(
                1L,                    // id
                "Administrador",       // nome
                "admin",               // login
                "ADMIN"                // perfil
            );

            // 3. Adicionar o token à resposta. 
            // Se o seu UsuarioDTO não tiver o campo 'token', vamos usar um Map rápido:
            Map<String, Object> resposta = new HashMap<>();
            resposta.put("usuario", usuarioDTO);
            resposta.put("token", token);
            
            return ResponseEntity.ok(resposta);
        }
        
        // Retornar 401 Unauthorized se as credenciais estiverem incorretas
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
