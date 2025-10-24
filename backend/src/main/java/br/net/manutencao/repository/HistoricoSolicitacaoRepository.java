package br.net.manutencao.repository;

import br.net.manutencao.model.HistoricoSolicitacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricoSolicitacaoRepository extends JpaRepository<HistoricoSolicitacao, Long> {

    // Busca todos os históricos associados a uma determinada solicitação, ordenados por data/hora.
    List<HistoricoSolicitacao> findBySolicitacaoIdOrderByDataHoraAsc(Long solicitacaoId);

}
