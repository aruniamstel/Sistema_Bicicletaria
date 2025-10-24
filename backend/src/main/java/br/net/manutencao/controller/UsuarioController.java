package br.net.manutencao.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.net.manutencao.model.Login;
import br.net.manutencao.model.Usuario;
import br.net.manutencao.repository.UsuarioRepository;
import br.net.manutencao.service.UsuarioService;
import br.net.manutencao.HashUtil;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200") // Permitindo o CORS para o frontend Angular
public class UsuarioController {


    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        List<Usuario> lista = usuarioRepository.findAll();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obterUsuarioPorId(@PathVariable("id") Long id) {
        Optional<Usuario> op = usuarioRepository.findById(id);
        return op.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/clientes")
    public ResponseEntity<Usuario> cadastrarCliente(@RequestBody Usuario cliente) throws Exception {
        Optional<Usuario> existente = usuarioRepository.findByEmail(cliente.getEmail());
        if (existente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Gera um salt aleatório (caso esteja no CadastroService, use ele corretamente)
        String salt = HashUtil.gerarSalt();
        
        // Chama o método do UsuarioService
        String senhaHash = HashUtil.hashSenhaComSalt(cliente.getSenha(), salt);

        // Salva o hash da senha e o salt
        cliente.setSenha(senhaHash);
        cliente.setSalt(salt);

        Usuario novoUsuario = usuarioRepository.save(cliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
    }




    @PutMapping("/{id}")
    public ResponseEntity<Usuario> alterar(@PathVariable("id") Long id, @RequestBody Usuario usuario) {
        Optional<Usuario> op = usuarioRepository.findById(id);
        if (op.isPresent()) {
            usuario.setId(id);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(usuario);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable("id") Long id) {
        Optional<Usuario> op = usuarioRepository.findById(id);
        if (op.isPresent()) {
            usuarioRepository.delete(op.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody Login login) {
        Optional<Usuario> op = usuarioRepository.findByEmail(login.getLogin());
        
        if (op.isPresent()) {
            Usuario usuario = op.get();
            try {
                if (usuarioService.verificarSenha(login.getSenha(), usuario.getSenha(), usuario.getSalt())) {
                    return ResponseEntity.ok(usuario);
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
                }
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    
}
