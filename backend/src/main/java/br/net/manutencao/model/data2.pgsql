SELECT * FROM td_categoria;
-- Inserções Aleatórias
INSERT INTO td_solicitacao(preco, description, categoria_id, date, status, cliente_id, funcionario_id)
VALUES 
(150, 'Instalação de software antivírus', 18, '2024-11-02 09:00:00', 'ORCADA', 1, 1),
(250, 'Troca de cartucho de impressora', 14, '2024-11-02 10:00:00', 'REJEITADA', 1, 1),
(300, 'Configuração de rede Wi-Fi', 17, '2024-11-02 11:00:00', 'ABERTA', 1, 1);

-- select * from td_solicitacao;

SELECT * from td_solicitacao;