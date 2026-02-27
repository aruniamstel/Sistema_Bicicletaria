package br.net.manutencao.DTO;

import br.net.manutencao.model.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrdemServicoMapper {

    public OrdemServicoDTO toDTO(OrdemServico ordem) {
        OrdemServicoDTO dto = new OrdemServicoDTO();
        dto.setId(ordem.getId());
        dto.setCliente(toClienteDTO(ordem.getCliente()));
        
        // Mapear bicicletasComItens ao invés de bicicletas
        if (ordem.getBicicletasComItens() != null && !ordem.getBicicletasComItens().isEmpty()) {
            List<BicicletaComItensDTO> bicicletasDTO = ordem.getBicicletasComItens().stream()
                .map(this::toBicicletaComItensDTO)
                .collect(Collectors.toList());
            dto.setBicicletas(bicicletasDTO);
            
            // Manter primeira bicicleta para compatibilidade
            if (!bicicletasDTO.isEmpty()) {
                BicicletaComItens primeiraBike = ordem.getBicicletasComItens().get(0);
                dto.setBicicleta(toBicicletaComItensCompatibilitDTO(primeiraBike));
            }
        }
        
        dto.setDataEntrada(ordem.getDataEntrada());
        dto.setDataPrevisaoSaida(ordem.getDataPrevisaoSaida());
        dto.setDataSaidaReal(ordem.getDataSaidaReal());
        dto.setObservacoes(ordem.getObservacoes());
        dto.setStatus(ordem.getStatus().name());
        
        // Mapear serviços com referência a bicicletaItem
        List<ItemServicoDTO> servicosDTO = ordem.getServicos().stream()
            .map(this::toServicoDTO)
            .collect(Collectors.toList());
        dto.setServicos(servicosDTO);
        
        // Mapear peças com referência a bicicletaItem
        List<ItemPecaDTO> pecasDTO = ordem.getPecas().stream()
            .map(this::toPecaDTO)
            .collect(Collectors.toList());
        dto.setPecas(pecasDTO);
        
        dto.setValorTotal(ordem.getValorTotal());
        dto.setExibirAviso30Dias(ordem.isExibirAviso30Dias());
        return dto;
    }

    public List<OrdemServicoDTO> toDTOList(List<OrdemServico> ordens) {
        return ordens.stream().map(this::toDTO).collect(Collectors.toList());
    }

    private ClienteDTO toClienteDTO(Cliente cliente) {
        if (cliente == null) return null;
        return new ClienteDTO(cliente.getId(), cliente.getNome(), cliente.getTelefone(),
                            cliente.getEndereco(), cliente.getInstagram());
    }

    private BicicletaComItensDTO toBicicletaComItensDTO(BicicletaComItens bikeItem) {
        if (bikeItem == null) return null;
        BicicletaComItensDTO dto = new BicicletaComItensDTO();
        dto.setId(bikeItem.getId());
        dto.setMarca(bikeItem.getMarca());
        dto.setModelo(bikeItem.getModelo());
        dto.setCor(bikeItem.getCor());
        dto.setTamanhoAro(bikeItem.getTamanhoAro());
        
        // Serviços desta bicicleta item
        if (bikeItem.getServicos() != null) {
            List<ItemServicoDTO> servicosDTO = bikeItem.getServicos().stream()
                .map(this::toServicoDTO)
                .collect(Collectors.toList());
            dto.setServicos(servicosDTO);
        }
        
        // Peças desta bicicleta item
        if (bikeItem.getPecas() != null) {
            List<ItemPecaDTO> pecasDTO = bikeItem.getPecas().stream()
                .map(this::toPecaDTO)
                .collect(Collectors.toList());
            dto.setPecas(pecasDTO);
        }
        
        return dto;
    }

    // Para compatibilidade ao retornar uma bicicleta simples
    private BicicletaDTO toBicicletaComItensCompatibilitDTO(BicicletaComItens bikeItem) {
        if (bikeItem == null) return null;
        BicicletaDTO dto = new BicicletaDTO();
        dto.setId(bikeItem.getId());
        dto.setMarca(bikeItem.getMarca());
        dto.setModelo(bikeItem.getModelo());
        dto.setTamanhoAro(bikeItem.getTamanhoAro());
        dto.setCor(bikeItem.getCor());
        return dto;
    }

    /*private List<ItemServicoDTO> toServicoDTOList(List<ItemServico> servicos) {
        return servicos.stream().map(this::toServicoDTO).collect(Collectors.toList());
    } */

    /*private ItemServicoDTO toServicoDTO(ItemServico oss) {
        ItemServicoDTO dto = new ItemServicoDTO();
        dto.setId(oss.getId());
        dto.setServico(toServicoDTO(oss.getServico()));
        dto.setQuantidade(oss.getQuantidade());
        dto.setValor(oss.getValor());
        if (oss.getBicicletaItem() != null) {
            dto.setBicicletaId(oss.getBicicletaItem().getId());
        }
        return dto;
    } */

    /* 
    private ServicoDTO toServicoDTO(Servico servico) {
        if (servico == null) return null;
        return new ServicoDTO(servico.getId(), servico.getDescricao(), servico.getValor());
    } */

   /*  private List<ItemPecaDTO> toPecaDTOList(List<ItemPeca> pecas) {
        return pecas.stream().map(this::toPecaDTO).collect(Collectors.toList());
    } */

   /*  private ItemPecaDTO toPecaDTO(ItemPeca osp) {
        ItemPecaDTO dto = new ItemPecaDTO();
        dto.setId(osp.getId());
        dto.setPeca(toPecaDTO(osp.getPeca()));
        dto.setQuantidade(osp.getQuantidade());
        dto.setValor(osp.getValor());
        if (osp.getBicicletaItem() != null) {
            dto.setBicicletaId(osp.getBicicletaItem().getId());
        }
        return dto;
    } */

    // Converte a nova entidade ItemServico para o DTO que o Angular já conhece
private ItemServicoDTO toServicoDTO(ItemServico item) {
    if (item == null) return null;
    ItemServicoDTO dto = new ItemServicoDTO();
    dto.setId(item.getId());
    dto.setQuantidade(item.getQuantidade());
    dto.setValor(item.getValor());
    
    // Se o item estiver ligado a um Serviço do catálogo
    if (item.getServico() != null) {
        dto.setServico(toServicoDTO(item.getServico()));
    }
    return dto;
}

// Converte a nova entidade ItemPeca para o DTO
private ItemPecaDTO toPecaDTO(ItemPeca item) {
    if (item == null) return null;
    ItemPecaDTO dto = new ItemPecaDTO();
    dto.setId(item.getId());
    dto.setQuantidade(item.getQuantidade());
    dto.setValor(item.getValor());

    // Se o item estiver ligado a uma Peça do catálogo
    if (item.getPeca() != null) {
        dto.setPeca(toPecaDTO(item.getPeca()));
    }
    return dto;
}

    private PecaDTO toPecaDTO(Peca peca) {
        if (peca == null) return null;
        return new PecaDTO(peca.getId(), peca.getDescricao(), peca.getValor(), peca.getQuantidade());
    }
}