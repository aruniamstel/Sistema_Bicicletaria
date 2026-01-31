package br.net.manutencao.repository;

import br.net.manutencao.model.Peca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PecaRepository extends JpaRepository<Peca, Long> {
    List<Peca> findByDescricao(String descricao);
    List<Peca> findByQuantidadeGreaterThan(Integer quantidade);
}
