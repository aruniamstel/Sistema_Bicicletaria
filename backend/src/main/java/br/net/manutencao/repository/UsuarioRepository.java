package br.net.manutencao.repository;
import br.net.manutencao.model.Usuario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    public Optional<Usuario> findByEmail(String email);
    public Optional<Usuario> findByEmailAndSenha(String email, String senha);
    public Optional<Usuario> findById(Long id);

    boolean existsByEmail(String email);
}