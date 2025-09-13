# PostgreSQL Setup — Hub Town

Configuração do PostgreSQL local via Docker Compose, alinhada ao `start.ps1` e aos scripts da pasta `database/`.

## Pré-requisitos

- Docker Desktop
- Node.js 18+
- Windows PowerShell (5.1+) ou PowerShell 7+

## Setup rápido (recomendado)

Use o orquestrador principal, que provisiona o DB e aplica schema/seeds automaticamente:

```powershell
./start.ps1
```

Ele irá:
1) Subir o container `hubtown_postgres` via docker-compose.
2) Aguardar readiness (`pg_isready`).
3) Aplicar `database/schema.sql` e `database/seeds.sql`.
4) Migrar dados JSON para o DB (`back-end/migrate-json-data.js`).
5) Iniciar backend (DATA_SOURCE=db) e frontend.

## Setup manual (alternativo)

1) Subir PostgreSQL
```powershell
docker-compose up -d
```

2) Verificar readiness
```powershell
docker exec hubtown_postgres pg_isready -U hubtown_user -d hubtown_db
```

3) Criar tabelas e popular seeds
```powershell
./database/init-db.ps1
```

4) (Opcional) Migrar dados dos JSONs de exemplo
```powershell
cd back-end; node migrate-json-data.js
```

## Conexão

- Host: localhost
- Porta: 5432
- Banco: hubtown_db
- Usuário: hubtown_user
- Senha: hubtown_pass
- Connection String: `postgresql://hubtown_user:hubtown_pass@localhost:5432/hubtown_db`

## Comandos úteis (PowerShell)

- Abrir psql dentro do container:
```powershell
docker exec -it hubtown_postgres psql -U hubtown_user -d hubtown_db
```

- Backup e restore (simples):
```powershell
docker exec hubtown_postgres pg_dump -U hubtown_user hubtown_db > backup.sql
docker exec -i hubtown_postgres psql -U hubtown_user -d hubtown_db < backup.sql
```

- Logs e ciclo de vida:
```powershell
docker logs hubtown_postgres
docker-compose ps
docker-compose down
docker-compose down -v; docker-compose up -d
```

## Consultas de exemplo

- Pedidos com informações essenciais (join normalizado):
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

- Estatísticas por marketplace:
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

- Pedidos por status:
```sql
SELECT 
    order_status,
    COUNT(*) as count
FROM orders
GROUP BY order_status
ORDER BY count DESC;
```

## Troubleshooting

- PostgreSQL não inicia (reset rápido do volume):
```powershell
docker-compose down -v; docker-compose up -d
```

- Erro de conexão:
1) Verifique containers: `docker ps`
2) Logs do Postgres: `docker logs hubtown_postgres`
3) Readiness: `docker exec hubtown_postgres pg_isready -U hubtown_user -d hubtown_db`

- Reaplicar schema/seeds manualmente:
```powershell
./database/init-db.ps1
```

- Dependências do Node.js (backend):
```powershell
cd back-end; rm -r -fo node_modules, package-lock.json; npm install
```

## Referências

- `database/schema.sql` e `database/seeds.sql`
- `database/init-db.ps1` (Windows) e `database/init-db.sh` (Linux/Mac)
- `back-end/migrate-json-data.js`
- `doc/INSTALACAO.md` para visão completa (start.ps1, testes, RabbitMQ)