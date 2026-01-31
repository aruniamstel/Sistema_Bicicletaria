-- Dados iniciais para teste
INSERT INTO cliente (nome, telefone, endereco, instagram) VALUES 
('João Silva', '(11) 99999-9999', 'Rua das Bicicletas, 123', '@joaobike'),
('Maria Santos', '(11) 88888-8888', 'Avenida Principal, 456', '@mariabikes');

INSERT INTO bicicleta (marca, modelo, tamanho_aro, cor, cliente_id) VALUES 
('Caloi', 'Mountain Bike', 26, 'Vermelha', 1),
('Monark', 'Barra Circular', 29, 'Preta', 2);

INSERT INTO servico (descricao, valor) VALUES 
('Revisão Básica', 50.00),
('Troca de Pneu', 25.00);

INSERT INTO peca (descricao, valor, quantidade) VALUES 
('Pneu 26x1.95', 45.00, 10),
('Câmara de Ar 26', 15.00, 20);