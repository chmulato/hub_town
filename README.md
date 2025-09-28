# Hub Town — Central de Pedidos

Sistema para centralizar pedidos de múltiplos marketplaces em uma única experiência de leitura confiável. Arquitetura orientada a dados no banco (PostgreSQL) e ingestão desacoplada por fila (RabbitMQ) com serviços em Spring Boot. O frontend (React/Vite) consome exclusivamente a API interna de leitura (Node/Express).

![Hub Town](doc/img/2025_09_28_IMAGE_001.png)

## Início rápido (Windows PowerShell)

Pré-requisitos: Node.js 18+, Docker Desktop, PowerShell.

```powershell
./start.ps1
```

O script provisiona o PostgreSQL via Docker, aplica schema/seeds, migra os JSONs de exemplo, define `DATA_SOURCE=db`, inicia backend e frontend e imprime as URLs úteis.

URLs úteis:
- UI: http://localhost:5173
- API: http://localhost:3001/api
- Swagger UI: http://localhost:3001/api/swagger
- OpenAPI Spec: http://localhost:3001/api/swagger.json
- RabbitMQ UI: http://localhost:15672 (hubtown_user / hubtown_pass)
- PostgreSQL: localhost:5432 (hubtown_user / hubtown_pass)

## Testes

- Execução rápida (com servidor automatizado):
```powershell
node .\tests\scripts\run-with-server.js
```
- Visão geral e outras opções: [tests/README.md](tests/README.md)

Resultados ficam em `tests/results/`.

## Documentação

- Índice: [doc/README.md](doc/README.md)
- Instalação: [doc/INSTALACAO.md](doc/INSTALACAO.md)
- Swagger (API de leitura): [doc/SWAGGER_GUIDE.md](doc/SWAGGER_GUIDE.md)
- Arquitetura: [doc/ARQUITETURA.md](doc/ARQUITETURA.md)
- Guia do desenvolvedor: [doc/DESENVOLVIMENTO.md](doc/DESENVOLVIMENTO.md)
- PostgreSQL (setup local): [doc/DATABASE_SETUP.md](doc/DATABASE_SETUP.md)
- RabbitMQ (filas/estratégia): [doc/RABBIT_MQ_SETUP.md](doc/RABBIT_MQ_SETUP.md)
- Resumo do setup: [doc/SETUP_SUMMARY.md](doc/SETUP_SUMMARY.md)
- Plano de ação: [doc/PLANO_DE_ACAO.md](doc/PLANO_DE_ACAO.md)

## Variáveis de ambiente (referência rápida)

- Backend: `DATA_SOURCE` (mock|db|api), `DB_*` (host, port, name, user, password), `PORT`/`HOST`
- Frontend: `VITE_API_BASE_URL`

Detalhes completos em: [doc/INSTALACAO.md](doc/INSTALACAO.md) e [doc/DESENVOLVIMENTO.md](doc/DESENVOLVIMENTO.md).

## Licença

MIT — veja [LICENSE](LICENSE).
