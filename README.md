# Hub Central de Pedidos

Sistema integrado para centralização e gestão de pedidos de múltiplos marketplaces em uma interface unificada.

## Visão Geral

O Hub Central de Pedidos é uma solução tecnológica desenvolvida para empresas que vendem em múltiplas plataformas de e-commerce. O sistema centraliza todos os pedidos do Shopee e Mercado Livre em uma única interface, permitindo gestão eficiente e controle completo das operações.

## Valor de Negócio

**Eficiência Operacional**: Reduza o tempo gasto alternando entre diferentes plataformas de marketplace, consolidando todas as informações em um só lugar.

**Visibilidade Completa**: Tenha uma visão panorâmica de todos os pedidos, independente da origem, com estatísticas em tempo real.

**Busca Avançada**: Localize rapidamente qualquer pedido utilizando código, nome do cliente, produto ou endereço de entrega.

**Gestão Centralizada**: Monitore status de entregas, identifique gargalos operacionais e otimize processos de fulfillment.

## Funcionalidades Principais

### Centralização de Pedidos
- Visualização unificada de pedidos do Shopee e Mercado Livre
- Interface única para gerenciamento de múltiplos canais de venda
- Sincronização automática de dados entre plataformas

### Sistema de Busca Inteligente
- Busca instantânea por código do pedido, nome do cliente, produto ou endereço
- Filtros avançados para localização rápida de informações
- Resultados em tempo real com paginação eficiente

### Dashboard Executivo
- Métricas consolidadas de vendas e entregas
- Indicadores de performance por marketplace
- Estatísticas de pedidos pendentes, enviados e entregues

### Gestão de Status
- Acompanhamento visual do status de cada pedido
- Identificação de pedidos que requerem ação imediata
- Controle de prazos de envio e entrega

## Início Rápido

### Requisitos do Sistema
- Windows 10/11
- Node.js 18+ instalado
- Conexão com internet

### Instalação e Execução
```powershell
# Clone o repositório
git clone https://github.com/chmulato/hub_town.git
cd hub_town

# Execute o script de inicialização automática
.\start.ps1
```

O script automatizado irá:
1. Instalar todas as dependências necessárias
2. Configurar o ambiente de desenvolvimento
3. Inicializar o sistema back-end e front-end
4. Abrir a aplicação no navegador

### Acesso ao Sistema
- **Interface Principal**: http://localhost:5173
- **API de Dados**: http://localhost:3001

## Dados e Integração

### Fonte de Dados
O sistema atualmente utiliza dados de demonstração que simulam pedidos reais:
- **20 pedidos Shopee** com produtos e status variados
- **20 pedidos Mercado Livre** com informações completas
- Dados brasileiros realistas incluindo endereços e produtos locais

### Capacidades da API
- Endpoints REST para integração com sistemas existentes
- Suporte a paginação para grandes volumes de dados
- Filtros parametrizáveis para consultas específicas
- Formato JSON padronizado para intercâmbio de dados

## Arquitetura Técnica

### Tecnologias Utilizadas
- **Frontend**: React 18 com Vite para interface moderna e responsiva
- **Backend**: Node.js com Express.js para API robusta e escalável
- **Dados**: Arquivos JSON estruturados (preparado para migração para banco de dados)
- **Interface**: Tailwind CSS para design profissional e consistente

## Status dos Pedidos

O sistema classifica e exibe os pedidos com status codificados por cores:

```
| Status                | Descrição                          | Ação Requerida          |
|-----------------------|------------------------------------|-------------------------|
| **Entregue**          | Pedido finalizado com sucesso      | Nenhuma                 |
| **Enviado**           | Pedido em trânsito para o cliente  | Acompanhar rastreamento |
| **Pronto para Envio** | Pedido preparado aguardando coleta | Agendar envio           |
| **Aguardando Coleta** | Pedido pendente de separação       | Processar pedido        |
```

## Roadmap de Desenvolvimento

### Versão Atual (1.0)
- Centralização de pedidos Shopee e Mercado Livre
- Sistema de busca unificada
- Dashboard com métricas básicas
- Interface responsiva completa

### Próximas Versões
- **Integração em Tempo Real**: Conexão direta com APIs dos marketplaces
- **Relatórios Avançados**: Análises de vendas e performance
- **Notificações**: Alertas automáticos para ações necessárias
- **Gestão de Estoque**: Controle integrado de inventário
- **Mobile App**: Aplicação nativa para gestão móvel

## Documentação Técnica

Para desenvolvedores e administradores de sistema, consulte a documentação técnica completa:

- **[Guia de Instalação](doc/INSTALACAO.md)**: Configuração detalhada do ambiente
- **[Documentação da API](doc/API.md)**: Referência completa dos endpoints
- **[Arquitetura](doc/ARQUITETURA.md)**: Visão técnica do sistema
- **[Guia do Desenvolvedor](doc/DESENVOLVIMENTO.md)**: Informações para contribuidores

## Suporte e Contato

### Suporte Técnico
Para questões relacionadas à instalação, configuração ou uso do sistema:
- Consulte a documentação técnica na pasta `doc/`
- Abra uma issue no repositório GitHub
- Entre em contato com a equipe de desenvolvimento

### Proposta Comercial
Para discussões sobre implementação em ambiente corporativo ou customizações específicas:
- Entre em contato através do repositório GitHub
- Solicite demonstração completa das funcionalidades
- Consulte sobre adaptações para suas necessidades específicas

## Licença

Este projeto está licenciado sob a **MIT License** - uma licença permissiva que permite uso comercial, modificação, distribuição e uso privado do software.

**Principais características da MIT License:**
- **Uso Comercial**: Permitido uso em projetos comerciais
- **Modificação**: Permitido modificar o código fonte
- **Distribuição**: Permitido distribuir cópias do software
- **Uso Privado**: Permitido uso interno sem restrições
- **Sem Garantia**: Software fornecido "como está", sem garantias

Consulte o arquivo [LICENSE](LICENSE) para detalhes completos dos termos e condições.

---

**Hub Central de Pedidos** - Centralize, Gerencie, Otimize  
Versão 1.0 | Setembro 2025 | Licenciado sob MIT License