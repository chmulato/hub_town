# API Documentation - Hub Central de Pedidos

## Visão Geral

A API do Hub Central de Pedidos fornece endpoints para gerenciar e consultar pedidos de diferentes marketplaces (Shopee e Mercado Livre). A API suporta paginação, filtros e busca unificada.

## Base URL

```
http://localhost:3001
```

## Endpoints

### 1. Pedidos Shopee

#### GET `/api/shopee/orders`

Retorna pedidos do Shopee com suporte a paginação e busca.

**Parâmetros de Query:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 5)
- `search` (opcional): Termo de busca (busca em orderId, buyer, product, address)

**Exemplo de Requisição:**
```
GET /api/shopee/orders?page=1&limit=5&search=joão
```

**Exemplo de Resposta:**
```json
{
  "data": [
    {
      "orderId": "SHP12345",
      "buyer": "João Silva",
      "product": "Fone Bluetooth",
      "status": "READY_TO_SHIP",
      "address": "Rua A, Centro - Cidade X"
    }
  ],
  "total": 20,
  "currentPage": 1,
  "totalPages": 4,
  "next": {
    "page": 2,
    "limit": 5
  }
}
```

### 2. Pedidos Mercado Livre

#### GET `/api/ml/orders`

Retorna pedidos do Mercado Livre com suporte a paginação e busca.

**Parâmetros de Query:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 5)
- `search` (opcional): Termo de busca

**Exemplo de Requisição:**
```
GET /api/ml/orders?page=1&limit=5
```

**Estrutura de Resposta:** Igual ao endpoint Shopee

### 3. Busca Unificada

#### GET `/api/orders/search`

Busca pedidos em ambos os marketplaces simultaneamente.

**Parâmetros de Query:**
- `search` (obrigatório): Termo de busca
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)

**Exemplo de Requisição:**
```
GET /api/orders/search?search=notebook&page=1&limit=10
```

**Exemplo de Resposta:**
```json
{
  "data": [
    {
      "orderId": "ML12345",
      "buyer": "Carlos Souza",
      "product": "Notebook Lenovo",
      "status": "SHIPPED",
      "address": "Av. Brasil, 123 - Cidade X",
      "marketplace": "mercadolivre"
    },
    {
      "orderId": "SHP67890",
      "buyer": "Ana Costa",
      "product": "Notebook Dell",
      "status": "READY_TO_SHIP", 
      "address": "Rua das Flores, 55 - Cidade Y",
      "marketplace": "shopee"
    }
  ],
  "total": 15,
  "currentPage": 1,
  "totalPages": 2
}
```

## Status dos Pedidos

| Status | Descrição | Cor no Frontend |
|--------|-----------|----------------|
| `DELIVERED` | Entregue | Verde |
| `SHIPPED` | Enviado | Azul |
| `READY_TO_SHIP` | Pronto para Envio | Laranja |
| `WAITING_PICKUP` | Aguardando Coleta | Amarelo |

## Códigos de Resposta HTTP

- `200 OK`: Requisição bem-sucedida
- `400 Bad Request`: Parâmetros inválidos
- `404 Not Found`: Endpoint não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## CORS

A API está configurada para aceitar requisições de qualquer origem (`*`) para desenvolvimento. Em produção, configure origins específicas.

## Estrutura dos Dados

### Pedido Shopee
```json
{
  "orderId": "string",
  "buyer": "string", 
  "product": "string",
  "status": "DELIVERED|SHIPPED|READY_TO_SHIP|WAITING_PICKUP",
  "address": "string"
}
```

### Pedido Mercado Livre
```json
{
  "orderId": "string",
  "buyer": "string",
  "product": "string", 
  "status": "DELIVERED|SHIPPED|READY_TO_SHIP|WAITING_PICKUP",
  "address": "string"
}
```

### Pedido Unificado (busca)
Inclui todos os campos acima mais:
```json
{
  "marketplace": "shopee|mercadolivre"
}
```

## Arquivos de Dados

Os dados são armazenados em arquivos JSON:
- `back-end/data/shopee-orders.json`: 20 pedidos Shopee
- `back-end/data/mercadolivre-orders.json`: 20 pedidos Mercado Livre

## Rate Limiting

Atualmente não há limitação de rate. Implemente conforme necessário para produção.

## Autenticação

Não há autenticação implementada. Adicione conforme os requisitos de segurança.
