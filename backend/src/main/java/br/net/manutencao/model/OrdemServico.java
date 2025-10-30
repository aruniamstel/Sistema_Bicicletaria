package br.net.manutencao.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.List;

import lombok.Data;

@Entity
@Data
@Table(name = "td_solicitacao")
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private LocalDateTime dataEntrada;
     private LocalDateTime dataSaida;
    private String problemaRelatado;
    private String observacoes;
    private StatusOrdem status; // ABERTA, EM_ANDAMENTO, CONCLUIDA, ENTREGUE
    
    @ManyToOne
    @JoinColumn(name = "bicicleta_id")
    private Bicicleta bicicleta;
    
    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL)
    private List<OrdemServicoServico> servicos = new ArrayList<>();
    
    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL)
    private List<OrdemServicoPeca> pecas = new ArrayList<>();

     // Constructors
    public OrdemServico() {}
    
    public OrdemServico(Long id, LocalDateTime dataEntrada, LocalDateTime dataSaida, String problemaRelatado, 
                       String observacoes, StatusOrdem status, Bicicleta bicicleta) {
        this.id = id;
        this.dataEntrada = dataEntrada;
        this.dataSaida = dataSaida;
        this.problemaRelatado = problemaRelatado;
        this.observacoes = observacoes;
        this.status = status;
        this.bicicleta = bicicleta;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public LocalDateTime getDataEntrada() { return dataEntrada; }
    public void setDataEntrada(LocalDateTime dataEntrada) { this.dataEntrada = dataEntrada; }
    
    public LocalDateTime getDataSaida() { return dataSaida; }
    public void setDataSaida(LocalDateTime dataSaida) { this.dataSaida = dataSaida; }
    
    public String getProblemaRelatado() { return problemaRelatado; }
    public void setProblemaRelatado(String problemaRelatado) { this.problemaRelatado = problemaRelatado; }
    
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    
    public StatusOrdem getStatus() { return status; }
    public void setStatus(StatusOrdem status) { this.status = status; }
    
    public Bicicleta getBicicleta() { return bicicleta; }
    public void setBicicleta(Bicicleta bicicleta) { this.bicicleta = bicicleta; }
    
    public List<OrdemServicoServico> getServicos() { return servicos; }
    public void setServicos(List<OrdemServicoServico> servicos) { this.servicos = servicos; }
    
    public List<OrdemServicoPeca> getPecas() { return pecas; }
    public void setPecas(List<OrdemServicoPeca> pecas) { this.pecas = pecas; }

    // Método para calcular valor total
    public BigDecimal getValorTotal() {
        BigDecimal totalServicos = servicos.stream()
            .map(OrdemServicoServico::getValorTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal totalPecas = pecas.stream()
            .map(OrdemServicoPeca::getValorTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        return totalServicos.add(totalPecas);
    }
}

