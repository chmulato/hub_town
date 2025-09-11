// run-endpoint-config-test.js
// Script para executar apenas o teste de configuração de endpoints

import { ConfigurationValidator } from '../endpoint-config-test.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Teste de Configuração de Endpoints e Autenticação');
console.log('Hub Central de Pedidos v2.0\n');

console.log('📋 Este teste verifica:');
console.log('  • Validação de URLs de endpoints');
console.log('  • Credenciais para cada tipo de autenticação');
console.log('  • Geração correta de headers HTTP');
console.log('  • Simulação de conectividade');
console.log('  • Suporte para API Key, OAuth 2.0, JWT e Basic Auth');
console.log('  • Compatibilidade com Shopee, Mercado Livre e Shein\n');

const validator = new ConfigurationValidator();
validator.runAllTests();