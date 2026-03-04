package br.net.manutencao.DTO;

import br.net.manutencao.model.*;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Component
public class OrdemServicoMapper {

    // Método exigido pelo Controller para retornar listas
    public List<OrdemServicoDTO> toDTOList(List<OrdemServico> ordens) {
        if (ordens == null) return new ArrayList<>();
        return ordens.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public OrdemServicoDTO toDTO(OrdemServico ordem) {
        if (ordem == null) return null;
        OrdemServicoDTO dto = new OrdemServicoDTO();
        dto.setId(ordem.getId());
        dto.setCliente(toClienteDTO(ordem.getCliente()));
        
        if (ordem.getBicicletasComItens() != null) {
            dto.setBicicletas(ordem.getBicicletasComItens().stream()
                .map(this::toBicicletaComItensDTO)
                .collect(Collectors.toList()));
        } else {
            dto.setBicicletas(new ArrayList<>());
        }
        
        dto.setDataEntrada(ordem.getDataEntrada());
        dto.setDataPrevisaoSaida(ordem.getDataPrevisaoSaida());
        //dto.setStatus(ordem.getStatus());
        dto.setStatus(ordem.getStatus() != null ? ordem.getStatus().name() : null);
        dto.setValorTotal(ordem.calcularValorTotal());
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
            ServicoDTO sDto = new ServicoDTO(item.getServico().getId(), item.getServico().getDescricao(), item.getServico().getValor());
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
            PecaDTO pDto = new PecaDTO(
                item.getPeca().getId(), 
                item.getPeca().getDescricao(), 
                item.getPeca().getValor(), 
                item.getPeca().getQuantidade()
            );
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
        // CPF não existe no seu modelo Cliente
        return dto;
    }
}