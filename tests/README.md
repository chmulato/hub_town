# Tests - Hub Central de Pedidos v2.0

Conjunto de testes automatizados para validar todas as funcionalidades do Hub Central de Pedidos.

## Estrutura de Testes

```
tests/
├── README.md                     # Este arquivo
├── ENDPOINT_CONFIG_TEST.md       # Documentação específica do teste de configuração
├── api-integration-test.js       # Teste de integração das APIs
├── endpoint-config-test.js       # Teste de configuração de endpoints
├── scripts/                      # Scripts auxiliares
│   ├── run-all-tests.js         # Executa todos os testes
│   ├── run-endpoint-config-test.js  # Executa só o teste de configuração
│   └── test-config.js           # Configurações globais de teste
└── results/                     # Relatórios e resultados
    ├── latest-test-result.json
    ├── test-history.log
    └── endpoint-config-test-*.json
```

## Testes Disponíveis

### 1. 🔌 Teste de Integração das APIs (`api-integration-test.js`)
- Testa conectividade com todas as APIs dos marketplaces
- Valida estrutura de resposta e dados
- Verifica paginação e filtros
- Testa sistema de busca unificada

**Executar:**
```bash
node api-integration-test.js
```

### 2. ⚙️ Teste de Configuração de Endpoints (`endpoint-config-test.js`) 
- **NOVO**: Valida tela de configuração de APIs
- Testa todos os tipos de autenticação (API Key, OAuth 2.0, JWT, Basic Auth)
- Verifica configurações para Shopee, Mercado Livre e Shein
- Valida geração de headers HTTP corretos
- Simula conectividade com endpoints

**Executar:**
```bash
node endpoint-config-test.js
# ou
node scripts/run-endpoint-config-test.js
```

**Cobertura completa:**
- ✅ **48 testes** executados
- ✅ **3 marketplaces** × **4 tipos de auth** × **4 validações**
- ✅ **100% taxa de sucesso** esperada

## Executar Todos os Testes

### Sequencial (Recomendado)
```bash
cd tests/scripts
node run-all-tests.js
```

### Paralelo (Mais rápido)
```bash
cd tests/scripts
TEST_CONCURRENT=true node run-all-tests.js
```

## Configuração de Ambiente

### Variáveis de Ambiente
```bash
# URL da API para testes
TEST_API_URL=http://localhost:3001/api

# Timeout para cada teste (ms)
TEST_TIMEOUT=10000

# Executar testes em paralelo
TEST_CONCURRENT=false
```

### Requisitos
- Node.js 18+
- Hub Central backend rodando (porta 3001)
- Conexão com internet para validação de URLs

## Relatórios e Resultados

### Arquivos Gerados
- **`latest-test-result.json`**: Último resultado em formato JSON
- **`latest-test-result.txt`**: Último resultado em texto
- **`test-history.log`**: Histórico de todas as execuções
- **`endpoint-config-test-*.json`**: Relatórios específicos do teste de configuração

### Exemplo de Relatório
```
📊 RELATÓRIO FINAL DOS TESTES
============================================================
⏱️  Tempo de execução: 205ms
📈 Total de testes: 50
✅ Testes aprovados: 49
❌ Testes falharam: 1
📊 Taxa de sucesso: 98.00%
```

## Integração Contínua

### Script para CI/CD
```bash
#!/bin/bash
cd tests/scripts
npm run test || exit 1
echo "✅ Todos os testes passaram!"
```

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    cd tests/scripts
    node run-all-tests.js
```

## Desenvolvimento de Novos Testes

### Template Base
```javascript
// novo-teste.js
import fs from 'fs';
import path from 'path';

class NovoTeste {
    constructor() {
        this.results = { totalTests: 0, passed: 0, failed: 0 };
    }
    
    async runTests() {
        console.log('🧪 Iniciando Novo Teste...');
        // Implementar testes aqui
        this.generateReport();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const teste = new NovoTeste();
    teste.runTests();
}
```

### Adicionar ao run-all-tests.js
```javascript
const testFiles = [
    'api-integration-test.js',
    'endpoint-config-test.js',
    'novo-teste.js'  // <- Adicionar aqui
];
```

## Debugging e Troubleshooting

### Erros Comuns

**1. Backend não está rodando**
```
❌ Error: connect ECONNREFUSED ::1:3001
```
**Solução:** Inicie o backend com `.\start.ps1`

**2. Timeout nos testes**
```
❌ Test timeout after 10000ms
```
**Solução:** Aumente `TEST_TIMEOUT` ou verifique conectividade

**3. Falha de validação**
```
❌ URL inválida ou credenciais incorretas
```
**Solução:** Verifique configurações de teste no arquivo

### Logs Detalhados
```bash
# Ativar logs verbosos
DEBUG=true node endpoint-config-test.js
```

## Contribuição

Para adicionar novos testes:

1. Crie o arquivo de teste em `/tests/`
2. Documente em `/tests/NOME_DO_TESTE.md`
3. Adicione ao `run-all-tests.js`
4. Execute para validar
5. Atualize este README

## Status dos Testes

| Teste | Status | Cobertura | Última Execução |
|-------|--------|-----------|----------------|
| 🔌 API Integration | ✅ Ativo | APIs + Busca | ✅ 100% |
| ⚙️ Endpoint Config | ✅ Ativo | Auth + Validação | ✅ 100% |
| 🚀 Performance | 🔄 Planejado | Carga + Stress | - |
| 🔒 Security | 🔄 Planejado | Auth + Headers | - |

---

**Hub Central de Pedidos v2.0** - Suite de Testes Automatizados  
Versão 2.0 | Setembro 2025 | Testes: 48 | Taxa de Sucesso: 100%