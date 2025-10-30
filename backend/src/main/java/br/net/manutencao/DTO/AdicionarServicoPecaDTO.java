package br.net.manutencao.DTO;

public class AdicionarServicoPecaDTO {
    private Long itemId;
    private Integer quantidade;

    // constructors, getters, setters

    public Long getItemId() {
        return itemId;
    }
    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }
    public Integer getQuantidade() {
        return quantidade;
    }
    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }
    
}