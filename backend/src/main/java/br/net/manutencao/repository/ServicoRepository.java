package br.net.manutencao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.net.manutencao.model.Servico;

public interface ServicoRepository extends JpaRepository<Servico, Long> {
    List<Servico> findByCategoria(String categoria);
}
