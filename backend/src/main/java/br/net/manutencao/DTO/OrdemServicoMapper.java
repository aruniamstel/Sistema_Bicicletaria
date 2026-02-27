package br.net.manutencao.DTO;

import br.net.manutencao.model.*;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Component
public class OrdemServicoMapper {

    public OrdemServicoDTO toDTO(OrdemServico ordem) {
        if (ordem == null) return null;
        OrdemServicoDTO dto = new OrdemServicoDTO();
        dto.setId(ordem.getId());
        dto.setCliente(toClienteDTO(ordem.getCliente()));
        
        // Mapeia a lista bicicletasComItens (nome exato da sua entidade)
        if (ordem.getBicicletasComItens() != null) {
            dto.setBicicletas(ordem.getBicicletasComItens().stream()
                .map(this::toBicicletaComItensDTO)
                .collect(Collectors.toList()));
        } else {
            dto.setBicicletas(new ArrayList<>());
        }
        
        dto.setDataEntrada(ordem.getDataEntrada());
        dto.setDataPrevisaoSaida(ordem.getDataPrevisaoSaida());
       // dto.setStatus(ordem.getStatus());
        dto.setValorTotal(ordem.getValorTotal());
        dto.setObservacoes(ordem.getObservacoes());
        return dto;
    }

    private BicicletaComItensDTO toBicicletaComItensDTO(BicicletaComItens bike) {
        BicicletaComItensDTO dto = new BicicletaComItensDTO();
        dto.setId(bike.getId());
        dto.setMarca(bike.getMarca());
        dto.setModelo(bike.getModelo());
        dto.setCor(bike.getCor());
        dto.setTamanhoAro(bike.getTamanhoAro());
        
        if (bike.getServicos() != null) {
            dto.setServicos(bike.getServicos().stream().map(this::toItemServicoDTO).collect(Collectors.toList()));
        }
        if (bike.getPecas() != null) {
            dto.setPecas(bike.getPecas().stream().map(this::toItemPecaDTO).collect(Collectors.toList()));
        }
        return dto;
    }

    private ItemServicoDTO toItemServicoDTO(ItemServico item) {
        ItemServicoDTO dto = new ItemServicoDTO();
        dto.setId(item.getId());
        dto.setQuantidade(item.getQuantidade());
        dto.setValor(item.getValor());
        dto.setBicicletaId(item.getBicicletaItem() != null ? item.getBicicletaItem().getId() : null);
        
        if (item.getServico() != null) {
            ServicoDTO sDto = new ServicoDTO();
            sDto.setId(item.getServico().getId());
            sDto.setDescricao(item.getServico().getDescricao());
            sDto.setValor(item.getServico().getValor());
            dto.setServico(sDto);
        }
        return dto;
    }

    private ItemPecaDTO toItemPecaDTO(ItemPeca item) {
        ItemPecaDTO dto = new ItemPecaDTO();
        dto.setId(item.getId());
        dto.setQuantidade(item.getQuantidade());
        dto.setValor(item.getValor());
        dto.setBicicletaId(item.getBicicletaItem() != null ? item.getBicicletaItem().getId() : null);

        if (item.getPeca() != null) {
            PecaDTO pDto = new PecaDTO();
            pDto.setId(item.getPeca().getId());
            pDto.setDescricao(item.getPeca().getDescricao());
            pDto.setValor(item.getPeca().getValor());
            dto.setPeca(pDto);
        }
        return dto;
    }

    private ClienteDTO toClienteDTO(Cliente cliente) {
        if (cliente == null) return null;
        ClienteDTO dto = new ClienteDTO();
        dto.setId(cliente.getId());
        dto.setNome(cliente.getNome());
        dto.setTelefone(cliente.getTelefone());
        // Removido CPF pois não existe no seu Model Cliente
        return dto;
    }
}