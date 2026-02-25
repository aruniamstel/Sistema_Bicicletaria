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
        
        // Mapear bicicletas com itens aninhados
        if (ordem.getBicicletas() != null && !ordem.getBicicletas().isEmpty()) {
            List<BicicletaComItensDTO> bicicletasDTO = ordem.getBicicletas().stream()
                .map(bike -> toBicicletaComItensDTO(bike, ordem.getServicos(), ordem.getPecas()))
                .collect(Collectors.toList());
            dto.setBicicletas(bicicletasDTO);
            
            // Manter primeira bicicleta para compatibilidade
            if (!bicicletasDTO.isEmpty()) {
                Bicicleta primeiraBike = ordem.getBicicletas().get(0);
                dto.setBicicleta(toBicicletaDTO(primeiraBike));
            }
        }
        
        dto.setDataEntrada(ordem.getDataEntrada());
        dto.setDataPrevisaoSaida(ordem.getDataPrevisaoSaida());
        dto.setDataSaidaReal(ordem.getDataSaidaReal());
        dto.setObservacoes(ordem.getObservacoes());
        dto.setStatus(ordem.getStatus().name());
        
        // Mapear serviços com bicicletaId
        List<OrdemServicoServicoDTO> servicosDTO = ordem.getServicos().stream()
            .map(this::toServicoDTO)
            .collect(Collectors.toList());
        dto.setServicos(servicosDTO);
        
        // Mapear peças com bicicletaId
        List<OrdemServicoPecaDTO> pecasDTO = ordem.getPecas().stream()
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

    private BicicletaComItensDTO toBicicletaComItensDTO(Bicicleta bicicleta, List<OrdemServicoServico> servicos, List<OrdemServicoPeca> pecas) {
        if (bicicleta == null) return null;
        BicicletaComItensDTO dto = new BicicletaComItensDTO();
        dto.setId(bicicleta.getId());
        dto.setMarca(bicicleta.getMarca());
        dto.setModelo(bicicleta.getModelo());
        dto.setCor(bicicleta.getCor());
        dto.setTamanhoAro(bicicleta.getTamanhoAro());
        
        // Serviços desta bicicleta
        if (servicos != null) {
            List<OrdemServicoServicoDTO> servicosDTO = servicos.stream()
                .filter(s -> s.getBicicleta() != null && s.getBicicleta().getId().equals(bicicleta.getId()))
                .map(this::toServicoDTO)
                .collect(Collectors.toList());
            dto.setServicos(servicosDTO);
        }
        
        // Peças desta bicicleta
        if (pecas != null) {
            List<OrdemServicoPecaDTO> pecasDTO = pecas.stream()
                .filter(p -> p.getBicicleta() != null && p.getBicicleta().getId().equals(bicicleta.getId()))
                .map(this::toPecaDTO)
                .collect(Collectors.toList());
            dto.setPecas(pecasDTO);
        }
        
        return dto;
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
        if (oss.getBicicleta() != null) {
            dto.setBicicletaId(oss.getBicicleta().getId());
        }
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
        if (osp.getBicicleta() != null) {
            dto.setBicicletaId(osp.getBicicleta().getId());
        }
        return dto;
    }

    private PecaDTO toPecaDTO(Peca peca) {
        if (peca == null) return null;
        return new PecaDTO(peca.getId(), peca.getDescricao(), peca.getValor(), peca.getQuantidade());
    }
}