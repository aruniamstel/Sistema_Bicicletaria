package br.net.manutencao.repository;

import br.net.manutencao.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    // Buscar por telefone (útil para o Fabiano)
    Optional<Cliente> findByTelefone(String telefone);
    
    // Buscar por nome (com like)
    List<Cliente> findByNomeContainingIgnoreCase(String nome);
    
    // Buscar por Instagram
    Optional<Cliente> findByInstagram(String instagram);
    
    // Verificar se telefone já existe (para evitar duplicatas)
    boolean existsByTelefone(String telefone);
    
    // Buscar cliente com suas bicicletas
    @Query("SELECT c FROM Cliente c LEFT JOIN FETCH c.bicicletas WHERE c.id = :id")
    Optional<Cliente> findByIdWithBicicletas(@Param("id") Long id);
}