# Documentação Técnica - Hub Central de Pedidos

Esta pasta contém toda a documentação técnica do projeto Hub Central de Pedidos, um sistema para centralizar e gerenciar pedidos de múltiplos marketplaces.

## Índice da Documentação

### [Instalação e Configuração](INSTALACAO.md)
Guia completo para instalar, configurar e executar o sistema:
- Pré-requisitos e dependências
- Instalação automática e manual
- Configuração de portas e ambiente
- Solução de problemas comuns
- Scripts disponíveis

### [Arquitetura do Sistema](ARQUITETURA.md)
Visão técnica da arquitetura e design do sistema:
- Visão geral da arquitetura
- Componentes principais (Frontend/Backend)
- Fluxo de dados e comunicação
- Padrões de design utilizados
- Considerações de escalabilidade

### [Documentação da API](API.md)
Referência completa da API REST:
- Endpoints disponíveis
- Parâmetros e respostas
- Exemplos de uso
- Códigos de status HTTP
- Estrutura dos dados

### [Guia do Desenvolvedor](DESENVOLVIMENTO.md)
Informações para desenvolvedores e contribuidores:
- Configuração do ambiente de desenvolvimento
- Convenções de código
- Como adicionar novas features
- Debugging e troubleshooting
- Roadmap de melhorias

## Visão Geral do Sistema

O Hub Central de Pedidos é uma aplicação full-stack que:

- **Centraliza pedidos** de Shopee e Mercado Livre em uma interface unificada
- **Oferece busca avançada** em todos os marketplaces simultaneamente
- **Implementa paginação** eficiente para grandes volumes de dados
- **Fornece API REST** completa para integração com outros sistemas
- **Interface responsiva** moderna construída com React e Tailwind CSS

## Stack Tecnológica

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **JavaScript ES6+** - Linguagem

### Backend  
- **Node.js 22+** - Runtime JavaScript
- **Express.js** - Framework web
- **ES Modules** - Sistema de módulos
- **JSON Files** - Armazenamento de dados (mock)

### Ferramentas
- **PowerShell** - Scripts de automação
- **Git** - Controle de versão
- **npm** - Gerenciador de pacotes

## Funcionalidades Principais

### Busca Unificada
- Busca simultânea em todos os marketplaces
- Filtros por código, cliente, produto e endereço
- Resultados em tempo real
- Paginação dos resultados

### Interface Moderna
- Design responsivo para desktop e mobile
- Dashboard com estatísticas
- Loading states e tratamento de erros
- Navegação intuitiva

### API Completa
- Endpoints RESTful
- Paginação server-side
- Filtros e busca via query parameters
- CORS configurado para desenvolvimento

### Gestão de Pedidos
- Visualização de pedidos por marketplace
- Status coloridos por tipo
- Informações detalhadas de cada pedido
- Navegação por páginas

## Como Começar

1. **Instalação Rápida**:
   ```powershell
   git clone https://github.com/chmulato/hub_town.git
   cd hub_town
   .\start.ps1
   ```

2. **Acesse o sistema**:
   - Frontend: http://localhost:5173
   - API: http://localhost:3001

3. **Leia a documentação**:
   - Comece com [INSTALACAO.md](INSTALACAO.md)
   - Veja a [API.md](API.md) para integração
   - Consulte [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md) para contribuir

## Contribuindo

Para contribuir com o projeto:

1. Leia o [Guia do Desenvolvedor](DESENVOLVIMENTO.md)
2. Configure o ambiente de desenvolvimento
3. Siga as convenções de código estabelecidas
4. Teste suas alterações
5. Submeta um pull request

## Suporte

Para dúvidas técnicas ou problemas:

1. Consulte a seção de **Troubleshooting** em [INSTALACAO.md](INSTALACAO.md)
2. Verifique a documentação da [API](API.md)
3. Abra uma issue no repositório GitHub
4. Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: Setembro 2025  
**Versão da documentação**: 1.0  
**Compatibilidade**: Node.js 18+, Windows 10/11
