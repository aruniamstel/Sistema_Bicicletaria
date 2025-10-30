package br.net.manutencao.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import br.net.manutencao.model.OrdemServicoServico;

public interface OrdemServicoServicoRepository extends JpaRepository<OrdemServicoServico, Long> {
    List<OrdemServicoServico> findByOrdemServicoId(Long ordemServicoId);
    void deleteByOrdemServicoIdAndServicoId(Long ordemServicoId, Long servicoId);
}
