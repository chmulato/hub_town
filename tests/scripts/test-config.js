// test-config.js - Configurações centralizadas para testes
const path = require('path');

const TEST_CONFIG = {
  // URLs da API
  api: {
    baseUrl: process.env.TEST_API_URL || 'http://localhost:3001/api',
    fullUrl: process.env.TEST_API_URL || 'http://localhost:3001',
    swaggerUrl: process.env.TEST_API_URL ? `${process.env.TEST_API_URL.replace('/api', '')}/api/swagger` : 'http://localhost:3001/api/swagger'
  },
  
  // Timeouts
  timeouts: {
    request: parseInt(process.env.TEST_REQUEST_TIMEOUT) || 5000,
    test: parseInt(process.env.TEST_TIMEOUT) || 30000,
    server: parseInt(process.env.TEST_SERVER_TIMEOUT) || 10000
  },
  
  // Configurações de execução
  execution: {
    concurrent: process.env.TEST_CONCURRENT === 'true',
    retries: parseInt(process.env.TEST_RETRIES) || 2,
    verbose: process.env.TEST_VERBOSE === 'true' || process.env.NODE_ENV === 'test',
    saveResults: process.env.TEST_SAVE_RESULTS !== 'false'
  },
  
  // Dados esperados
  expectedData: {
    totalOrders: 60,
    marketplaces: ['shopee', 'mercadolivre', 'shein'],
    ordersPerMarketplace: 20,
    apiVersion: '2.0.0',
    supportedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  },
  
  // Configurações de arquivos
  paths: {
    testsDir: path.join(__dirname, '..'),
    resultsDir: path.join(__dirname, '..', 'results'),
    backendDir: path.join(__dirname, '..', '..', 'back-end'),
    dataDir: path.join(__dirname, '..', '..', 'back-end', 'data')
  },
  
  // Headers padrão para requisições
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Hub-Central-Test-Suite/2.0'
  },
  
  // Critérios de validação
  validation: {
    minResponseTime: 1, // ms
    maxResponseTime: 5000, // ms
    requiredFields: {
      order: ['orderId', 'buyer', 'product', 'status', 'marketplace'],
      marketplace: ['id', 'name', 'enabled'],
      apiInfo: ['name', 'version', 'endpoints', 'features']
    }
  },
  
  // Configurações específicas por ambiente
  environments: {
    development: {
      logLevel: 'debug',
      strictValidation: false,
      allowMockData: true
    },
    test: {
      logLevel: 'info',
      strictValidation: true,
      allowMockData: true
    },
    production: {
      logLevel: 'error',
      strictValidation: true,
      allowMockData: false
    }
  }
};

// Aplicar configurações do ambiente atual
const currentEnv = process.env.NODE_ENV || 'development';
if (TEST_CONFIG.environments[currentEnv]) {
  Object.assign(TEST_CONFIG, TEST_CONFIG.environments[currentEnv]);
}

// Funções utilitárias
const utils = {
  // Gerar timestamp para logs
  timestamp: () => new Date().toISOString(),
  
  // Formatar duração em ms
  formatDuration: (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  },
  
  // Validar resposta da API
  validateApiResponse: (response, expectedFields = []) => {
    const errors = [];
    
    if (!response) {
      errors.push('Resposta vazia ou nula');
      return errors;
    }
    
    // Validar campos obrigatórios
    expectedFields.forEach(field => {
      if (!(field in response)) {
        errors.push(`Campo obrigatório ausente: ${field}`);
      }
    });
    
    return errors;
  },
  
  // Validar estrutura de pedido
  validateOrderStructure: (order) => {
    return utils.validateApiResponse(order, TEST_CONFIG.validation.requiredFields.order);
  },
  
  // Verificar se servidor está rodando
  checkServerHealth: async () => {
    try {
      const response = await fetch(`${TEST_CONFIG.api.baseUrl}/info`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  // Aguardar com timeout
  timeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Retry com backoff
  retryWithBackoff: async (fn, maxRetries = TEST_CONFIG.execution.retries, baseDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        if (TEST_CONFIG.execution.verbose) {
          console.log(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms...`);
        }
        await utils.timeout(delay);
      }
    }
  }
};

module.exports = {
  TEST_CONFIG,
  utils
};