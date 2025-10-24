package br.net.manutencao.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Data
@Table(name = "td_solicitacao")
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column
    private float preco;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column
    private String defeito;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnumStatus status;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @ManyToOne
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Usuario funcionario;


    @Column(name = "descricao_manutencao")
    private String descricaoManutencao;

    @Column(name = "orientacoes_cliente")
    private String orientacoesCliente;

    @Column(name = "data_manutencao")
    private LocalDateTime dataManutencao;

    @Column(name = "justificativa")
    private String justificativa;


}