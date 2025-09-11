// run-all-tests.js - Executor de todos os testes automatizados
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const TEST_CONFIG = {
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3001/api',
  timeout: parseInt(process.env.TEST_TIMEOUT) || 10000,
  concurrent: process.env.TEST_CONCURRENT === 'true',
  saveResults: true
};

console.log('🚀 Executando todos os testes do Hub Central de Pedidos v2.0...\n');
console.log('⚙️  Configuração:', TEST_CONFIG);
console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
console.log('=' .repeat(60));

const runTest = (testFile) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const testPath = path.join(__dirname, '..', testFile);
    
    console.log(`\n🧪 Executando: ${testFile}...`);
    
    exec(`node "${testPath}"`, { timeout: TEST_CONFIG.timeout }, (error, stdout, stderr) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const result = {
        testFile,
        success: !error,
        duration,
        output: stdout,
        error: stderr || (error ? error.message : null),
        timestamp: new Date().toISOString()
      };
      
      if (error) {
        console.log(`❌ ${testFile} FALHOU (${duration}ms)`);
        console.log('Erro:', error.message);
        if (stderr) console.log('Stderr:', stderr);
      } else {
        console.log(`✅ ${testFile} PASSOU (${duration}ms)`);
      }
      
      resolve(result);
    });
  });
};

const saveResults = (results) => {
  if (!TEST_CONFIG.saveResults) return;
  
  const resultsDir = path.join(__dirname, '..', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Salvar resultado mais recente
  const latestFile = path.join(resultsDir, 'latest-test-result.txt');
  const summary = generateSummary(results);
  fs.writeFileSync(latestFile, summary);
  
  // Adicionar ao histórico
  const historyFile = path.join(resultsDir, 'test-history.log');
  const historyEntry = `\n${'='.repeat(80)}\n${summary}`;
  fs.appendFileSync(historyFile, historyEntry);
  
  console.log(`\n💾 Resultados salvos em: ${resultsDir}`);
};

const generateSummary = (results) => {
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  let summary = `RESUMO DOS TESTES - ${new Date().toLocaleString('pt-BR')}\n`;
  summary += `${'='.repeat(50)}\n`;
  summary += `Total de testes: ${results.length}\n`;
  summary += `✅ Passou: ${passed}\n`;
  summary += `❌ Falhou: ${failed}\n`;
  summary += `⏱️  Duração total: ${totalDuration}ms\n`;
  summary += `🎯 Taxa de sucesso: ${((passed / results.length) * 100).toFixed(1)}%\n\n`;
  
  summary += `DETALHES POR TESTE:\n`;
  summary += `${'-'.repeat(50)}\n`;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
    summary += `${status} | ${result.testFile} | ${result.duration}ms\n`;
    
    if (!result.success && result.error) {
      summary += `   Erro: ${result.error}\n`;
    }
  });
  
  if (results.some(r => r.output)) {
    summary += `\nSAÍDA DOS TESTES:\n`;
    summary += `${'-'.repeat(50)}\n`;
    results.forEach(result => {
      if (result.output) {
        summary += `\n--- ${result.testFile} ---\n`;
        summary += result.output;
      }
    });
  }
  
  return summary;
};

const main = async () => {
  const testFiles = [
    'api-integration-test.js'
    // Adicione novos arquivos de teste aqui
  ];
  
  const results = [];
  
  try {
    if (TEST_CONFIG.concurrent) {
      // Executar testes em paralelo
      console.log('🔄 Executando testes em paralelo...');
      const promises = testFiles.map(runTest);
      const parallelResults = await Promise.all(promises);
      results.push(...parallelResults);
    } else {
      // Executar testes sequencialmente
      console.log('🔄 Executando testes sequencialmente...');
      for (const testFile of testFiles) {
        const result = await runTest(testFile);
        results.push(result);
      }
    }
    
    // Gerar relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL');
    console.log('='.repeat(60));
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`Total de testes: ${results.length}`);
    console.log(`✅ Passou: ${passed}`);
    console.log(`❌ Falhou: ${failed}`);
    console.log(`⏱️  Duração total: ${totalDuration}ms`);
    console.log(`🎯 Taxa de sucesso: ${((passed / results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Testes que falharam:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   - ${result.testFile}: ${result.error}`);
      });
    }
    
    // Salvar resultados
    saveResults(results);
    
    // Status de saída
    if (failed > 0) {
      console.log('\n🚨 Alguns testes falharam. Verifique os logs acima.');
      process.exit(1);
    } else {
      console.log('\n🎉 Todos os testes passaram com sucesso!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n💥 Erro fatal durante execução dos testes:', error);
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { runTest, saveResults, generateSummary, TEST_CONFIG };