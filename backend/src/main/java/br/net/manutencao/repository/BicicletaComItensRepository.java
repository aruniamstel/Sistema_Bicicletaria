package br.net.manutencao.repository;

import br.net.manutencao.model.BicicletaComItens;
import br.net.manutencao.model.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BicicletaComItensRepository extends JpaRepository<BicicletaComItens, Long> {
    List<BicicletaComItens> findByOrdemServico(OrdemServico ordemServico);
    List<BicicletaComItens> findByOrdemServicoId(Long ordemServicoId);
}
