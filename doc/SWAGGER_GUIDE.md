# Swagger UI - Documentação Interativa da API

## **Acessando o Swagger**

### URLs Disponíveis:
- **Swagger UI Interativo**: `http://localhost:3001/api/swagger`
- **Spec JSON**: `http://localhost:3001/api/swagger.json`
- **Documentação Resumida**: `http://localhost:3001/api/docs` (deprecated)

## **Recursos do Swagger UI**

### **Interface Completa**
- **Visualização interativa** de todos os endpoints
- **Testador de API integrado** - Execute requests diretamente na interface
- **Documentação detalhada** com exemplos de request/response
- **Schemas de dados** com validação
- **Sistema de autenticação** integrado

### **Autenticação no Swagger**
1. **Clique no botão "Authorize"** no topo da interface
2. **Digite o token JWT** no formato: `Bearer SEU_TOKEN_JWT`
3. **Clique "Authorize"** para salvar
4. **Todos os requests subsequentes** usarão automaticamente o token

### **Testando Endpoints**

#### 1. **Sem Autenticação** (modo atual):
```bash
# Todos os endpoints estão livres para teste
GET /api/info
GET /api/marketplace
GET /api/orders/search
```

#### 2. **Com Autenticação Habilitada**:
```bash
# 1. Fazer login primeiro
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

# 2. Copiar o token da resposta
# 3. Clicar "Authorize" no Swagger
# 4. Colar: Bearer SEU_TOKEN_JWT
# 5. Testar endpoints protegidos
```

## **Estrutura da Documentação**

### **Tags Organizadas**
- **Info** - Informações gerais da API
- **Auth** - Autenticação e autorização
- **Marketplace** - Gerenciamento de marketplaces
- **Orders** - Gerenciamento de pedidos

### **Schemas de Dados**
- **Order** - Estrutura de um pedido
- **PaginatedResponse** - Resposta paginada
- **ErrorResponse** - Resposta de erro
- **LoginRequest/Response** - Autenticação
- **Marketplace** - Dados do marketplace
- **Statistics** - Estatísticas dos pedidos

## **Exemplos de Uso no Swagger**

### 1. **Busca Unificada**
```yaml
GET /api/orders/search
Parameters:
  - page: 1
  - limit: 10
  - search: "Silva"
  - useRealAPI: false
```

### 2. **Pedidos por Marketplace**
```yaml
GET /api/marketplace/shopee/orders
Parameters:
  - page: 1
  - limit: 5
  - search: ""
```

### 3. **Estatísticas**
```yaml
GET /api/orders/stats
Parameters:
  - useRealAPI: false
```

## **Recursos Visuais**

### **Filtros e Busca**
- **Filtro por tag** - Use a caixa de filtro no topo
- **Busca de texto** - Procure por endpoints específicos
- **Expansão/colapso** - Controle a visualização

### **Exemplos Integrados**
- **Request examples** - Veja exemplos de JSON de entrada
- **Response examples** - Veja exemplos de respostas
- **Schema validation** - Validação automática de dados

### **Personalização**
- **Tema customizado** - Interface limpa sem topbar
- **Autorização persistente** - Token salvo na sessão
- **Tempo de resposta** - Mostra duração das requests
- **Extensões habilitadas** - Recursos avançados ativados

## **Endpoints Documentados**

### **Informações**
- `GET /api/info` - Informações da API
- `GET /api/docs` - Documentação resumida (deprecated)

### **Autenticação**
- `POST /api/auth/login` - Login com JWT
- `POST /api/auth/logout` - Logout
- `GET /api/auth/validate` - Validar token
- `GET /api/auth/status` - Status da autenticação

### **Marketplaces**
- `GET /api/marketplace` - Listar marketplaces
- `GET /api/marketplace/{marketplace}/config` - Configuração
- `GET /api/marketplace/{marketplace}/orders` - Pedidos específicos
- `GET /api/marketplace/{marketplace}/auth/validate` - Validar auth API

### **Pedidos**
- `GET /api/orders/search` - Busca unificada
- `GET /api/orders/stats` - Estatísticas gerais

## **Compatibilidade**

### Endpoints Antigos (Redirecionados):
- `/api/shopee/orders` → `/api/marketplace/shopee/orders`
- `/api/ml/orders` → `/api/marketplace/mercadolivre/orders`
- `/api/shein/orders` → `/api/marketplace/shein/orders`

## **Próximos Passos**

1. **Explore a interface Swagger** em `http://localhost:3001/api/swagger`
2. **Teste todos os endpoints** usando o testador integrado
3. **Configure autenticação** se necessário
4. **Use o spec JSON** para gerar clientes automaticamente
5. **Integre com ferramentas** como Postman ou Insomnia

---

## **Dicas de Uso**

- **Use "Try it out"** para testar endpoints diretamente
- **Copie exemplos** de request/response para sua aplicação
- **Valide schemas** antes de implementar
- **Configure autorização** uma vez e use em todos os endpoints
- **Exporte o spec** para usar em outras ferramentas

O Swagger UI está totalmente integrado e pronto para uso!