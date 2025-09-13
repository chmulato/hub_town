// migrate-json-data.js - Script para migrar dados dos JSONs para PostgreSQL
import fs from 'fs';
import path from 'path';
import { initDatabase, query, transaction } from './config/database.js';

// Função para normalizar endereços
function parseAddress(addressString) {
  // Formato esperado: "Rua das Flores, 123 - Centro - São Paulo/SP"
  const parts = addressString.split(' - ');
  
  if (parts.length >= 3) {
    const streetPart = parts[0].trim();
    const neighborhood = parts[1].trim();
    const cityState = parts[2].trim();
    
    // Extrair rua e número
    const streetMatch = streetPart.match(/^(.+?),?\s*(\d+.*)?$/);
    const street = streetMatch ? streetMatch[1].trim() : streetPart;
    const number = streetMatch && streetMatch[2] ? streetMatch[2].trim() : '';
    
    // Extrair cidade e estado
    const cityStateMatch = cityState.match(/^(.+?)\/([A-Z]{2})$/);
    const city = cityStateMatch ? cityStateMatch[1].trim() : cityState;
    const state = cityStateMatch ? cityStateMatch[2].trim() : '';
    
    return {
      street,
      number,
      neighborhood,
      city,
      state,
      zip_code: '00000-000' // placeholder, dados reais não têm CEP
    };
  }
  
  // Fallback se o formato não for reconhecido
  return {
    street: addressString,
    number: '',
    neighborhood: 'Centro',
    city: 'Cidade',
    state: 'SP',
    zip_code: '00000-000'
  };
}

// Função para mapear status dos marketplaces para status padronizado
function mapStatus(status, marketplace) {
  const statusMap = {
    'mercadolivre': {
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'CANCELLED': 'cancelled'
    },
    'shopee': {
      'READY_TO_SHIP': 'ready_to_ship',
      'WAITING_PICKUP': 'pending',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled'
    },
    'shein': {
      'PROCESSING': 'processing',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'PENDING': 'pending',
      'CANCELLED': 'cancelled'
    }
  };
  
  return statusMap[marketplace]?.[status] || 'pending';
}

// Função para inserir ou buscar endereço
async function insertOrGetAddress(addressData, client) {
  // Verificar se endereço já existe
  const existingAddress = await client.query(`
    SELECT id FROM addresses 
    WHERE street = $1 AND number = $2 AND neighborhood = $3 AND city = $4 AND state = $5
  `, [addressData.street, addressData.number, addressData.neighborhood, addressData.city, addressData.state]);
  
  if (existingAddress.rows.length > 0) {
    return existingAddress.rows[0].id;
  }
  
  // Inserir novo endereço
  const result = await client.query(`
    INSERT INTO addresses (street, number, neighborhood, city, state, zip_code)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `, [addressData.street, addressData.number, addressData.neighborhood, addressData.city, addressData.state, addressData.zip_code]);
  
  return result.rows[0].id;
}

// Função para inserir ou buscar comprador
async function insertOrGetBuyer(name, addressId, client) {
  // Verificar se comprador já existe
  const existingBuyer = await client.query(`
    SELECT id FROM buyers WHERE name = $1 AND address_id = $2
  `, [name, addressId]);
  
  if (existingBuyer.rows.length > 0) {
    return existingBuyer.rows[0].id;
  }
  
  // Inserir novo comprador
  const result = await client.query(`
    INSERT INTO buyers (name, address_id)
    VALUES ($1, $2)
    RETURNING id
  `, [name, addressId]);
  
  return result.rows[0].id;
}

// Função para migrar dados de um marketplace
async function migrateMarketplaceData(marketplaceName, jsonFile) {
  console.log(`📦 Migrando dados do ${marketplaceName}...`);
  
  try {
    // Ler arquivo JSON
    const filePath = path.join('data', jsonFile);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Buscar ID do marketplace
    const marketplaceResult = await query(`
      SELECT id FROM marketplaces WHERE name = $1
    `, [marketplaceName]);
    
    if (marketplaceResult.rows.length === 0) {
      console.error(`❌ Marketplace '${marketplaceName}' não encontrado no banco`);
      return;
    }
    
    const marketplaceId = marketplaceResult.rows[0].id;
    let successCount = 0;
    let errorCount = 0;
    
    // Migrar cada pedido em uma transação
    for (const order of jsonData) {
      try {
        await transaction(async (client) => {
          // Processar endereço
          const addressData = parseAddress(order.address);
          const addressId = await insertOrGetAddress(addressData, client);
          
          // Processar comprador
          const buyerId = await insertOrGetBuyer(order.buyer, addressId, client);
          
          // Mapear status
          const mappedStatus = mapStatus(order.status, marketplaceName.toLowerCase());
          
          // Inserir pedido
          await client.query(`
            INSERT INTO orders (
              marketplace_id, original_order_id, buyer_id, product_name,
              quantity, order_status, source_api, created_at, consent_given
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (marketplace_id, original_order_id) DO NOTHING
          `, [
            marketplaceId,
            order.orderId,
            buyerId,
            order.product,
            order.quantity || 1,
            mappedStatus,
            marketplaceName.toLowerCase(),
            order.orderDate,
            true // assumindo consentimento para dados de exemplo
          ]);
        });
        
        successCount++;
      } catch (error) {
        console.error(`   ❌ Erro ao migrar pedido ${order.orderId}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`   ✅ ${successCount} pedidos migrados com sucesso`);
    if (errorCount > 0) {
      console.log(`   ⚠️  ${errorCount} pedidos com erro`);
    }
    
  } catch (error) {
    console.error(`❌ Erro ao migrar ${marketplaceName}:`, error.message);
  }
}

// Função principal
async function migrateAllData() {
  console.log('🚀 Iniciando migração de dados dos JSONs para PostgreSQL...');
  
  try {
    // Inicializar banco
    initDatabase();
    
    // Aguardar um pouco para conexão
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Migrar dados de cada marketplace
    await migrateMarketplaceData('Mercado Livre', 'mercadolivre-orders.json');
    await migrateMarketplaceData('Shopee', 'shopee-orders.json');
    await migrateMarketplaceData('Shein', 'shein-orders.json');
    
    // Mostrar estatísticas finais
    const totalOrders = await query('SELECT COUNT(*) as count FROM orders');
    const totalBuyers = await query('SELECT COUNT(*) as count FROM buyers');
    const totalAddresses = await query('SELECT COUNT(*) as count FROM addresses');
    
    console.log('\n📊 Estatísticas da migração:');
    console.log(`   Total de pedidos: ${totalOrders.rows[0].count}`);
    console.log(`   Total de compradores: ${totalBuyers.rows[0].count}`);
    console.log(`   Total de endereços: ${totalAddresses.rows[0].count}`);
    
    console.log('\n🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    process.exit(0);
  }
}

// Executar migração se o script for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAllData();
}

export { migrateAllData };