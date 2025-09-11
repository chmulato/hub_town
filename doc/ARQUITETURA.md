# Arquitetura do Sistema - Hub Central de Pedidos v2.0

## Visão Geral da Arquitetura

O Hub Central de Pedidos v2.0 é uma aplicação full-stack moderna com arquitetura modular que centraliza o gerenciamento de pedidos de múltiplos marketplaces (Shopee, Mercado Livre e Shein) em uma interface unificada com documentação interativa Swagger.

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│                     http://localhost:5173                   │
├─────────────────────────────────────────────────────────────┤
│  • Interface responsiva sem ícones infantilizados           │
│  • Busca unificada em 3 marketplaces                        │
│  • Paginação client-side                                    │
│  • Filtros por marketplace e status                         │
│  • Design profissional com Tailwind CSS                     │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API + JWT
                  │ fetch() requests
┌─────────────────▼───────────────────────────────────────────┐
│               BACKEND MODULAR (Node.js + Express)           │
│                    http://localhost:3001                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │   CONFIG/   │ │ MIDDLEWARE/ │ │   ROUTES/   │ │SERVICES/│ │
│  │             │ │             │ │             │ │         │ │
│  │ • config.js │ │ • auth.js   │ │ • auth.js   │ │ • mkt   │ │
│  │ • swagger.js│ │ • cors      │ │ • orders.js │ │Service  │ │
│  │             │ │ • logging   │ │ • mkt.js    │ │ .js     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
│                                                               │
│  • Swagger UI: /api/swagger                                   │
│  • JWT Auth configurável                                     │
│  • API unificada para 3 marketplaces                         │
│  • Endpoints padronizados RESTful                            │
└─────────────────┬───────────────────────────────────────────┘
                  │ File System + Future DB
                  │ JSON.parse() + ORM Ready
┌─────────────────▼───────────────────────────────────────────┐
│                    DADOS (JSON Files)                       │
├─────────────────────────────────────────────────────────────┤
│ shopee-orders.json │ mercadolivre-orders.json │ shein-orders │
│ • 20 pedidos       │ • 20 pedidos ML          │ .json        │
│   Shopee           │ • Dados estruturados     │ • 20 pedidos │
│ • Dados BR         │ • Endereços reais        │   Shein      │
│                    │                          │ • Moda Intl  │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### Frontend (React + Vite)

**Tecnologias:**
- React 18 com Hooks
- Vite como bundler
- Tailwind CSS para estilização profissional
- Fetch API para requisições HTTP
- Interface sem ícones infantilizados

**Funcionalidades:**
- Busca unificada em 60 pedidos (3 marketplaces)
- Cards profissionais com badges de texto
- Estados de loading e erro sem emojis
- Responsividade completa

**Estrutura de Componentes:**
```
src/
├── main.jsx           # Entry point
├── index.css          # Styles globais
└── front.jsx          # Componente principal
    ├── HubCD()        # Componente principal
    ├── PaginationComponent()  # Componente de paginação
    └── Estados gerenciados:
        ├── shopeeOrders[]
        ├── mlOrders[]
        ├── searchResults[]
        ├── loading, error
        └── pagination states
```

**Funcionalidades:**
- Dashboard unificado
- Busca em tempo real
- Paginação independente por marketplace
- Filtros visuais por status
- Interface responsiva
- Estados de loading e erro

### Backend Modular (Node.js + Express)

**Tecnologias:**
- Node.js 22+
- Express.js framework
- ES Modules (import/export)
- Swagger UI + swagger-jsdoc
- JWT (jsonwebtoken) para autenticação
- CORS configurável

**Nova Arquitetura Modular v2.0:**
```
back-end/
├── server.js              # Servidor principal
├── package.json           # Dependências
├── .env.example           # Configurações de ambiente
├── config/
│   ├── config.js          # Configurações centralizadas
│   └── swagger.js         # Configuração Swagger UI
├── middleware/
│   └── auth.js            # Middleware de autenticação JWT
├── routes/
│   ├── auth.js            # Rotas de autenticação
│   ├── marketplace.js     # Rotas dos marketplaces
│   └── orders.js          # Rotas de pedidos unificadas
├── services/
│   └── marketplaceService.js  # Lógica de negócio
└── data/
    ├── shopee-orders.json     # 20 pedidos Shopee
    ├── mercadolivre-orders.json  # 20 pedidos ML
    └── shein-orders.json      # 20 pedidos Shein

**Middleware Stack v2.0:**
1. **CORS Configurável** - Headers e origens permitidas
2. **JSON Parser** - Express body parser
3. **Logging Middleware** - Log de todas as requisições com timestamp
4. **JWT Authentication** - Opcional, configurável via environment
5. **Route Handlers** - Roteamento modular
6. **Error Handling** - Tratamento centralizado de erros
7. **404 Handler** - Rotas não encontradas

**Funcionalidades da Nova Arquitetura:**
- **Separação de responsabilidades** por módulos
- **Configuração centralizada** em config.js
- **Middleware reutilizável** para autenticação
- **Serviços especializados** para lógica de negócio
- **Rotas organizadas** por domínio (auth, marketplace, orders)
- **Swagger UI integrado** para documentação interativa

### 📚 Documentação Interativa (Swagger UI)

**Tecnologia:**
- swagger-ui-express para interface web
- swagger-jsdoc para anotações no código
- OpenAPI 3.0 specification

**Recursos do Swagger:**
- **Interface interativa** para testar endpoints
- **Schemas detalhados** de requisições e respostas
- **Autenticação JWT** testável
- **Exemplos práticos** para cada endpoint
- **Validação de parâmetros** em tempo real

**Acesso:**
- **URL**: http://localhost:3001/api/swagger
- **Spec JSON**: http://localhost:3001/api/swagger.json
- **Info da API**: http://localhost:3001/api/info

### Camada de Dados

**Formato dos Dados:**
```json
{
  "orderId": "string",     // ID único do pedido
  "buyer": "string",       // Nome do comprador
  "product": "string",     // Nome do produto
  "status": "enum",        // Status do pedido
  "address": "string"      // Endereço de entrega
}
```

**Status Possíveis:**
- `DELIVERED` - Entregue
- `SHIPPED` - Enviado  
- `READY_TO_SHIP` - Pronto para envio
- `WAITING_PICKUP` - Aguardando coleta

## Fluxo de Dados

### 1. Carregamento Inicial
```
Frontend → GET /api/shopee/orders?page=1&limit=5
Frontend → GET /api/ml/orders?page=1&limit=5
Backend → loadJsonData() → filterOrders() → paginate()
Backend → Response com dados paginados
Frontend → setShopeeOrders() + setMlOrders()
```

### 2. Busca Unificada  
```
Frontend → handleSearchChange("termo")
Frontend → GET /api/orders/search?search=termo&page=1&limit=10
Backend → loadJsonData() para ambos marketplaces
Backend → Merge dos arrays + filterOrders()
Backend → paginate() nos resultados combinados
Frontend → setSearchResults() + UI de resultados
```

### 3. Paginação
```
Frontend → handlePageChange(newPage)
Frontend → GET /api/{marketplace}/orders?page=newPage&limit=5
Backend → paginate() com novos parâmetros
Frontend → Atualiza estado + re-render
```

## Padrões de Design

### Frontend Patterns

**State Management:**
- React Hooks (useState, useEffect)
- Estados locais para cada funcionalidade
- Separation of Concerns

**Component Patterns:**
- Functional Components
- Custom Hooks potenciais
- Conditional Rendering
- Event Handlers

**CSS Patterns:**
- Tailwind Utility Classes
- Responsive Design
- Component-based Styling

### Backend Patterns

**API Design:**
- RESTful endpoints
- Consistent response format
- Query parameters for filtering
- HTTP status codes apropriados

**Error Handling:**
- Try/catch blocks
- Graceful error responses
- Console logging para debugging

**Code Organization:**
- Single responsibility functions
- Modular utility functions
- Clean separation of concerns

## Configuração de Desenvolvimento

### Portas e URLs
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- API Base: `http://localhost:3001/api`

### Scripts de Desenvolvimento
- `start.ps1` - Script PowerShell para iniciar ambos serviços
- Detecção automática de porta do backend
- Gerenciamento de processos em background

### Hot Reload
- Vite HMR no frontend
- Nodemon pode ser adicionado para backend
- Restart manual necessário para mudanças no backend

## Escalabilidade e Melhorias

### Performance
- Implementar cache no backend
- Lazy loading de componentes
- Debounce na busca
- Virtual scrolling para listas grandes

### Funcionalidades
- Autenticação e autorização
- Filtros avançados (data, valor, etc.)
- Ordenação customizável
- Export de dados (CSV, PDF)
- Dashboard com métricas

### Infraestrutura
- Database real (PostgreSQL, MongoDB)
- Redis para cache
- Docker containers
- CI/CD pipeline
- Monitoring e logs
