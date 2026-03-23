# Sistema de Gestão de Ativos e Manutenção para Bicicletarias (Bicycle Service Engine)

## 📖 Sobre o Projeto

Solução corporativa robusta para o gerenciamento de ordens de serviço e controle de inventário em ambientes de manutenção técnica. O sistema foi projetado para centralizar a operação, garantindo a integridade dos dados e a automação de fluxos de saída documental.

**Status de Implantação:** Produção (Deployed via VPS).   
**Modelo de arquitetura**: Cliente-Servidor desacoplada, operando sobre protocolo HTTP/REST

### Funcionalidades implementadas:  
- Geração de PDF da Ordem de Serviço
- Possibilidade de exportar dados no formato CSV

## 🛠️ Especificações Técnicas e Arquitetura do Sistema

- **Backend:** Java 17 com ecossistema Spring Boot; 
 Implementação de camadas de persistência (JPA/Hibernate), lógica de negócio (Services) e exposição de endpoints (REST Controllers).

- **Front-end:** Angular 17;  
Interface reativa focada em performance e UX técnica, com gerenciamento de estado e consumo assíncrono de APIs.

- **Persistência:** PostgreSQL. Modelagem relacional otimizada para consistência ACID.
  
## 🛠️ Funcionalidades Implementadas

- Motor de Geração de Documentos:

 Engine integrada para emissão de Ordens de Serviço em formato PDF, assegurando conformidade com requisitos de registro físico;

- Pipeline de Exportação de Dados:

 Módulo de extração de relatórios em CSV para análise externa e auditoria de dados.

- Gestão de Fluxo de Trabalho:

  CRUD completo de ordens de serviço com persistência em tempo real e validação de integridade.

- Segurança de Acesso:

  Camada de autenticação e controle de sessão no frontend integrada aos endpoints de backend.

O Gemini disse
Para alinhar o README à sua nova narrativa profissional — técnico, lógico, implacável e preciso — precisamos remover toda a linguagem de "aprendizado" e substituí-la por decisões de engenharia.

Um desenvolvedor com o seu perfil não "desenvolve habilidades", ele entrega soluções arquitetadas. O foco sai do "eu aprendi" e vai para "o sistema faz".

Aqui está a revisão estratégica para o seu repositório:

Sistema de Gestão de Ativos e Manutenção (Bicycle Service Engine)
📖 Visão Geral
Solução corporativa robusta para o gerenciamento de ordens de serviço e controle de inventário em ambientes de manutenção técnica. O sistema foi projetado para centralizar a operação, garantindo a integridade dos dados e a automação de fluxos de saída documental.

Status de Implantação: Produção (Deployed via VPS).

Arquitetura: Cliente-Servidor desacoplada, operando sobre protocolo HTTP/REST.

🛠️ Especificações Técnicas e Arquitetura
O ecossistema foi construído sob o princípio da responsabilidade única e escalabilidade modular:

Backend: Java 17 com ecossistema Spring Boot. Implementação de camadas de persistência (JPA/Hibernate), lógica de negócio (Services) e exposição de endpoints (REST Controllers).

Frontend: Angular 17. Interface reativa focada em performance e UX técnica, com gerenciamento de estado e consumo assíncrono de APIs.

Persistência: PostgreSQL. Modelagem relacional otimizada para consistência ACID.

Infraestrutura & Deploy: Configuração de servidor Nginx como proxy reverso, garantindo a segurança e o roteamento eficiente do tráfego para o ambiente de produção em VPS.

## ⚙️ Funcionalidades Implementadas
**Motor de Geração de Documentos:** Engine integrada para emissão de Ordens de Serviço em formato PDF, assegurando conformidade com requisitos de registro físico.

**Pipeline de Exportação de Dados:** Módulo de extração de relatórios em CSV para análise externa e auditoria de dados.

**Gestão de Fluxo de Trabalho:** CRUD completo de ordens de serviço com persistência em tempo real e validação de integridade.

**Segurança de Acesso:** Camada de autenticação e controle de sessão no frontend integrada aos endpoints de backend.

## 🚀 Diferenciais de Engenharia  

**Full Cycle Deployment:** O projeto não reside apenas em ambiente local; foi orquestrado, configurado e mantido em ambiente de nuvem, demonstrando domínio sobre o ciclo de vida completo do software.

**Arquitetura Limpa:** Separação rigorosa de interesses (SoC), facilitando a manutenção e a futura implementação de microserviços.

**Resiliência:** Tratamento de exceções centralizado e validações de DTO para garantir que apenas dados íntegros atinjam a camada de persistência.

## 📝 Notas do Autor

Autor: Aruni van Amstel  
Hoje, como desenvolvedor focado em Desenvolvimento Full Stack e domínio completo do processo de Análise de Sistemas, valorizo o aprendizado que tive aqui sobre arquitetura de software e criação de soluções comerciais complexas e escaláveis.

