
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

-- Limpar tabelas (se necessário)
DELETE FROM ordem_servico_peca;
DELETE FROM ordem_servico_servico;
DELETE FROM ordem_servico;
DELETE FROM bicicleta;
DELETE FROM cliente;
DELETE FROM peca;
DELETE FROM servico;

-- Cadastrar serviços
INSERT INTO servico (descricao, categoria, valor_padrao) VALUES 
('Revisão Básica', 'Manutenção', 50.00),
('Revisão Completa', 'Manutenção', 100.00);

-- Cadastrar peças
INSERT INTO peca (nome, descricao, categoria, valor_unitario, estoque) VALUES 
('Pneu 26x1.95', 'Pneu para mountain bike', 'Pneu', 45.00, 10),
('Câmara de Ar 26', 'Câmara de ar', 'Pneu', 15.00, 20);

-- Cadastrar cliente (SEM CPF)
INSERT INTO cliente (nome, telefone, endereco, instagram) VALUES 
('João Silva', '(11) 99999-9999', 'Rua das Bicicletas, 123', '@joaobike');

-- Cadastrar bicicleta
INSERT INTO bicicleta (marca, modelo, tamanho_aro, cor, cliente_id) VALUES 
('Caloi', 'Mountain Bike', 26, 'Vermelha', 1);