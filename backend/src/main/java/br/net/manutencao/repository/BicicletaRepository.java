package br.net.manutencao.repository;

import br.net.manutencao.model.Bicicleta;
import br.net.manutencao.model.OrdemServico;
import br.net.manutencao.model.StatusOrdem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BicicletaRepository extends JpaRepository<Bicicleta, Long> {
    List<Bicicleta> findByClienteId(Long clienteId);
}
