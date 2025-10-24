package br.net.manutencao.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import br.net.manutencao.HashUtil;
import br.net.manutencao.model.Cliente;
import br.net.manutencao.repository.CadastroRepository;

@Service
public class ClienteService {

    @Autowired
    private CadastroRepository cadastroRepository;

    @Autowired
    private JavaMailSender mailSender;

    // @Autowired
    // private PasswordEncoder passwordEncoder;

    public Cliente autocadastrar(Cliente cliente) throws Exception {

        if (cadastroRepository.existsByEmail(cliente.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }
    
        if (cadastroRepository.existsByCpf(cliente.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado.");
        }
    
        // Gera uma senha aleatória de 4 dígitos
        String senha = HashUtil.gerarSenha();
        String salt = HashUtil.gerarSalt();
        String senhaHash = HashUtil.hashSenhaComSalt(senha, salt);

        cliente.setSenha(senhaHash);
        cliente.setSalt(salt);
    
        cadastroRepository.save(cliente);
    
        enviarEmailComSenha(cliente.getEmail(), senha);
    
        return cliente;
    }
    


    // Envia o email com a senha gerada
    private void enviarEmailComSenha(String email, String senha) {
        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setTo(email);
        mensagem.setSubject("Senha de Acesso");
        mensagem.setText("Bem-vindo ao sistema! Sua senha é: " + senha);
        mailSender.send(mensagem);
    }
}
