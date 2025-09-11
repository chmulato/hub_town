# Arquitetura do Sistema - Hub Central de Pedidos

## Visão Geral da Arquitetura

O Hub Central de Pedidos é uma aplicação full-stack moderna que centraliza o gerenciamento de pedidos de múltiplos marketplaces em uma interface unificada.

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│                     http://localhost:5173                   │
├─────────────────────────────────────────────────────────────┤
│  • Interface de usuário responsiva                          │
│  • Busca unificada em tempo real                            │
│  • Paginação client-side                                    │
│  • Filtros e ordenação                                      │
│  • Gerenciamento de estado React                            │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
                  │ fetch() requests
┌─────────────────▼───────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                 │
│                    http://localhost:3001                    │
├─────────────────────────────────────────────────────────────┤
│  • API REST com endpoints específicos                       │
│  • Middleware CORS configurado                              │
│  • Paginação server-side                                    │
│  • Sistema de busca e filtros                               │
│  • Agregação de dados de múltiplos sources                  │
└─────────────────┬───────────────────────────────────────────┘
                  │ File System
                  │ JSON.parse()
┌─────────────────▼───────────────────────────────────────────┐
│                    DADOS (JSON Files)                       │
├─────────────────────────────────────────────────────────────┤
│  shopee-orders.json      │  mercadolivre-orders.json        │
│  • 20 pedidos Shopee    │  • 20 pedidos ML                  │
│  • Dados estruturados   │  • Dados estruturados             │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### Frontend (React + Vite)

**Tecnologias:**
- React 18 com Hooks
- Vite como bundler
- Tailwind CSS para estilização
- Fetch API para requisições HTTP

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

### Backend (Node.js + Express)

**Tecnologias:**
- Node.js 22+
- Express.js framework
- ES Modules (import/export)
- File System nativo do Node.js

**Estrutura do Servidor:**
```
back-end/
├── server.js          # Servidor principal
├── data/              # Dados mock
│   ├── shopee-orders.json
│   └── mercadolivre-orders.json
└── package.json       # Dependências
```

**Middleware Stack:**
1. CORS Headers
2. JSON Parser
3. Route Handlers
4. Error Handling

**Funções Utilitárias:**
- `loadJsonData()` - Carrega dados dos arquivos JSON
- `filterOrders()` - Aplica filtros de busca
- `paginate()` - Implementa paginação server-side

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
