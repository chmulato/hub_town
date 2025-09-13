# Hub Central de Pedidos

Sistema para centralizar pedidos de múltiplos marketplaces em uma única experiência de leitura confiável. Arquitetura orientada a dados no banco (PostgreSQL) e ingestão desacoplada por fila (RabbitMQ) com serviços em Spring Boot. Frontend em React/Vite consome exclusivamente a API interna de leitura.

![Hub Central de Pedidos](doc/img/2025_09_28_IMAGE_001.png)

## Início rápido (Windows PowerShell)

```powershell
./start.ps1
```

O script provisiona o PostgreSQL via Docker, aplica schema/seeds, migra os JSONs de exemplo, define `DATA_SOURCE=db`, inicia backend e frontend e imprime as URLs úteis.

- UI: http://localhost:5173
- API: http://localhost:3001/api
- Swagger UI: http://localhost:3001/api/swagger

Pré-requisitos: Node.js 18+, Docker Desktop, PowerShell.

## Documentação (pasta `doc/`)

- Arquitetura (alto nível): [doc/ARQUITETURA.md](doc/ARQUITETURA.md)
- Guia do Desenvolvedor: [doc/DESENVOLVIMENTO.md](doc/DESENVOLVIMENTO.md)
- Instalação geral: [doc/INSTALACAO.md](doc/INSTALACAO.md)
- PostgreSQL (setup local): [doc/DATABASE_SETUP.md](doc/DATABASE_SETUP.md)
- RabbitMQ (setup e estratégia de filas): [doc/RABBIT_MQ_SETUP.md](doc/RABBIT_MQ_SETUP.md)
- Swagger/OpenAPI (API de leitura): [doc/SWAGGER_GUIDE.md](doc/SWAGGER_GUIDE.md)
- Plano de ação (progresso): [doc/PLANO_DE_ACAO.md](doc/PLANO_DE_ACAO.md)
- Resumo do setup: [doc/SETUP_SUMMARY.md](doc/SETUP_SUMMARY.md)

## Testes

- Visão geral: [tests/README.md](tests/README.md)
- Teste de integração da API: `tests/api-integration-test.js`
- Teste de configuração de endpoints (documentação): [tests/ENDPOINT_CONFIG_TEST.md](tests/ENDPOINT_CONFIG_TEST.md)

## Variáveis de ambiente (referência rápida)

- Backend: `DATA_SOURCE` (mock|db|api), `DB_*` (Postgres), `PORT`/`HOST`.
- Frontend: `VITE_API_BASE_URL`.

Detalhes completos e exemplos em: [doc/INSTALACAO.md](doc/INSTALACAO.md) e [doc/DESENVOLVIMENTO.md](doc/DESENVOLVIMENTO.md).

## Licença

Este projeto é licenciado sob a [MIT License](LICENSE).

---

Para discussões, abra issues no GitHub. Para a visão completa da arquitetura e do plano, consulte os documentos em `doc/`.