# Guia do Desenvolvedor - Hub Central de Pedidos v2.0

## Configuração do Ambiente de Desenvolvimento

### IDE Recomendada
- **Visual Studio Code** com extensões:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint
  - Thunder Client (para testar API)
  - **Swagger Viewer** (para visualizar docs OpenAPI)
  - **REST Client** (alternativa ao Thunder Client)

### Configuração do Git
```powershell
# Configurar informações do usuário
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# Configurar line endings (Windows)
git config --global core.autocrlf true
```

## Nova Estrutura Modular v2.0

### Backend Modular (Node.js + Express)

#### Arquivo Principal: `server.js`
```javascript
// Nova estrutura modular
import express from "express";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import config from './config/config.js';
import { swaggerSpec } from './config/swagger.js';

// Importar rotas modulares
import authRoutes from './routes/auth.js';
import marketplaceRoutes from './routes/marketplace.js';
import ordersRoutes from './routes/orders.js';

const app = express();
const PORT = config.server.port;

// Middleware stack v2.0
app.use(cors(config.server.cors));
app.use(express.json());
app.use(logging_middleware);

// Swagger UI
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Modular routes
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/orders', ordersRoutes);
```

#### Configuração Centralizada: `config/config.js`
```javascript
export const config = {
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    cors: { /* ... */ }
  },
  auth: {
    enabled: process.env.AUTH_ENABLED === 'true',
    jwtSecret: process.env.JWT_SECRET || 'default-secret'
  },
  marketplaces: {
    shopee: { enabled: true, icon: 'SHOP' },
    mercadolivre: { enabled: true, icon: 'STORE' },
    shein: { enabled: true, icon: 'FASHION' }
  }
};
```

## 📚 Desenvolvimento com Swagger UI

### Configuração do Swagger: `config/swagger.js`
```javascript
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hub Central de Pedidos API',
      version: '2.0.0',
      description: 'API unificada para gerenciamento de pedidos'
    },
    servers: [{ url: 'http://localhost:3001', description: 'Development' }]
  },
  apis: ['./routes/*.js', './server.js']
};

export const swaggerSpec = swaggerJsdoc(options);
```

### Documentando Endpoints com JSDoc
```javascript
/**
 * @swagger
 * /api/marketplace/{marketplace}/orders:
 *   get:
 *     summary: Obter pedidos de um marketplace
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: marketplace
 *         required: true
 *         schema:
 *           type: string
 *           enum: [shopee, mercadolivre, shein]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 */
```

#### Padrões de Código Backend v2.0
- **Modularização**: Separar rotas, middleware e serviços
- **Configuração centralizada**: Use config.js para todos os settings
- **Documentação Swagger**: Sempre documentar novos endpoints
- **Interface profissional**: Sem ícones emoji, usar texto descritivo
- **ES6+ modules** (`import/export`)
- **Error handling** com middleware centralizado
- **Validação de parâmetros** com schemas
- **Logs estruturados** com timestamp

### Frontend (React + Vite)

#### Componente Principal: `front.jsx`
```jsx
// Estrutura do componente
export default function HubCD() {
  // Estados
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = (params) => {
    // Event logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### Padrões de Código Frontend
- Functional components com Hooks
- Estados separados por responsabilidade
- Event handlers descritivos
- Conditional rendering
- Loading e error states

## Convenções de Código

### Nomenclatura

#### JavaScript/React
```javascript
// Variáveis e funções: camelCase
const userName = "João";
const fetchUserData = () => {};

// Componentes: PascalCase
const UserProfile = () => {};

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:3001";

// Arquivos: kebab-case ou PascalCase
user-profile.jsx
UserProfile.jsx
```

#### CSS/Tailwind
```css
/* Classes: kebab-case */
.user-profile { }
.nav-item { }

/* Tailwind: utility classes */
bg-blue-500 text-white rounded-lg
```

### Estrutura de Commits
```
tipo(escopo): descrição

feat(api): adicionar endpoint de busca unificada
fix(frontend): corrigir erro de paginação
docs(readme): atualizar instruções de instalação
style(css): melhorar responsividade do header
refactor(utils): otimizar função de filtros
test(api): adicionar testes para endpoints
```

## Desenvolvimento de Features

### Adicionando Novo Endpoint

1. **Backend** - Adicionar em `server.js`:
```javascript
app.get("/api/novo-endpoint", (req, res) => {
  try {
    // Lógica do endpoint
    const result = processData();
    res.json(result);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});
```

2. **Frontend** - Adicionar função de fetch:
```javascript
const fetchNewData = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/novo-endpoint');
    const data = await response.json();
    setData(data);
  } catch (error) {
    setError(error.message);
  }
};
```

### Adicionando Novo Componente

1. **Criar componente**:
```jsx
const NovoComponente = ({ prop1, prop2, onEvent }) => {
  const [localState, setLocalState] = useState(null);
  
  return (
    <div className="component-container">
      {/* Conteúdo */}
    </div>
  );
};
```

2. **Integrar no componente pai**:
```jsx
<NovoComponente 
  prop1={value1}
  prop2={value2}
  onEvent={handleEvent}
/>
```

## Testing

### Testes da API (Manual)
```powershell
# Usar curl ou Invoke-RestMethod
Invoke-RestMethod -Uri "http://localhost:3001/api/shopee/orders" -Method GET

# Ou usar Thunder Client no VS Code
GET http://localhost:3001/api/shopee/orders?page=1&limit=5
```

### Testes Frontend (Manual)
1. Testar estados de loading
2. Testar estados de erro
3. Testar interações do usuário
4. Testar responsividade

### Testes Automatizados (Futuros)
```javascript
// Jest para backend
describe('API Endpoints', () => {
  test('should return shopee orders', async () => {
    // Test implementation
  });
});

// React Testing Library para frontend
import { render, screen } from '@testing-library/react';

test('renders order list', () => {
  render(<HubCD />);
  expect(screen.getByText('Hub Central')).toBeInTheDocument();
});
```

## Debugging

### Backend Debugging
```javascript
// Console logs estratégicos
console.log('Request params:', req.query);
console.log('Filtered orders:', filteredOrders.length);

// Error logging
console.error('Database error:', error);

// Node.js debugger
node --inspect server.js
```

### Frontend Debugging
```javascript
// React DevTools
// Console logs
console.log('Current state:', { orders, loading, error });

// Network tab para requisições
// Elements tab para CSS
```

## Performance

### Backend Optimization
- Cache de arquivos JSON em memória
- Pagination eficiente
- Filtros otimizados
- Compression middleware

### Frontend Optimization
- Debounce na busca
- Lazy loading
- Memoização de componentes
- Virtual scrolling para listas grandes

## Deployment

### Preparação para Produção

#### Backend
```javascript
// Variáveis de ambiente
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS específico
res.header('Access-Control-Allow-Origin', 'https://meudominio.com');

// Rate limiting
const rateLimit = require('express-rate-limit');
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

#### Frontend
```powershell
# Build para produção
npm run build

# Preview do build
npm run preview
```

## Troubleshooting Comum

### Problemas de CORS
```javascript
// Verificar headers no DevTools
// Confirmar configuração no servidor
// Testar endpoints diretamente
```

### Problemas de Estado
```javascript
// Verificar dependências do useEffect
// Console.log dos estados
// React DevTools para inspecionar
```

### Problemas de Performance
```javascript
// Network tab para requisições lentas
// Profiler tab para React renders
// Memory tab para vazamentos
```

## Próximas Melhorias

### Curto Prazo
- [ ] Testes automatizados
- [ ] ESLint/Prettier configuração
- [ ] Error boundaries no React
- [ ] Loading skeletons

### Médio Prazo
- [ ] Database real (PostgreSQL)
- [ ] Autenticação JWT
- [ ] Cache Redis
- [ ] Docker containers

### Longo Prazo  
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Real-time updates
- [ ] Mobile app (React Native)

## Recursos Úteis

### Documentação
- [React Docs](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Guide](https://vitejs.dev/)

### Ferramentas
- [Postman](https://www.postman.com/) - API testing
- [React DevTools](https://react.dev/tools) - Browser extension
- [Node.js Inspector](https://nodejs.org/api/debugger.html) - Debugging

### Comunidade
- [Stack Overflow](https://stackoverflow.com/)
- [GitHub Issues](https://github.com/chmulato/hub_town/issues)
- [MDN Web Docs](https://developer.mozilla.org/)
