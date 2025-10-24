package br.net.manutencao.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Data
@Table(name = "td_historico_solicitacao")
public class HistoricoSolicitacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private Solicitacao solicitacao; // Referência à solicitação

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnumStatus estado;

    @Column(nullable = false)
    private LocalDateTime dataHora; 

    @ManyToOne
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Usuario funcionario;

}
