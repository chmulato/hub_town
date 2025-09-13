# Teste de Configuração de Endpoints

Este teste valida a funcionalidade da tela de configuração de endpoints e autenticação do Hub Central v2.0.

## Objetivo

Verificar se todos os tipos de autenticação suportados pelo sistema funcionam corretamente para cada marketplace:

- **Shopee**: API Key, OAuth 2.0, JWT, Basic Auth
- **Mercado Livre**: OAuth 2.0, API Key, JWT, Basic Auth  
- **Shein**: API Key, OAuth 2.0, JWT, Basic Auth

## Testes Realizados

### 1. Validação de Endpoints
- ✅ Verificar se URLs são válidas (HTTPS)
- ✅ Validar formato da URL
- ✅ Confirmar hostname presente

### 2. Validação de Credenciais
- ✅ **API Key**: Verificar comprimento mínimo e formato
- ✅ **OAuth 2.0**: Validar Client ID, Client Secret e Redirect URI
- ✅ **JWT**: Verificar formato do token (deve começar com "eyJ")
- ✅ **Basic Auth**: Validar username e password com requisitos mínimos

### 3. Validação de Headers HTTP
- ✅ Verificar presença do Content-Type
- ✅ Validar headers específicos por tipo de auth:
  - API Key: `X-API-Key`
  - OAuth/JWT: `Authorization: Bearer {token}`
  - Basic Auth: `Authorization: Basic {encoded}`

### 4. Simulação de Conectividade
- ✅ Simular tentativa de conexão com endpoint
- ✅ Verificar resposta do servidor (mock)
- ✅ Testar timeout e tratamento de erros

## Como Executar

### Executar apenas este teste:
```bash
cd tests
node endpoint-config-test.js
```

### Executar via script auxiliar:
```bash
cd tests/scripts
node run-endpoint-config-test.js
```

### Executar junto com todos os testes:
```bash
cd tests/scripts
node run-all-tests.js
```

## Configurações de Teste

O teste utiliza configurações de exemplo para cada marketplace:

### Shopee
```javascript
{
  endpoint: "https://api.shopee.com/v2",
  authTypes: ["api-key", "oauth", "jwt", "basic"],
  credentials: {
    apiKey: "test-shopee-api-key-12345",
    // ... outras credenciais
  }
}
```

### Mercado Livre
```javascript
{
  endpoint: "https://api.mercadolibre.com",
  authTypes: ["oauth", "api-key", "jwt", "basic"],
  credentials: {
    clientId: "ml-app-id-789",
    // ... outras credenciais
  }
}
```

### Shein
```javascript
{
  endpoint: "https://api.shein.com/v1",
  authTypes: ["api-key", "oauth", "jwt", "basic"],
  credentials: {
    apiKey: "shein-api-key-192021",
    merchantId: "shein-merchant-222324"
    // ... outras credenciais
  }
}
```

## Relatórios

O teste gera relatórios detalhados salvos em `tests/results/`:

- **JSON detalhado**: `endpoint-config-test-[timestamp].json`
- **Logs de execução**: Console com status de cada teste
- **Sumário final**: Taxa de sucesso e falhas

## Exemplo de Saída

```
🚀 Iniciando Testes de Configuração de Endpoints
============================================================

🧪 Testando Shopee (shopee)
==================================================

📋 Tipo de Autenticação: API-KEY
------------------------------
✅ URL válida: https://api.shopee.com/v2
✅ API Key válida
✅ Content-Type presente
✅ X-API-Key presente
✅ Simulação de conectividade bem-sucedida

📊 RELATÓRIO FINAL DOS TESTES
============================================================
⏱️  Tempo de execução: 145ms
📈 Total de testes: 48
✅ Testes aprovados: 46
❌ Testes falharam: 2
📊 Taxa de sucesso: 95.83%

🎉 SISTEMA DE CONFIGURAÇÃO VALIDADO!
```

## Benefícios do Teste

1. **Validação Completa**: Garante que todos os tipos de auth funcionem
2. **Detecção Precoce**: Identifica problemas de configuração rapidamente  
3. **Documentação Viva**: Serve como exemplo de uso da API
4. **Automação**: Pode ser integrado em CI/CD
5. **Relatórios**: Fornece métricas detalhadas de qualidade

## Integração com Interface

Este teste complementa a interface visual de configuração, validando que:

- Os campos do formulário capturam dados corretos
- A validação frontend está alinhada com os requisitos
- Os tipos de autenticação são implementados corretamente
- As configurações podem ser persistidas com segurança