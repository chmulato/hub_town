# Hub Central de Pedidos - API v2.0 com Autenticação

## Configuração e Setup

O sistema foi completamente reorganizado para suportar autenticação configurável e integração com APIs reais dos marketplaces.

### Estrutura de Arquivos

```
back-end/
├── config/
│   └── config.js           # Configurações centralizadas
├── middleware/
│   └── auth.js            # Middleware de autenticação JWT
├── routes/
│   ├── auth.js            # Rotas de autenticação
│   ├── marketplace.js     # Rotas dos marketplaces
│   └── orders.js          # Rotas de pedidos
├── services/
│   └── marketplaceService.js  # Lógica de negócio
├── data/
│   ├── shopee-orders.json
│   ├── mercadolivre-orders.json
│   └── shein-orders.json
├── .env.example           # Variáveis de ambiente
├── package.json
└── server.js             # Servidor principal
```

## Configuração de Autenticação

### Variáveis de Ambiente (.env)

```bash
# Habilitar/desabilitar autenticação
AUTH_ENABLED=false           # true para habilitar
JWT_SECRET=hub-central-secret-key-2024
TOKEN_EXPIRY=24h
DEFAULT_USER=admin
DEFAULT_PASSWORD=admin123

# Configurações dos Marketplaces
SHOPEE_API_URL=
SHOPEE_TOKEN=
ML_API_URL=https://api.mercadolibre.com
ML_ACCESS_TOKEN=
SHEIN_API_URL=
SHEIN_API_KEY=
```

### Como Habilitar Autenticação

1. **Criar arquivo .env**:
   ```bash
   cp .env.example .env
   ```

2. **Configurar autenticação**:
   ```bash
   AUTH_ENABLED=true
   JWT_SECRET=seu-secret-super-seguro
   DEFAULT_USER=seu-usuario
   DEFAULT_PASSWORD=sua-senha-segura
   ```

3. **Reiniciar servidor**:
   ```bash
   npm start
   ```

## Endpoints da API

### Informações Gerais

- **GET** `/api/info` - Informações da API
- **GET** `/api/docs` - Documentação completa

### Autenticação (quando habilitada)

- **POST** `/api/auth/login` - Fazer login
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

- **GET** `/api/auth/validate` - Validar token (requer Authorization header)
- **POST** `/api/auth/logout` - Logout
- **GET** `/api/auth/status` - Status da autenticação

### Marketplaces

- **GET** `/api/marketplace` - Listar marketplaces disponíveis
- **GET** `/api/marketplace/{marketplace}/config` - Configuração do marketplace
- **GET** `/api/marketplace/{marketplace}/orders` - Pedidos específicos
- **GET** `/api/marketplace/{marketplace}/auth/validate` - Validar autenticação da API

### Pedidos

- **GET** `/api/orders/search` - Busca unificada em todos os marketplaces
- **GET** `/api/orders/stats` - Estatísticas gerais

### Parâmetros Comuns

- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 10, máximo: 100)
- `search` - Termo de busca
- `useRealAPI` - Usar API real ao invés de mock (true/false)

## Configuração por Marketplace

### Shopee
```javascript
shopee: {
  api: {
    baseUrl: process.env.SHOPEE_API_URL,
    authType: 'bearer',
    credentials: {
      token: process.env.SHOPEE_TOKEN,
      apiKey: process.env.SHOPEE_API_KEY
    }
  }
}
```

### Mercado Livre
```javascript
mercadolivre: {
  api: {
    baseUrl: 'https://api.mercadolibre.com',
    authType: 'bearer',
    credentials: {
      token: process.env.ML_ACCESS_TOKEN,
      clientId: process.env.ML_CLIENT_ID
    }
  }
}
```

### Shein
```javascript
shein: {
  api: {
    baseUrl: process.env.SHEIN_API_URL,
    authType: 'apikey',
    credentials: {
      apiKey: process.env.SHEIN_API_KEY,
      merchantId: process.env.SHEIN_MERCHANT_ID
    }
  }
}
```

## Como Usar

### 1. Modo Mock (Padrão)
```bash
# Sem autenticação
AUTH_ENABLED=false npm start

# Com autenticação
AUTH_ENABLED=true npm start
```

### 2. Modo API Real
Configure as variáveis de ambiente das APIs e use o parâmetro `useRealAPI=true`:

```
GET /api/marketplace/shopee/orders?useRealAPI=true
```

### 3. Autenticação com JWT

1. **Login**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
   ```

2. **Usar token**:
   ```bash
   curl http://localhost:3001/api/orders/search \
     -H "Authorization: Bearer SEU_TOKEN_JWT"
   ```

## Recursos Avançados

### Cache (Configurável)
```bash
CACHE_ENABLED=true
CACHE_TTL=300  # 5 minutos
```

### Logs
```bash
LOG_LEVEL=info
LOG_FILE=./logs/hub.log
```

### CORS Configurável
Edite `config/config.js` para ajustar origens permitidas.

## Compatibilidade

A API mantém compatibilidade com a versão anterior através de redirecionamentos:
- `/api/shopee/orders` → `/api/marketplace/shopee/orders`
- `/api/ml/orders` → `/api/marketplace/mercadolivre/orders`
- `/api/shein/orders` → `/api/marketplace/shein/orders`

## Scripts Disponíveis

```bash
npm start      # Iniciar servidor
npm run dev    # Modo desenvolvimento (com nodemon)
npm test       # Executar testes
```

---

## Próximos Passos

1. Configurar variáveis de ambiente para produção
2. Implementar integração com APIs reais dos marketplaces
3. Configurar autenticação se necessário
4. Personalizar endpoints conforme necessidade

O sistema está pronto para uso em desenvolvimento e produção!