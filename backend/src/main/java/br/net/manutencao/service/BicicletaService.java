package br.net.manutencao.service;

import br.net.manutencao.model.Bicicleta;
import br.net.manutencao.repository.BicicletaRepository;
import jakarta.persistence.EntityNotFoundException;
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
                .orElseThrow(() -> new EntityNotFoundException("Bicicleta não encontrada com ID: " + id));
    }

    @Transactional
    public Bicicleta criar(Bicicleta bicicleta) {
        return bicicletaRepository.save(bicicleta);
    }

    @Transactional(readOnly = true)
    public List<Bicicleta> listarPorCliente(Long clienteId) {
        return bicicletaRepository.findByClienteId(clienteId);
    }
}