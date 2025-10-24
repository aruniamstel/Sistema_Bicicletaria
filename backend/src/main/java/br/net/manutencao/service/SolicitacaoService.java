package br.net.manutencao.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.net.manutencao.DTO.ManutencaoDTO;
import br.net.manutencao.DTO.SolicitacaoCreateDTO;
import br.net.manutencao.model.Categoria;
import br.net.manutencao.model.Cliente;
import br.net.manutencao.model.EnumStatus;
import br.net.manutencao.model.Funcionario;
import br.net.manutencao.model.HistoricoSolicitacao;
import br.net.manutencao.model.Solicitacao;
import br.net.manutencao.model.Usuario;
import br.net.manutencao.repository.SolicitacaoRepository;
import br.net.manutencao.repository.CategoriaRepository;
import br.net.manutencao.repository.ClienteRepository;
import br.net.manutencao.repository.FuncionarioRepository;
import br.net.manutencao.repository.HistoricoSolicitacaoRepository;
import br.net.manutencao.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class SolicitacaoService {

    @Autowired
    FuncionarioRepository funcionarioRepository;

    @Autowired
    ClienteRepository clienteRepository;

    @Autowired
    CategoriaRepository categoriaRepository;

    @Autowired
    FuncionarioService funcionarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    @Autowired
    private HistoricoSolicitacaoRepository historicoRepository;

    @Transactional(readOnly = true)
    public List<Solicitacao> listarSolicitacoesPorUsuario(Long id) {
        Optional<Usuario> optionalUsuario = usuarioRepository.findById(id);
        List<Solicitacao> solicitacoes = new ArrayList<>();

        optionalUsuario.ifPresent(usuario -> {
            String perfilNome = usuario.getPerfil().name(); // Obtém o nome do enum como String

            // Se o perfil for CLIENTE, busca as Ordens de serviço com cliente_id igual a id
            if (perfilNome.equals("CLIENTE")) {
                solicitacoes.addAll(solicitacaoRepository.findByClienteId(id));
            }
            // Se o perfil for FUNCIONARIO, busca as Ordens de serviço com funcionario_id igual a
            // id
            else if (perfilNome.equals("FUNCIONARIO")) {
                solicitacoes.addAll(solicitacaoRepository.findByFuncionarioId(id));
            }
        });
        return solicitacoes; // Retorna a lista de Ordens de serviço
    }

    public List<Object[]> listarSolicitacoesFinalizadasPorData() {
        return solicitacaoRepository.findSolicitacoesFinalizadasPorData();
    }

    public List<Object[]> listarSolicitacoesFinalizadasPorCategoria() {
        return solicitacaoRepository.findSolicitacoesFinalizadasPorCategoria();
    }

    public Solicitacao getSolicitacaoById(Long id) {
        return solicitacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitação não encontrada com o ID: " + id));
    }

    @Transactional
    public void createSolicitacao(SolicitacaoCreateDTO solicitacaoDTO) {
        Solicitacao novaSolicitacao = new Solicitacao();
        novaSolicitacao.setDescription(solicitacaoDTO.getDescription());
        novaSolicitacao.setDefeito(solicitacaoDTO.getDefeito());
        novaSolicitacao.setPreco(-1);
        novaSolicitacao.setDate(LocalDateTime.now());
        novaSolicitacao.setStatus(EnumStatus.ABERTA);

        Optional<Categoria> categoriaOpt = categoriaRepository.findById(solicitacaoDTO.getCategoria().getId());
        if (categoriaOpt.isPresent()) {
            novaSolicitacao.setCategoria(categoriaOpt.get());
        } else {
            throw new RuntimeException("Categoria não encontrada.");
        }

        Optional<Cliente> clienteOpt = clienteRepository.findById(solicitacaoDTO.getIdCliente());
        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            System.out.println("Cliente encontrado: " + cliente.getEmail()); // Verifique o e-mail aqui
            novaSolicitacao.setCliente(cliente);
        } else {
            throw new RuntimeException("Cliente não encontrado com o ID fornecido.");
        }

        Optional<Funcionario> funcionarioOpt = funcionarioRepository.findById(1L);
        if (funcionarioOpt.isPresent()) {
            Funcionario funcionario = funcionarioOpt.get();
            System.out.println("Funcionário encontrado: " + funcionario.getNome());
            novaSolicitacao.setFuncionario(funcionario);
        } else {
            throw new RuntimeException("Funcionário não encontrado com o ID fornecido.");
        }
        solicitacaoRepository.save(novaSolicitacao);
    }

    @Transactional
    public Solicitacao orcarSolicitacao(Long id, Float valorOrcado) throws Exception {
        // Encontrar a solicitação com base no ID
        Solicitacao solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new Exception("Solicitação não encontrada"));

        // Criar o histórico da solicitação com os valores atuais
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setEstado(EnumStatus.ORÇADA); // Armazena o status anterior
        historico.setDataHora(solicitacao.getDate()); // Armazena o timestamp anterior
        historico.setFuncionario(solicitacao.getFuncionario());
        historicoRepository.save(historico); // Salva o histórico antes de atualizar a solicitação

        // Atualizar o valor orçado e o status
        solicitacao.setPreco(valorOrcado.floatValue()); // Atualiza o preço
        solicitacao.setStatus(EnumStatus.ORÇADA); // Atualiza o status
        solicitacao.setDate(LocalDateTime.now()); // Atualiza o timestamp

        // Salvar as alterações na solicitação
        return solicitacaoRepository.save(solicitacao);
    }

    @Transactional
    public Solicitacao finalizarSolicitacao(Long id) throws Exception {
        // Encontrar a solicitação com base no ID
        Solicitacao solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new Exception("Solicitação não encontrada"));

        // Criar o histórico da solicitação com os valores atuais
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setEstado(EnumStatus.FINALIZADA); // Altera status para finalizada
        historico.setDataHora(solicitacao.getDate()); // Atualiza o timestamp
        historico.setFuncionario(solicitacao.getFuncionario());
        historicoRepository.save(historico); // Salva o histórico antes de atualizar a solicitação

        // Atualizar o status
        solicitacao.setStatus(EnumStatus.FINALIZADA); // Atualiza o status
        solicitacao.setDate(LocalDateTime.now()); // Atualiza o timestamp

        // Salvar as alterações na solicitação
        return solicitacaoRepository.save(solicitacao);
    }

    @Transactional
    public Solicitacao efetuarManutencao(Long id, ManutencaoDTO manutencaoDTO) throws Exception {
        Solicitacao solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitação não encontrada com o ID: " + id));

        // Criar histórico da solicitação
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setEstado(solicitacao.getStatus());
        historico.setDataHora(solicitacao.getDate());
        historico.setFuncionario(solicitacao.getFuncionario());
        historicoRepository.save(historico);

        // Atualizar os dados da solicitação
        solicitacao.setDescricaoManutencao(manutencaoDTO.getDescricaoManutencao());
        solicitacao.setOrientacoesCliente(manutencaoDTO.getOrientacoesCliente());
        solicitacao.setStatus(EnumStatus.ARRUMADA);
        solicitacao.setDataManutencao(LocalDateTime.now());
        

        return solicitacaoRepository.save(solicitacao);
    }

    @Transactional
    public Solicitacao aprovarSolicitacao(Long id) throws Exception {
        // Encontrar a solicitação com base no ID
        Solicitacao solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new Exception("Solicitação não encontrada"));

        // Criar o histórico da solicitação com os valores atuais
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setEstado(EnumStatus.APROVADA); // Altera status para aprovada
        historico.setDataHora(solicitacao.getDate()); // Atualiza o timestamp
        historico.setFuncionario(solicitacao.getFuncionario());
        historicoRepository.save(historico); // Salva o histórico antes de atualizar a solicitação

        // Atualizar o status
        solicitacao.setStatus(EnumStatus.APROVADA); // Atualiza o status
        solicitacao.setDate(LocalDateTime.now()); // Atualiza o timestamp

        // Salvar as alterações na solicitação
        return solicitacaoRepository.save(solicitacao);
    }

    @Transactional
    public Solicitacao pagarSolicitacao(Long id) throws Exception {
        // Encontrar a solicitação com base no ID
        Solicitacao solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new Exception("Solicitação não encontrada"));

        // Criar o histórico da solicitação com os valores atuais
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setEstado(EnumStatus.PAGA); // Armazena o status anterior
        historico.setDataHora(solicitacao.getDate()); // Armazena o timestamp anterior
        historico.setFuncionario(solicitacao.getFuncionario());
        historicoRepository.save(historico); // Salva o histórico antes de atualizar a solicitação

        // Atualizar o valor orçado e o status

        solicitacao.setStatus(EnumStatus.PAGA); // Atualiza o status
        solicitacao.setDate(LocalDateTime.now()); // Atualiza o timestamp

        // Salvar as alterações na solicitação
        return solicitacaoRepository.save(solicitacao);
    }

    @Transactional
    public Solicitacao rejeitarSolicitacao(Long id, String justificativa) throws Exception {
        Solicitacao solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new Exception("Solicitação não encontrada"));

        // Criar o histórico da solicitação com os valores atuais
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setEstado(EnumStatus.REJEITADA);
        historico.setDataHora(solicitacao.getDate()); // Atualiza o timestamp
        historico.setFuncionario(solicitacao.getFuncionario());
        historicoRepository.save(historico); // Salva o histórico antes de atualizar a solicitação

        // Atualizar o status
        solicitacao.setStatus(EnumStatus.REJEITADA); // Atualiza o status
        solicitacao.setDate(LocalDateTime.now()); // Atualiza o timestamp
        solicitacao.setJustificativa(justificativa);

        // Salvar as alterações na solicitação
        return solicitacaoRepository.save(solicitacao);

    }

    @Transactional
    public Solicitacao redirecionarSolicitacao(Long idSolicitacao, Long idFuncionario) throws Exception {
        Solicitacao solicitacao = solicitacaoRepository.findById(idSolicitacao)
                .orElseThrow(() -> new Exception("Solicitação não encontrada"));

        Funcionario funcionario = funcionarioRepository.findById(idFuncionario)
                .orElseThrow(() -> new Exception("Funcionário não encontrado"));

        // Cria o histórico da solicitação antes de alterar
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setEstado(solicitacao.getStatus());
        historico.setDataHora(LocalDateTime.now()); // Timestamp atual
        historico.setFuncionario(solicitacao.getFuncionario());
        historicoRepository.save(historico);

        // Atualiza a solicitação
        solicitacao.setStatus(EnumStatus.REDIRECIONADA);
        solicitacao.setDate(LocalDateTime.now()); // Timestamp atualizado
        solicitacao.setFuncionario(funcionario);

        return solicitacaoRepository.save(solicitacao);
    }


    @Transactional
    public Solicitacao resgatarSolicitacao(Long id_solicitacao) throws Exception {
        Solicitacao solicitacao = solicitacaoRepository.findById(id_solicitacao)
                .orElseThrow(() -> new Exception("Solicitação não encontrada"));

        // Criar o histórico da solicitação com os valores atuais
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setEstado(solicitacao.getStatus());
        historico.setDataHora(solicitacao.getDate()); // Atualiza o timestamp
        historico.setFuncionario(solicitacao.getFuncionario());
        historicoRepository.save(historico); // Salva o histórico antes de atualizar a solicitação

        // Atualizar o status
        solicitacao.setStatus(EnumStatus.ORÇADA); // Atualiza o status
        solicitacao.setDate(LocalDateTime.now()); // Atualiza o timestamp

        // Salvar as alterações na solicitação
        return solicitacaoRepository.save(solicitacao);
    }
}
