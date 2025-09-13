# Hub Town — Swagger UI (guia rápido)

Escopo: este guia cobre a API de leitura (Node/Express) exposta em `/api/*`. A escrita/ingestão é responsabilidade de um serviço Spring Boot que publica no RabbitMQ e persiste no PostgreSQL. Para o fluxo de ingestão, consulte `doc/RABBIT_MQ_SETUP.md`.

## URLs
- Swagger UI: http://localhost:3001/api/swagger
- Spec JSON: http://localhost:3001/api/swagger.json
- Docs resumida: http://localhost:3001/api/docs (deprecated)

Base path: o spec já define `/api`; na UI os caminhos aparecem como `/orders/*`, `/marketplace/*`, etc.

## Como usar (rápido)
- Clique em “Try it out” para executar requisições pela UI.
- Confira `GET /api/info` para status geral e se a autenticação está habilitada.
- Importe `/api/swagger.json` no Postman/Insomnia para gerar coleções.

## Autenticação (se habilitada)
1) Faça login: `POST /api/auth/login` com `{"username":"admin","password":"admin123"}`.
2) Clique em “Authorize” e informe: `Bearer <SEU_TOKEN_JWT>`.
3) As requisições subsequentes usam o token automaticamente.

## Modelos essenciais
- Order, PaginatedResponse, ErrorResponse, LoginRequest/Response, Marketplace, Statistics
- Notas: `status` em MAIÚSCULAS; `marketplace` é o slug (`shopee`, `mercadolivre`, `shein`); `marketplaceInfo` traz `name`, `icon`, `color`.

## Exemplos
Busca unificada
```yaml
GET /api/orders/search
query: { page: 1, limit: 10, search: "Silva" }
```

Pedidos por marketplace
```yaml
GET /api/marketplace/shopee/orders
query: { page: 1, limit: 5 }
```

Estatísticas
```yaml
GET /api/orders/stats
```

## Endpoints (leitura)
- Info: `GET /api/info` (resumo também em `/api/docs`, deprecated)
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/validate`, `GET /api/auth/status`
- Marketplace: `GET /api/marketplace`, `GET /api/marketplace/{marketplace}/config`, `GET /api/marketplace/{marketplace}/orders`, `GET /api/marketplace/{marketplace}/auth/validate`
- Orders: `GET /api/orders/search`, `GET /api/orders/stats`

## Compatibilidade
- `/api/shopee/orders` → `/api/marketplace/shopee/orders`
- `/api/ml/orders` → `/api/marketplace/mercadolivre/orders`
- `/api/shein/orders` → `/api/marketplace/shein/orders`

## Documentar um novo endpoint
1) Adicione um bloco `@swagger` na rota (ex.: `back-end/routes/orders.js`).
2) Para novos modelos/parâmetros, edite `back-end/config/swagger.js` em `components`.
3) Reinicie o backend para atualizar a UI.

## Links úteis
- Arquitetura e fluxos: `doc/ARQUITETURA.md`
- Fila e ingestão (Spring Boot + RabbitMQ): `doc/RABBIT_MQ_SETUP.md`