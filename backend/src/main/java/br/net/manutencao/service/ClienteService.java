package br.net.manutencao.service;

import br.net.manutencao.model.Cliente;
import br.net.manutencao.repository.ClienteRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    // Listar todos os clientes
    @Transactional(readOnly = true)
    public List<Cliente> listarTodosClientes() {
        return clienteRepository.findAll();
    }

    // Buscar cliente por ID
    @Transactional(readOnly = true)
    public Cliente buscarClientePorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com ID: " + id));
    }

    // Buscar cliente com bicicletas
    @Transactional(readOnly = true)
    public Cliente buscarClienteComBicicletas(Long id) {
        return clienteRepository.findByIdWithBicicletas(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com ID: " + id));
    }

    // Buscar por telefone
    @Transactional(readOnly = true)
    public Optional<Cliente> buscarPorTelefone(String telefone) {
        return clienteRepository.findByTelefone(telefone);
    }

    // Buscar por nome
    @Transactional(readOnly = true)
    public List<Cliente> buscarPorNome(String nome) {
        return clienteRepository.findByNomeContainingIgnoreCase(nome);
    }

    // Criar novo cliente
    @Transactional
    public Cliente criarCliente(Cliente cliente) {
        // Verificar se já existe cliente com mesmo telefone
        if (clienteRepository.existsByTelefone(cliente.getTelefone())) {
            throw new IllegalArgumentException("Já existe um cliente cadastrado com este telefone: " + cliente.getTelefone());
        }
        
        return clienteRepository.save(cliente);
    }

    // Atualizar cliente
    @Transactional
    public Cliente atualizarCliente(Long id, Cliente clienteAtualizado) {
        Cliente clienteExistente = buscarClientePorId(id);
        
        // Verificar se o telefone foi alterado e se já existe outro cliente com ele
        if (!clienteExistente.getTelefone().equals(clienteAtualizado.getTelefone()) &&
            clienteRepository.existsByTelefone(clienteAtualizado.getTelefone())) {
            throw new IllegalArgumentException("Já existe outro cliente com este telefone: " + clienteAtualizado.getTelefone());
        }
        
        clienteExistente.setNome(clienteAtualizado.getNome());
        clienteExistente.setTelefone(clienteAtualizado.getTelefone());
        clienteExistente.setEndereco(clienteAtualizado.getEndereco());
        clienteExistente.setInstagram(clienteAtualizado.getInstagram());
        
        return clienteRepository.save(clienteExistente);
    }

    // Deletar cliente
    @Transactional
    public void deletarCliente(Long id) {
        Cliente cliente = buscarClientePorId(id);
        
        // Verificar se o cliente tem bicicletas cadastradas
        if (!cliente.getBicicletas().isEmpty()) {
            throw new IllegalStateException("Não é possível excluir o cliente pois existem bicicletas cadastradas para ele.");
        }
        
        clienteRepository.delete(cliente);
    }

    // Verificar se cliente existe
    @Transactional(readOnly = true)
    public boolean clienteExiste(Long id) {
        return clienteRepository.existsById(id);
    }
}