package br.net.manutencao.service;

import br.net.manutencao.model.Bicicleta;
import br.net.manutencao.repository.BicicletaRepository;
import br.net.manutencao.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BicicletaService {

    @Autowired
    private BicicletaRepository bicicletaRepository;

    @Transactional(readOnly = true)
    public List<Bicicleta> listarTodas() {
        return bicicletaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Bicicleta buscarPorId(Long id) {
        return bicicletaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bicicleta não encontrada com ID: " + id));
    }

    @Transactional
    public Bicicleta criar(Bicicleta bicicleta) {
        return bicicletaRepository.save(bicicleta);
    }

    @Transactional(readOnly = true)
    public List<Bicicleta> listarPorCliente(Long clienteId) {
        return bicicletaRepository.findByClienteId(clienteId);
    }

    @Transactional
    public Bicicleta atualizar(Long id, Bicicleta bicicletaAtualizada) {
        // Validar ID
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID inválido");
        }

        // Buscar bicicleta existente
        Bicicleta bicicleta = bicicletaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bicicleta não encontrada com ID: " + id));

        // Atualizar apenas os campos fornecidos
        if (bicicletaAtualizada.getMarca() != null && !bicicletaAtualizada.getMarca().trim().isEmpty()) {
            bicicleta.setMarca(bicicletaAtualizada.getMarca());
        }
        if (bicicletaAtualizada.getModelo() != null && !bicicletaAtualizada.getModelo().trim().isEmpty()) {
            bicicleta.setModelo(bicicletaAtualizada.getModelo());
        }
        if (bicicletaAtualizada.getTamanhoAro() != null) {
            if (bicicletaAtualizada.getTamanhoAro() < 12 || bicicletaAtualizada.getTamanhoAro() > 29) {
                throw new IllegalArgumentException("Tamanho do aro deve estar entre 12 e 29 polegadas");
            }
            bicicleta.setTamanhoAro(bicicletaAtualizada.getTamanhoAro());
        }
        if (bicicletaAtualizada.getCor() != null && !bicicletaAtualizada.getCor().trim().isEmpty()) {
            bicicleta.setCor(bicicletaAtualizada.getCor());
        }
        if (bicicletaAtualizada.getCliente() != null) {
            bicicleta.setCliente(bicicletaAtualizada.getCliente());
        }

        return bicicletaRepository.save(bicicleta);
    }

    @Transactional
    public void deletar(Long id) {
        // Validar ID
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID inválido");
        }

        // Buscar bicicleta existente
        Bicicleta bicicleta = bicicletaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bicicleta não encontrada com ID: " + id));

        // Verificar se há ordem de serviço associada
        if (bicicleta.getOrdemServico() != null) {
            throw new IllegalStateException("Não é possível deletar a bicicleta pois existe uma ordem de serviço associada");
        }

        bicicletaRepository.delete(bicicleta);
    }
}