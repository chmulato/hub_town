// Teste completo da API reorganizada
const testHubAPI = async () => {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🧪 Testando Hub Central de Pedidos API v2.0...\n');
  
  try {
    // 1. Teste de informações da API
    console.log('📋 1. Testando informações da API...');
    const infoResponse = await fetch(`${baseURL}/info`);
    if (infoResponse.ok) {
      const info = await infoResponse.json();
      console.log('✅ API Info funcionando!');
      console.log(`   Versão: ${info.version}`);
      console.log(`   Marketplaces: ${info.features.marketplaces.join(', ')}`);
      console.log(`   Autenticação: ${info.features.authentication ? 'Habilitada' : 'Desabilitada'}`);
    } else {
      console.log('❌ Erro na API Info:', infoResponse.status);
    }

    // 2. Teste de listagem de marketplaces
    console.log('\n🏪 2. Testando listagem de marketplaces...');
    const marketplacesResponse = await fetch(`${baseURL}/marketplace`);
    if (marketplacesResponse.ok) {
      const marketplaces = await marketplacesResponse.json();
      console.log('✅ Lista de marketplaces funcionando!');
      marketplaces.data.forEach(mp => {
        console.log(`   ${mp.icon} ${mp.name} - Mock: ${mp.mockEnabled}, API: ${mp.apiConfigured}`);
      });
    } else {
      console.log('❌ Erro na lista de marketplaces:', marketplacesResponse.status);
    }

    // 3. Teste de pedidos individuais por marketplace
    console.log('\n📦 3. Testando pedidos por marketplace...');
    const marketplaceIds = ['shopee', 'mercadolivre', 'shein'];
    
    for (const marketplaceId of marketplaceIds) {
      const ordersResponse = await fetch(`${baseURL}/marketplace/${marketplaceId}/orders?limit=3`);
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        console.log(`✅ ${marketplaceId.toUpperCase()}: ${orders.total} pedidos total, ${orders.data.length} na página`);
      } else {
        console.log(`❌ Erro em ${marketplaceId}:`, ordersResponse.status);
      }
    }

    // 4. Teste de busca unificada
    console.log('\n🔍 4. Testando busca unificada...');
    const searchResponse = await fetch(`${baseURL}/orders/search?limit=5`);
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('✅ Busca unificada funcionando!');
      console.log(`   Total: ${searchData.total} pedidos`);
      
      // Contar por marketplace
      const marketplaceCount = {};
      searchData.data.forEach(order => {
        marketplaceCount[order.marketplace] = (marketplaceCount[order.marketplace] || 0) + 1;
      });
      console.log('   Por marketplace:', marketplaceCount);
    } else {
      console.log('❌ Erro na busca unificada:', searchResponse.status);
    }

    // 5. Teste de estatísticas
    console.log('\n📊 5. Testando estatísticas...');
    const statsResponse = await fetch(`${baseURL}/orders/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Estatísticas funcionando!');
      console.log(`   Total geral: ${stats.data.total} pedidos`);
      console.log('   Por marketplace:', stats.data.byMarketplace);
      console.log('   Resumo:', stats.data.summary);
    } else {
      console.log('❌ Erro nas estatísticas:', statsResponse.status);
    }

    // 6. Teste de busca com filtro
    console.log('\n🔎 6. Testando busca com filtro...');
    const filteredResponse = await fetch(`${baseURL}/orders/search?search=Silva&limit=3`);
    if (filteredResponse.ok) {
      const filtered = await filteredResponse.json();
      console.log(`✅ Busca filtrada: ${filtered.total} resultados para "Silva"`);
      filtered.data.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.buyer} - ${order.product} (${order.marketplace})`);
      });
    } else {
      console.log('❌ Erro na busca filtrada:', filteredResponse.status);
    }

    // 7. Teste de endpoints de compatibilidade (redirecionamento)
    console.log('\n🔄 7. Testando compatibilidade com versão anterior...');
    const legacyResponse = await fetch('http://localhost:3001/api/shopee/orders?limit=1');
    if (legacyResponse.ok) {
      console.log('✅ Redirecionamento funcionando para endpoints antigos');
    } else {
      console.log('❌ Erro no redirecionamento:', legacyResponse.status);
    }

    console.log('\n� Teste completo finalizado!');
    
  } catch (error) {
    console.error('❌ Erro geral ao testar APIs:', error.message);
  }
};

// Executar teste
testHubAPI();