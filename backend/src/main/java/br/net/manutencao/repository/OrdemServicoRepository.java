package br.net.manutencao.repository;

import br.net.manutencao.model.OrdemServico;
import br.net.manutencao.model.StatusOrdem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {

    // Buscar ordens por cliente (através da bicicleta)
    @Query("SELECT os FROM OrdemServico os WHERE os.bicicleta.cliente.id = :clienteId")
    List<OrdemServico> findByClienteId(@Param("clienteId") Long clienteId);

    // Buscar ordens por bicicleta
    List<OrdemServico> findByBicicletaId(Long bicicletaId);

    // Buscar ordens por status
    List<OrdemServico> findByStatus(StatusOrdem status);

    // Buscar ordens em aberto
    List<OrdemServico> findByStatusIn(List<StatusOrdem> statuses);

    // Método removido - não temos mais funcionário no novo modelo
    // public List<OrdemServico> findByFuncionarioId(Long funcionarioId);

    // Relatório: Faturamento por data (ordens ENTREGUES)
    @Query("SELECT FUNCTION('DATE', os.dataSaida) AS data, SUM(os.valorTotal) AS valorTotal " +
           "FROM OrdemServico os WHERE os.status = 'ENTREGUE' AND os.dataSaida IS NOT NULL " +
           "GROUP BY FUNCTION('DATE', os.dataSaida) " +
           "ORDER BY FUNCTION('DATE', os.dataSaida)")
    List<Object[]> findOrdensEntreguesPorData();

    // Relatório: Faturamento por serviço (mais útil para o Fabiano)
    @Query("SELECT s.descricao AS servico, SUM(oss.quantidade * oss.valorUnitario) AS valorTotal " +
           "FROM OrdemServicoServico oss " +
           "JOIN oss.servico s " +
           "JOIN oss.ordemServico os " +
           "WHERE os.status = 'ENTREGUE' " +
           "GROUP BY s.descricao " +
           "ORDER BY valorTotal DESC")
    List<Object[]> findFaturamentoPorServico();

    // Relatório: Faturamento por peça
    @Query("SELECT p.nome AS peca, SUM(osp.quantidade * osp.valorUnitario) AS valorTotal " +
           "FROM OrdemServicoPeca osp " +
           "JOIN osp.peca p " +
           "JOIN osp.ordemServico os " +
           "WHERE os.status = 'ENTREGUE' " +
           "GROUP BY p.nome " +
           "ORDER BY valorTotal DESC")
    List<Object[]> findFaturamentoPorPeca();

    // Buscar ordens por período (útil para dashboard)
    @Query("SELECT os FROM OrdemServico os WHERE os.dataEntrada BETWEEN :dataInicio AND :dataFim")
    List<OrdemServico> findByPeriodo(@Param("dataInicio") LocalDate dataInicio, 
                                     @Param("dataFim") LocalDate dataFim);

    // Contar ordens por status (para cards no dashboard)
    @Query("SELECT os.status, COUNT(os) FROM OrdemServico os GROUP BY os.status")
    List<Object[]> countOrdensByStatus();

    // Buscar ordens atrasadas (entrada há mais de X dias e não entregues)
    @Query("SELECT os FROM OrdemServico os WHERE os.status IN ('ABERTA', 'EM_ANDAMENTO') AND os.dataEntrada < :dataLimite")
    List<OrdemServico> findOrdensAtrasadas(@Param("dataLimite") LocalDate dataLimite);
}