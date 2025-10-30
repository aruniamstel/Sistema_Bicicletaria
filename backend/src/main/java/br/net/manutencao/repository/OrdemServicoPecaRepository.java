package br.net.manutencao.repository;

import br.net.manutencao.model.OrdemServicoPeca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdemServicoPecaRepository extends JpaRepository<OrdemServicoPeca, Long> {
    List<OrdemServicoPeca> findByOrdemServicoId(Long ordemServicoId);
    void deleteByOrdemServicoIdAndPecaId(Long ordemServicoId, Long pecaId);
}
