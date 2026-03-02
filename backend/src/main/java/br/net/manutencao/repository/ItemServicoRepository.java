package br.net.manutencao.repository;

import br.net.manutencao.model.ItemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemServicoRepository extends JpaRepository<ItemServico, Long> {
    List<ItemServico> findByBicicletaItemId(Long bicicletaItemId);
    boolean existsByServicoId(Long servicoId);
}