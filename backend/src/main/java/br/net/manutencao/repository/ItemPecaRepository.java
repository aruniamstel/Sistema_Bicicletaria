package br.net.manutencao.repository;

import br.net.manutencao.model.ItemPeca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemPecaRepository extends JpaRepository<ItemPeca, Long> {
    List<ItemPeca> findByBicicletaItemId(Long bicicletaItemId);
    boolean existsByPecaId(Long pecaId);
}
