# Hub Town — Setup resumido (1 página)

Uma visão rápida para subir o ambiente local, URLs úteis, variáveis-chave e onde ler mais.

## Como subir (Windows PowerShell)

Na raiz do repositório:
```powershell
./start.ps1
```

O que acontece:
- Sobe PostgreSQL (Docker Compose), aplica `schema.sql` + `seeds.sql` e migra os JSONs.
- Define `DATA_SOURCE=db` no backend e inicia API (3001).
- Define `VITE_API_BASE_URL` e inicia o frontend (5173).

## URLs

- UI: http://localhost:5173
- API: http://localhost:3001/api
- Swagger UI: http://localhost:3001/api/swagger
- PostgreSQL: localhost:5432 (hubtown_user / hubtown_pass)
- RabbitMQ UI: http://localhost:15672 (hubtown_user / hubtown_pass)

## Variáveis de ambiente (essenciais)

- Backend: `DATA_SOURCE` (mock|db|api), `PORT`, `DB_HOST/PORT/NAME/USER/PASSWORD`
- Frontend: `VITE_API_BASE_URL`

## Testes

Execução end-to-end (sobe backend, espera, roda testes, encerra):
```powershell
node .\tests\scripts\run-with-server.js
```

Execução da suíte diretamente:
```powershell
node .\tests\scripts\run-all-tests.js
```

Mais detalhes: `tests/README.md`.

## Problemas comuns (atalhos)

- PowerShell Execution Policy:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

- Reset do banco (apaga dados do volume):
```powershell
docker-compose down -v; docker-compose up -d
```

- API não responde:
  - Verifique `http://localhost:3001/api/info`.
  - Cheque logs do backend e do Postgres: `docker-compose ps` / `docker logs hubtown_postgres`.

## Onde ler mais

- Instalação completa (Windows, compose, testes): `doc/INSTALACAO.md`
- Setup do PostgreSQL (detalhado): `doc/DATABASE_SETUP.md`
- RabbitMQ (setup e filas): `doc/RABBIT_MQ_SETUP.md`
- Arquitetura e fluxos: `doc/ARQUITETURA.md`