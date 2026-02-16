package br.net.manutencao.controller;

import br.net.manutencao.DTO.LoginDTO;
import br.net.manutencao.DTO.UsuarioDTO;
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
    public ResponseEntity<UsuarioDTO> login(@RequestBody LoginDTO loginDTO) {
        
        // Validação hardcoded para fins de desenvolvimento/demonstração
        if ("admin".equals(loginDTO.getLogin()) && "admin123".equals(loginDTO.getSenha())) {
            
            // Criar objeto de resposta com dados do usuário autenticado
            UsuarioDTO usuarioDTO = new UsuarioDTO(
                1L,                    // id
                "Administrador",       // nome
                "admin",               // login
                "ADMIN"                // perfil
            );
            
            return ResponseEntity.ok(usuarioDTO);
        }
        
        // Retornar 401 Unauthorized se as credenciais estiverem incorretas
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
