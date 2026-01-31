package br.net.manutencao.repository;

import br.net.manutencao.model.OrdemServico;
import br.net.manutencao.model.StatusOrdem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {

    // Buscar ordens por cliente (através da bicicleta)
    @Query("SELECT os FROM OrdemServico os WHERE os.bicicleta.cliente.id = :clienteId")
    List<OrdemServico> findByClienteId(@Param("clienteId") Long clienteId);

    // Buscar ordens por bicicleta
    @Query("SELECT os FROM OrdemServico os WHERE os.bicicleta.id = :bicicletaId")
    List<OrdemServico> findByBicicletaId(@Param("bicicletaId") Long bicicletaId);

    // Buscar ordens por status
    List<OrdemServico> findByStatus(StatusOrdem status);

    // Buscar ordens em aberto
    @Query("SELECT os FROM OrdemServico os WHERE os.status IN :statuses")
    List<OrdemServico> findByStatusIn(@Param("statuses") List<StatusOrdem> statuses);

    // Relatório: Faturamento por data (ordens ENTREGUES) - CORRIGIDO
    @Query("SELECT FUNCTION('DATE', os.dataSaidaReal) AS data, SUM(os.valorTotal) AS valorTotal " +
           "FROM OrdemServico os WHERE os.status = br.net.manutencao.model.StatusOrdem.ENTREGUE AND os.dataSaidaReal IS NOT NULL " +
           "GROUP BY FUNCTION('DATE', os.dataSaidaReal) " +
           "ORDER BY FUNCTION('DATE', os.dataSaidaReal)")
    List<Object[]> findOrdensEntreguesPorData();

    // Relatório: Faturamento por serviço - CORRIGIDO
    @Query("SELECT s.descricao AS servico, SUM(oss.valor * oss.quantidade) AS valorTotal " +
           "FROM OrdemServicoServico oss " +
           "JOIN oss.servico s " +
           "JOIN oss.ordemServico os " +
           "WHERE os.status = br.net.manutencao.model.StatusOrdem.ENTREGUE " +
           "GROUP BY s.descricao " +
           "ORDER BY SUM(oss.valor * oss.quantidade) DESC")
    List<Object[]> findFaturamentoPorServico();

    // Relatório: Faturamento por peça - CORRIGIDO
    @Query("SELECT p.descricao AS peca, SUM(osp.valor * osp.quantidade) AS valorTotal " +
           "FROM OrdemServicoPeca osp " +
           "JOIN osp.peca p " +
           "JOIN osp.ordemServico os " +
           "WHERE os.status = br.net.manutencao.model.StatusOrdem.ENTREGUE " +
           "GROUP BY p.descricao " +
           "ORDER BY SUM(osp.valor * osp.quantidade) DESC")
    List<Object[]> findFaturamentoPorPeca();

    // Buscar ordens por período
    @Query("SELECT os FROM OrdemServico os WHERE os.dataEntrada BETWEEN :dataInicio AND :dataFim")
    List<OrdemServico> findByPeriodo(@Param("dataInicio") LocalDate dataInicio, 
                                     @Param("dataFim") LocalDate dataFim);

    // Contar ordens por status
    @Query("SELECT os.status, COUNT(os) FROM OrdemServico os GROUP BY os.status")
    List<Object[]> countOrdensByStatus();

    // Buscar ordens atrasadas (entrada há mais de X dias e não entregues) - CORRIGIDO
    @Query("SELECT os FROM OrdemServico os WHERE os.status IN (br.net.manutencao.model.StatusOrdem.ABERTA, br.net.manutencao.model.StatusOrdem.EM_ANDAMENTO) AND os.dataEntrada < :dataLimite")
    List<OrdemServico> findOrdensAtrasadas(@Param("dataLimite") LocalDate dataLimite);
}