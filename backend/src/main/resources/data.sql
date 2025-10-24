-- Inserir categorias 
INSERT INTO td_categoria (nome) VALUES
('Notebook'),
('Desktop'),
('Impressora'),
('Mouse'),
('Teclado');

/*---------INSERIR FUNCIONARIOS PRIMEIRO------------*/
-- Funcionário: login: maria@email.com, senha: 7513
INSERT INTO td_usuario(email_usu, nome_usu, perfil_usu, salt, senha_usu)
VALUES ('maria@email.com', 'Maria', 'FUNCIONARIO','KESsYPO6fKzNgBhMAVlH6w==', 'Z00PeqRod8CGT4bAp/hiP1sAqMWaFx3W0vzYb1mFdr8=');

INSERT INTO td_funcionario(id_usu, data_nasc)
VALUES (1, '1993-05-16');

-- Funcionário: login: mario@email.com, senha: 7849
INSERT INTO td_usuario(email_usu, nome_usu, perfil_usu, salt, senha_usu)
VALUES ('mario@email.com', 'Mário', 'FUNCIONARIO', 'Q/zsqM6xOjzKBYkKq3Im7Q==', '6guzLB8JfMRRym97ks21xMnAxTO5M8Dvwic9ebRmOaQ=');

INSERT INTO td_funcionario(id_usu, data_nasc)
VALUES (2, '1990-05-15');

/*---------INSERIR CLIENTES ----------------------*/
INSERT INTO td_usuario(email_usu, nome_usu, perfil_usu, salt, senha_usu)
VALUES 
  ('joao@email.com', 'João', 'CLIENTE', 'Q/zsqM6xOjzKBYkKq3Im7Q==', '6guzLB8JfMRRym97ks21xMnAxTO5M8Dvwic9ebRmOaQ='),
  ('jose@email.com', 'José', 'CLIENTE', 'Q/zsqM6xOjzKBYkKq3Im7Q==', '6guzLB8JfMRRym97ks21xMnAxTO5M8Dvwic9ebRmOaQ='),
  ('joana@email.com', 'Joana', 'CLIENTE', 'Q/zsqM6xOjzKBYkKq3Im7Q==', '6guzLB8JfMRRym97ks21xMnAxTO5M8Dvwic9ebRmOaQ='),
  ('joaquina@email.com', 'Joaquina', 'CLIENTE', 'Q/zsqM6xOjzKBYkKq3Im7Q==', '6guzLB8JfMRRym97ks21xMnAxTO5M8Dvwic9ebRmOaQ=');

INSERT INTO td_cliente(
  bairro_usu, cep_usu, complemento_usu, cpf_usu, estado_usu, 
  localidade_usu, numero_usu, rua_usu, telefone_usu, id_usu
)
VALUES
  ('Centro', '12345-678', 'Apto 101', '123.456.789-00', 'SP', 
   'São Paulo', '100', 'Rua Principal', '(11) 91234-5678', 3),
  ('Jardim das Flores', '23456-789', 'Casa', '234.567.890-11', 'RJ', 
   'Rio de Janeiro', '200', 'Rua das Rosas', '(21) 92345-6789', 4),
  ('Vila Nova', '34567-890', 'Bloco B, Apto 202', '345.678.901-22', 'MG', 
   'Belo Horizonte', '300', 'Avenida das Palmeiras', '(31) 93456-7890', 5),
  ('Bairro Alto', '45678-901', 'Condomínio Sol, Apto 303', '456.789.012-33', 'PR', 
   'Curitiba', '400', 'Rua do Sol', '(41) 94567-8901', 6);

-- Inserindo 20 Ordens de serviço
INSERT INTO td_solicitacao (date, description, preco, status, categoria_id, cliente_id, funcionario_id, defeito, justificativa) VALUES
-- Ordens de serviço associadas a diferentes categorias, clientes e funcionários
('2024-11-01 10:00:00', 'Logitech G512', 150.0, 'ABERTA', 5, 3, 1, 'Teclas travando', NULL),
('2024-11-01 11:30:00', 'Logitech M330', 80.0, 'REDIRECIONADA', 4, 4, 2, 'Botão esquerdo não responde', NULL),
('2024-11-02 09:00:00', 'Dell Inspiron 15', 300.0, 'ORÇADA', 1, 5, 1, 'Sistema operacional não inicializa', NULL),
('2024-11-02 15:00:00', 'HP LaserJet Pro', 250.0, 'APROVADA', 3, 6, 2, 'Erro ao puxar papel', NULL),
('2024-11-03 08:00:00', 'Desktop Gamer', 600.0, 'FINALIZADA', 2, 3, 1, 'Peças ainda na embalagem', NULL),
('2024-11-03 10:30:00', 'Lenovo Ideapad 3', 400.0, 'PAGA', 1, 4, 1, 'Placa-mãe danificada', NULL),
('2024-11-04 14:00:00', 'Epson EcoTank L3150', 120.0, 'REJEITADA', 3, 5, 2, 'Erro na conexão via Wi-Fi', 'Cliente considerou o preço elevado'),
('2024-11-05 13:00:00', 'HP Pavilion x360', 100.0, 'ARRUMADA', 1, 6, 2, 'Sistema desatualizado', NULL),
('2024-11-05 16:00:00', 'Razer DeathAdder', 50.0, 'ABERTA', 4, 3, 1, 'Sensor óptico intermitente', NULL),
('2024-11-06 09:00:00', 'HP ProDesk 400', 220.0, 'ORÇADA', 2, 4, 1, 'Fonte queimada', NULL),
('2024-11-06 14:30:00', 'Acer Aspire 5', 90.0, 'APROVADA', 1, 5, 1, 'Superaquecimento devido a poeira', NULL),
('2024-11-07 08:00:00', 'Redragon Kumara', 200.0, 'REDIRECIONADA', 5, 6, 2, 'Configuração inicial do dispositivo', NULL),
('2024-11-07 11:00:00', 'Rede Local', 180.0, 'FINALIZADA', 3, 3, 1, 'Falhas intermitentes na conexão', NULL),
('2024-11-08 09:30:00', 'Brother HL-L2350DW', 70.0, 'PAGA', 3, 4, 2, 'Drivers desatualizados', NULL),
('2024-11-08 14:30:00', 'Samsung Galaxy Book', 170.0, 'ABERTA', 5, 5, 2, 'Teclas não funcionam', NULL),
('2024-11-09 08:30:00', 'ASUS VivoBook 15', 450.0, 'ORÇADA', 1, 6, 1, 'Memória insuficiente para aplicativos', NULL),
('2024-11-09 12:00:00', 'Dell OptiPlex 3080', 250.0, 'APROVADA', 2, 3, 2, 'Fonte parando aleatoriamente', NULL),
('2024-11-10 09:00:00', 'Acer Nitro 5', 500.0, 'REJEITADA', 1, 4, 1, 'HD com setores defeituosos', 'Cliente optou por comprar novo equipamento'),
('2024-11-10 14:30:00', 'Logitech K380', 130.0, 'ARRUMADA', 5, 5, 1, 'Problemas na sincronização Bluetooth', NULL),
('2024-11-11 10:00:00', 'Canon G3110', 300.0, 'FINALIZADA', 3, 6, 2, 'Cabeçote de impressão entupido', NULL);

-- Histórico de alterações para as Ordens de serviço
INSERT INTO td_historico_solicitacao (data_hora, estado, funcionario_id, solicitacao_id) VALUES
-- Históricos para a solicitação 1
('2024-11-01 10:30:00', 'ORÇADA', 1, 1),
('2024-11-02 09:00:00', 'APROVADA', 1, 1),
('2024-11-02 14:00:00', 'FINALIZADA', 1, 1),

-- Históricos para a solicitação 2
('2024-11-01 12:00:00', 'APROVADA', 2, 2),
('2024-11-02 10:00:00', 'ARRUMADA', 2, 2),

-- Históricos para a solicitação 3
('2024-11-02 10:30:00', 'REDIRECIONADA', 2, 3),
('2024-11-03 11:00:00', 'APROVADA', 2, 3),

-- Históricos para outras Ordens de serviço
('2024-11-03 15:00:00', 'FINALIZADA', 2, 4),
('2024-11-04 09:00:00', 'PAGA', 2, 5),
('2024-11-04 15:30:00', 'REJEITADA', 2, 6),
('2024-11-05 08:00:00', 'ABERTA', 1, 7),
('2024-11-05 14:30:00', 'FINALIZADA', 2, 8),
('2024-11-06 11:00:00', 'ARRUMADA', 2, 9),
('2024-11-06 15:30:00', 'FINALIZADA', 2, 10),
('2024-11-07 12:00:00', 'PAGA', 1, 11),
('2024-11-07 15:30:00', 'FINALIZADA', 1, 12),
('2024-11-08 10:00:00', 'REDIRECIONADA', 2, 13),
('2024-11-08 16:30:00', 'FINALIZADA', 1, 14),
('2024-11-09 11:00:00', 'APROVADA', 1, 15),
('2024-11-09 15:30:00', 'FINALIZADA', 1, 16),
('2024-11-10 10:30:00', 'ORÇADA', 2, 17),
('2024-11-10 15:30:00', 'FINALIZADA', 2, 18),
('2024-11-11 12:30:00', 'APROVADA', 1, 19),
('2024-11-11 16:30:00', 'FINALIZADA', 2, 20);