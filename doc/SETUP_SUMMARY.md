# Hub Town - Setup Completo

## Script Principal Atualizado

O arquivo `start.ps1` foi atualizado para incluir configuração completa do PostgreSQL:

### Funcionalidades Adicionadas

1. **Verificação de Dependências**
   - Docker Desktop
   - Node.js
   - Estrutura do projeto

2. **Configuração Automática do PostgreSQL**
   - Inicia container PostgreSQL via Docker Compose
   - Cria todas as tabelas (schema.sql)
   - Insere dados iniciais (seeds.sql)
   - Verifica conectividade

3. **Migração de Dados**
   - Migra dados dos JSONs dos marketplaces
   - Normaliza endereços
   - Mapeia status entre marketplaces
   - Evita duplicação de compradores

4. **Inicialização Completa**
   - Backend Node.js com PostgreSQL
   - Frontend React/Vite
   - Documentação Swagger

## Como Usar

```powershell
# Na raiz do projeto
.\start.ps1
```

### O que o script faz:

1. **Verificações iniciais**
   - Docker instalado e rodando
   - Node.js disponível
   - Estrutura do projeto

2. **Setup do PostgreSQL**
   - Para containers existentes
   - Inicia PostgreSQL fresh
   - Aguarda estar pronto
   - Executa schema.sql
   - Executa seeds.sql

3. **Migração dos dados**
   - Lê JSONs dos marketplaces
   - Normaliza dados
   - Insere no PostgreSQL

4. **Instalação de dependências**
   - Back-end: npm install
   - Front-end: npm install

5. **Inicialização dos serviços**
   - Backend na porta 3001
   - Frontend na porta 5173
   - PostgreSQL na porta 5432

## URLs Disponíveis

- **Aplicação Web**: http://localhost:5173
- **API Backend**: http://localhost:3001
- **Swagger UI**: http://localhost:3001/api/docs
- **PostgreSQL**: localhost:5432

## Banco de Dados

- **Host**: localhost
- **Porta**: 5432
- **Banco**: hubtown_db
- **Usuário**: hubtown_user
- **Senha**: hubtown_pass

## Estrutura Criada

### Tabelas Principais
- `marketplaces` - Shopee, Mercado Livre, Shein
- `addresses` - Endereços normalizados
- `buyers` - Compradores/clientes
- `drivers` - Motoristas/entregadores
- `routes` - Rotas de entrega
- `orders` - Pedidos unificados

### Dados Migrados
- ~20 pedidos do Shopee
- ~20 pedidos do Mercado Livre
- ~20 pedidos da Shein
- Total: ~60 pedidos

## Troubleshooting

### Docker não encontrado
```powershell
# Instalar Docker Desktop
# https://www.docker.com/products/docker-desktop
```

### Erro de execução do PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### PostgreSQL não inicia
```powershell
docker-compose down -v
docker-compose up -d
```

### Migração falha
- Verificar se JSONs existem em `back-end/data/`
- Verificar conectividade com PostgreSQL
- Executar manualmente: `node back-end/migrate-json-data.js`

## Próximos Passos

1. Acessar http://localhost:5173
2. Verificar dados migrados
3. Testar APIs via Swagger
4. Implementar novas funcionalidades

O sistema agora está completamente integrado com PostgreSQL e pronto para desenvolvimento!