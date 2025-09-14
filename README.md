# Hub Town — Central de Pedidos

![Hub Town](doc/img/2025_09_28_IMAGE_001.png)

Leitura consistente para o frontend a partir do PostgreSQL. Ingestão feita por serviço Spring Boot publicando no RabbitMQ; a API Node/Express expõe endpoints de leitura documentados no Swagger.

## Início rápido (Windows PowerShell)

Pré-requisitos: Docker Desktop, Node.js 18+

```powershell
./start.ps1
```

URLs úteis:
- UI: http://localhost:5173
- API: http://localhost:3001/api
- Swagger UI: http://localhost:3001/api/swagger
- OpenAPI Spec: http://localhost:3001/api/swagger.json
- RabbitMQ UI: http://localhost:15672 (hubtown_user / hubtown_pass)
- PostgreSQL: localhost:5432 (hubtown_user / hubtown_pass)

## Testes

Executar a suíte com servidor automatizado:
```powershell
node .\tests\scripts\run-with-server.js
```

Resultados ficam em `tests/results/`.

## Documentação

- Índice de documentação: `doc/README.md`
- Instalação: `doc/INSTALACAO.md`
- Swagger (API de leitura): `doc/SWAGGER_GUIDE.md`
- Arquitetura: `doc/ARQUITETURA.md`
- Guia do desenvolvedor: `doc/DESENVOLVIMENTO.md`

## Configuração

- Backend: `DATA_SOURCE` (mock|db|api), `DB_*`, `PORT`
- Frontend: `VITE_API_BASE_URL`

## Licença

MIT — veja [LICENSE](LICENSE).