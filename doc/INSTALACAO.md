# Guia de Instalação e Configuração — Hub Town

## Pré-requisitos

- Windows 10/11
- PowerShell 5.1+ (ou PowerShell 7+)
- Node.js 18+ e npm — https://nodejs.org/
- Docker Desktop — https://www.docker.com/products/docker-desktop
- Git — https://git-scm.com/

Verifique versões:
```powershell
node --version
npm --version
git --version
docker --version
```

## Início rápido (recomendado)

Na raiz do repositório:
```powershell
./start.ps1
```

O script irá:
- Subir o PostgreSQL (Docker Compose) e aguardar readiness.
- Aplicar `schema.sql` e `seeds.sql` e migrar os JSONs de exemplo para o DB.
- Definir `DATA_SOURCE=db` e iniciar o back-end (porta 3001).
- Definir `VITE_API_BASE_URL` e iniciar o front-end (porta 5173).
- Exibir URLs úteis ao final.

URLs padrão:
- UI: http://localhost:5173
- API: http://localhost:3001/api
- Swagger UI: http://localhost:3001/api/swagger
- RabbitMQ UI: http://localhost:15672 (user: hubtown_user, pass: hubtown_pass)

Referências:
- Visão geral: `README.md`
- Setup de RabbitMQ e estratégia de filas: `doc/RABBIT_MQ_SETUP.md`
- Topologia e fluxos: `doc/ARQUITETURA.md`

## Infraestrutura (opcional: subir manualmente)

Para subir apenas a infraestrutura local (Postgres + RabbitMQ):
```powershell
docker-compose up -d
```

Conexão padrão do Postgres (definida no compose):
- Host: localhost
- Porta: 5432
- DB: hubtown_db
- User: hubtown_user
- Pass: hubtown_pass

Gestão do RabbitMQ:
- UI: http://localhost:15672 (hubtown_user / hubtown_pass)
- Guia operacional e convenções: `doc/RABBIT_MQ_SETUP.md`

## Execução manual (alternativa)

1) Back-end (API)
```powershell
cd back-end
npm install
$env:DATA_SOURCE = "db"
npm start
```

2) Front-end (UI)
```powershell
cd front-end
npm install
$env:VITE_API_BASE_URL = "http://localhost:3001/api"
npm run dev
```

## Variáveis de ambiente (essenciais)

- Back-end (API)
  - `DATA_SOURCE` = mock | db | api (default: mock)
  - `PORT` (default: 3001)
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (conforme docker-compose)
  - `NODE_ENV` (development|production)
- Front-end (UI)
  - `VITE_API_BASE_URL` (ex.: http://localhost:3001/api)

Observação: As configurações padrão do DB são carregadas do `docker-compose.yml`. Ajustes finos de API/Swagger estão descritos em `doc/SWAGGER_GUIDE.md` e `doc/DESENVOLVIMENTO.md`.

## Testes

Execução end-to-end (sobe backend, aguarda readiness, roda testes, encerra):
```powershell
node .\tests\scripts\run-with-server.js
```

Execução direta da suíte:
```powershell
node .\tests\scripts\run-all-tests.js
```

Variáveis úteis:
- `TEST_API_URL` (default: http://localhost:3001/api)
- `TEST_TIMEOUT` (default: 10000)
- `TEST_CONCURRENT` (default: false)

Mais detalhes em: `tests/README.md`.

## Solução de problemas

- Política de execução do PowerShell
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

- Portas em uso (3001 ou 5173)
```powershell
netstat -ano | findstr :3001
taskkill /f /pid <PID>
```

- Docker parado ou compose inconsistente
```powershell
docker info
docker-compose ps
docker-compose logs --tail=100
```

- Resetar banco rapidamente (atenção: apaga dados do volume!)
```powershell
docker-compose down -v
docker-compose up -d
```

- Falha no front-end ao buscar dados
  - Confirme a variável `VITE_API_BASE_URL`.
  - Verifique se a API responde em `http://localhost:3001/api/info`.

## Próximos passos

- Guia do desenvolvedor: `doc/DESENVOLVIMENTO.md`
- Arquitetura (alto nível): `doc/ARQUITETURA.md`
- Swagger/OpenAPI: `doc/SWAGGER_GUIDE.md`
- Setup do PostgreSQL: `doc/DATABASE_SETUP.md`
- RabbitMQ (setup e filas): `doc/RABBIT_MQ_SETUP.md`

### Configuração do Vite

Personalize `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Para acesso externo
    open: true  // Abrir browser automaticamente
  }
})
```

### Configuração do Express

Adicione middleware em `server.js`:
```javascript
// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rate limiting (adicionar express-rate-limit)
// Compression (adicionar compression)
```

## Próximos Passos

Após a instalação, consulte:
- [SWAGGER_GUIDE.md](SWAGGER_GUIDE.md) - Documentação da API de leitura (Swagger/OpenAPI)
- [ARQUITETURA.md](ARQUITETURA.md) - Arquitetura do sistema
- [README.md](../README.md) - Visão geral do projeto
