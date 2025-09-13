# PostgreSQL Setup - HUB de Entregas

Este documento descreve como configurar o PostgreSQL localmente usando Docker para o projeto HUB de Entregas.

## Pré-requisitos

- Docker Desktop instalado
- Node.js 16+ instalado
- PowerShell (Windows)

## Setup Rápido

Execute o script automatizado na raiz do projeto:

```powershell
./start.ps1
```

Este script irá:
1. Verificar Docker e Node
2. Iniciar PostgreSQL via Docker Compose
3. Criar todas as tabelas do banco (schema.sql)
4. Inserir dados iniciais (seeds.sql)
5. Instalar dependências do backend e frontend
6. Migrar dados dos JSONs existentes para PostgreSQL
7. Configurar variáveis de ambiente de sessão e iniciar os serviços

## Setup Manual

### 1. Iniciar PostgreSQL

```powershell
docker-compose up -d
```

### 2. Aguardar PostgreSQL estar pronto

```powershell
docker exec hubtown_postgres pg_isready -U hubtown_user -d hubtown_db
```

### 3. Inicializar banco de dados

```powershell
.\database\init-db.ps1
```

### 4. Instalar dependências do backend

```powershell
cd back-end
npm install
```

### 5. Configurar variáveis de ambiente

```powershell
cp .env.example .env
```

### 6. Migrar dados dos JSONs

```powershell
node migrate-json-data.js
```

## Estrutura do Banco

O banco foi estruturado baseado no `doc/rascunho_db.txt` com as seguintes tabelas principais:

### Core Tables
- **marketplaces** - Shopee, Mercado Livre, Shein, etc.
- **addresses** - Endereços normalizados para evitar duplicação
- **buyers** - Compradores/clientes
- **drivers** - Motoristas/entregadores
- **routes** - Rotas de entrega
- **orders** - Pedidos unificados de todos os marketplaces

### Audit Tables
- **access_logs** - Logs de acesso para LGPD
- **order_status_history** - Histórico de mudanças de status

### Key Features
- **hub_order_id** gerado automaticamente (formato: HUB20250913000001)
- **Status padronizado** entre marketplaces
- **Triggers para auditoria** automática
- **Índices otimizados** para consultas frequentes
- **Suporte a dados geo** (latitude/longitude)

## Configuração de Conexão

### Dados de Conexão
```
Host: localhost
Porta: 5432
Banco: hubtown_db
Usuário: hubtown_user
Senha: hubtown_pass
```

### String de Conexão
```
postgresql://hubtown_user:hubtown_pass@localhost:5432/hubtown_db
```

## Comandos Úteis

### Conectar via psql
```bash
docker exec -it hubtown_postgres psql -U hubtown_user -d hubtown_db
```

### Backup do banco
```bash
docker exec hubtown_postgres pg_dump -U hubtown_user hubtown_db > backup.sql
```

### Restaurar backup
```bash
docker exec -i hubtown_postgres psql -U hubtown_user -d hubtown_db < backup.sql
```

### Ver logs do PostgreSQL
```bash
docker logs hubtown_postgres
```

### Parar PostgreSQL
```bash
docker-compose down
```

### Reiniciar com dados limpos
```bash
docker-compose down -v
docker-compose up -d
.\database\init-db.ps1
```

## Consultas de Exemplo

### Ver todos os pedidos com informações completas
```sql
SELECT 
    o.hub_order_id,
    o.original_order_id,
    m.name as marketplace,
    b.name as buyer,
    o.product_name,
    o.order_status,
    CONCAT(a.street, ', ', a.number, ' - ', a.neighborhood, ' - ', a.city, '/', a.state) as address
FROM orders o
JOIN marketplaces m ON o.marketplace_id = m.id
JOIN buyers b ON o.buyer_id = b.id
JOIN addresses a ON b.address_id = a.id
ORDER BY o.created_at DESC;
```

### Estatísticas por marketplace
```sql
SELECT 
    m.name as marketplace,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END) as delivered,
    COUNT(CASE WHEN o.order_status = 'shipped' THEN 1 END) as shipped
FROM orders o
JOIN marketplaces m ON o.marketplace_id = m.id
GROUP BY m.name;
```

### Pedidos por status
```sql
SELECT 
    order_status,
    COUNT(*) as count
FROM orders
GROUP BY order_status
ORDER BY count DESC;
```

## Iniciar o Backend

Após o setup do banco:

```powershell
cd back-end
npm start
```

O backend estará disponível em:
- **API**: http://localhost:3001
- **Swagger UI**: http://localhost:3001/api/swagger
- **Health Check**: http://localhost:3001/api/info

## Migração de Dados

O script `migrate-json-data.js` converte os dados dos arquivos JSON para o formato PostgreSQL:

- Normaliza endereços
- Mapeia status entre marketplaces
- Evita duplicação de compradores
- Gera hub_order_id únicos
- Registra logs de auditoria

## Troubleshooting

### PostgreSQL não inicia
```bash
docker-compose down -v
docker-compose up -d
```

### Erro de conexão
1. Verificar se PostgreSQL está rodando: `docker ps`
2. Verificar logs: `docker logs hubtown_postgres`
3. Testar conexão: `docker exec hubtown_postgres pg_isready -U hubtown_user -d hubtown_db`

### Erro nas migrations
1. Verificar se banco está acessível
2. Executar manualmente: `.\database\init-db.ps1`
3. Verificar logs de erro

### Dependências do Node.js
```bash
cd back-end
rm -rf node_modules package-lock.json
npm install
```

## Próximos Passos

1. **Implementar autenticação** para acesso aos dados
2. **Criar APIs REST** para CRUD de pedidos
3. **Sistema de rotas** para otimização de entregas
4. **Dashboard** para visualização de dados
5. **Integração real** com APIs dos marketplaces
6. **Notificações** para mudanças de status
7. **App mobile** para entregadores