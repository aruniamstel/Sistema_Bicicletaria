package br.net.manutencao.repository;

import br.net.manutencao.model.OrdemServico;
import br.net.manutencao.model.StatusOrdem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {

    // 1. Buscar TODAS as ordens com eager loading corrigido para a nova estrutura
    @Query("SELECT DISTINCT os FROM OrdemServico os " +
           "LEFT JOIN FETCH os.cliente " +
           "LEFT JOIN FETCH os.bicicletasComItens")
    List<OrdemServico> findAll();

    // 2. Buscar ordens por cliente
    @Query("SELECT DISTINCT os FROM OrdemServico os " +
           "LEFT JOIN FETCH os.cliente " +
           "LEFT JOIN FETCH os.bicicletasComItens " +
           "WHERE os.cliente.id = :clienteId")
    List<OrdemServico> findByClienteId(@Param("clienteId") Long clienteId);

    // 2. findByBicicletaId (Ajustado para procurar dentro da nova entidade intermediária)
    @Query("SELECT DISTINCT os FROM OrdemServico os " +
           "JOIN os.bicicletasComItens bci " +
           "WHERE bci.id = :bicicletaId")
    List<OrdemServico> findByBicicletaId(@Param("bicicletaId") Long bicicletaId);

    // 3. findByStatus
    List<OrdemServico> findByStatus(StatusOrdem status);

    // 4. findByStatusIn (Para listas como Aberta e Em Andamento)
    List<OrdemServico> findByStatusIn(Collection<StatusOrdem> statuses);

    // 3. Relatório: Faturamento por serviço (Caminho: ItemServico -> BicicletaComItens -> OrdemServico)
    @Query("SELECT s.descricao AS servico, SUM(iss.valor * iss.quantidade) AS valorTotal " +
           "FROM ItemServico iss " +
           "JOIN iss.servico s " +
           "JOIN iss.bicicletaItem bi " +
           "JOIN bi.ordemServico os " +
           "WHERE os.status = br.net.manutencao.model.StatusOrdem.ENTREGUE " +
           "GROUP BY s.descricao " +
           "ORDER BY SUM(iss.valor * iss.quantidade) DESC")
    List<Object[]> findFaturamentoPorServico();

    // 4. Relatório: Faturamento por peça (Caminho: ItemPeca -> BicicletaComItens -> OrdemServico)
    @Query("SELECT p.descricao AS peca, SUM(ip.valor * ip.quantidade) AS valorTotal " +
           "FROM ItemPeca ip " +
           "JOIN ip.peca p " +
           "JOIN ip.bicicletaItem bi " +
           "JOIN bi.ordemServico os " +
           "WHERE os.status = br.net.manutencao.model.StatusOrdem.ENTREGUE " +
           "GROUP BY p.descricao " +
           "ORDER BY SUM(ip.valor * ip.quantidade) DESC")
    List<Object[]> findFaturamentoPorPeca();

    // 5. Buscar ordens por período 
   /* @Query("SELECT os FROM OrdemServico os WHERE os.dataEntrada BETWEEN :dataInicio AND :dataFim")
    List<OrdemServico> findByPeriodo(@Param("dataInicio") java.time.LocalDateTime dataInicio, 
                                     @Param("dataFim") java.time.LocalDateTime dataFim); */

    // 6. Contar ordens por status
    @Query("SELECT os.status, COUNT(os) FROM OrdemServico os GROUP BY os.status")
    List<Object[]> countOrdensByStatus();

    // 5. findOrdensEntreguesPorData (Relatório de fechamento)
    @Query("SELECT os FROM OrdemServico os " +
           "WHERE os.status = br.net.manutencao.model.StatusOrdem.ENTREGUE " +
           "AND os.dataSaidaReal IS NOT NULL " +
           "ORDER BY os.dataSaidaReal DESC")
    List<OrdemServico> findOrdensEntreguesPorData();

    // 6. findOrdensAtrasadas (Corrigido para aceitar LocalDate ou usar data atual)
    @Query("SELECT os FROM OrdemServico os " +
           "WHERE os.status != br.net.manutencao.model.StatusOrdem.ENTREGUE " +
           "AND os.dataPrevisaoSaida < :dataReferencia")
    List<OrdemServico> findOrdensAtrasadas(@Param("dataReferencia") LocalDate dataReferencia);

    // 7. findByPeriodo (Corrigido para aceitar LocalDate conforme chamado no Service)
    // Usamos cast para LocalDateTime para comparar com o banco
    @Query("SELECT os FROM OrdemServico os " +
           "WHERE os.dataEntrada >= :inicio AND os.dataEntrada <= :fim")
    List<OrdemServico> findByPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
    
    // 7. Buscar ordens atrasadas
   /*  @Query("SELECT os FROM OrdemServico os " +
           "WHERE os.status != br.net.manutencao.model.StatusOrdem.ENTREGUE " +
           "AND os.dataPrevisaoSaida < CURRENT_TIMESTAMP")
    List<OrdemServico> findOrdensAtrasadas(); */
}