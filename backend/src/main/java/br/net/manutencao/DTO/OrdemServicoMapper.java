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
        dto.setBicicleta(toBicicletaDTO(ordem.getBicicleta()));
        dto.setDataEntrada(ordem.getDataEntrada());
        dto.setDataPrevisaoSaida(ordem.getDataPrevisaoSaida());
        dto.setDataSaidaReal(ordem.getDataSaidaReal());
        dto.setObservacoes(ordem.getObservacoes());
        dto.setStatus(ordem.getStatus().name());
        dto.setServicos(toServicoDTOList(ordem.getServicos()));
        dto.setPecas(toPecaDTOList(ordem.getPecas()));
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

    private BicicletaDTO toBicicletaDTO(Bicicleta bicicleta) {
        if (bicicleta == null) return null;
        BicicletaDTO dto = new BicicletaDTO();
        dto.setId(bicicleta.getId());
        dto.setMarca(bicicleta.getMarca());
        dto.setModelo(bicicleta.getModelo());
        dto.setTamanhoAro(bicicleta.getTamanhoAro());
        dto.setCor(bicicleta.getCor());
        dto.setCliente(toClienteDTO(bicicleta.getCliente()));
        return dto;
    }

    private List<OrdemServicoServicoDTO> toServicoDTOList(List<OrdemServicoServico> servicos) {
        return servicos.stream().map(this::toServicoDTO).collect(Collectors.toList());
    }

    private OrdemServicoServicoDTO toServicoDTO(OrdemServicoServico oss) {
        OrdemServicoServicoDTO dto = new OrdemServicoServicoDTO();
        dto.setId(oss.getId());
        dto.setServico(toServicoDTO(oss.getServico()));
        dto.setQuantidade(oss.getQuantidade());
        dto.setValor(oss.getValor());
        return dto;
    }

    private ServicoDTO toServicoDTO(Servico servico) {
        if (servico == null) return null;
        return new ServicoDTO(servico.getId(), servico.getDescricao(), servico.getValor());
    }

    private List<OrdemServicoPecaDTO> toPecaDTOList(List<OrdemServicoPeca> pecas) {
        return pecas.stream().map(this::toPecaDTO).collect(Collectors.toList());
    }

    private OrdemServicoPecaDTO toPecaDTO(OrdemServicoPeca osp) {
        OrdemServicoPecaDTO dto = new OrdemServicoPecaDTO();
        dto.setId(osp.getId());
        dto.setPeca(toPecaDTO(osp.getPeca()));
        dto.setQuantidade(osp.getQuantidade());
        dto.setValor(osp.getValor());
        return dto;
    }

    private PecaDTO toPecaDTO(Peca peca) {
        if (peca == null) return null;
        return new PecaDTO(peca.getId(), peca.getDescricao(), peca.getValor(), peca.getQuantidade());
    }
}