package br.net.manutencao.repository;


import br.net.manutencao.model.Solicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    public List<Solicitacao> findByClienteId(Long clienteId);
    public List<Solicitacao> findByFuncionarioId(Long funcionarioId);

    @Query("SELECT FUNCTION('DATE', s.date) AS data, SUM(s.preco) AS precoTotal " +
       "FROM Solicitacao s WHERE s.status = 'FINALIZADA' " +
       "GROUP BY FUNCTION('DATE', s.date) " +
       "ORDER BY FUNCTION('DATE', s.date)")
    List<Object[]> findSolicitacoesFinalizadasPorData();

    @Query("SELECT c.nome AS categoria, SUM(s.preco) AS precoTotal " +
       "FROM Solicitacao s JOIN s.categoria c WHERE s.status = 'FINALIZADA' " +
       "GROUP BY c.nome " +
       "ORDER BY c.nome")
    List<Object[]> findSolicitacoesFinalizadasPorCategoria();
}