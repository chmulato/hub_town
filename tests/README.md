# Tests — Hub Town

Suite de testes para validar a leitura via API e a documentação de configuração.

## Estrutura

```
tests/
├── README.md
├── ENDPOINT_CONFIG_TEST.md       # Guia do teste de configuração
├── api-integration-test.js       # Integração da API de leitura
├── endpoint-config-test.js       # Validação de exemplos/headers
├── scripts/
│   ├── run-all-tests.js          # Orquestra execução e relatórios
│   ├── run-endpoint-config-test.js
│   └── test-config.js            # URLs, timeouts, defaults
└── results/
    ├── latest-test-result.txt
    └── test-history.log
```

## Como executar (Windows PowerShell)

End-to-end (sobe backend, espera ficar pronto, roda testes, encerra):
```powershell
node .\tests\scripts\run-with-server.js
```

Sequencial:
```powershell
node .\tests\scripts\run-all-tests.js
```

Paralelo:
```powershell
$env:TEST_CONCURRENT="true" ; node .\tests\scripts\run-all-tests.js
```

Específicos:
```powershell
node .\tests\api-integration-test.js
node .\tests\endpoint-config-test.js
```

## Ambiente

- `TEST_API_URL` (default: http://localhost:3001/api)
- `TEST_TIMEOUT` (default: 10000)
- `TEST_CONCURRENT` (default: false)

Requisitos: Node.js 18+, backend disponível (ou use o runner end-to-end acima).

## Relatórios

- `tests/results/latest-test-result.txt`
- `tests/results/test-history.log`

## Referências

- Guia do teste de configuração: [ENDPOINT_CONFIG_TEST.md](ENDPOINT_CONFIG_TEST.md)
- Orquestradores: `tests/scripts/run-with-server.js`, `tests/scripts/run-all-tests.js`