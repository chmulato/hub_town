// database.js - Gerenciamento da conexão PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config.js';

// Pool de conexões PostgreSQL
let pool;

export function initDatabase() {
  try {
    pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl,
      max: config.database.max,
      idleTimeoutMillis: config.database.idleTimeoutMillis,
      connectionTimeoutMillis: config.database.connectionTimeoutMillis
    });

    // Event listeners para monitoramento
    pool.on('connect', (client) => {
      console.log('Nova conexão PostgreSQL estabelecida');
    });

    pool.on('error', (err, client) => {
      console.error('Erro na conexão PostgreSQL:', err);
    });

    console.log('Pool de conexões PostgreSQL inicializado');
    return pool;
  } catch (error) {
    console.error('Erro ao inicializar PostgreSQL:', error);
    throw error;
  }
}

// Função para testar a conectividade
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version()');
    client.release();
    
    console.log('Teste de conexão PostgreSQL bem-sucedido');
    console.log(`   Hora do servidor: ${result.rows[0].current_time}`);
    console.log(`   Versão: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    return true;
  } catch (error) {
    console.error('Falha no teste de conexão PostgreSQL:', error.message);
    return false;
  }
}

// Função para executar queries
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Query executada em ${duration}ms:`, text.substring(0, 100));
    }
    
    return result;
  } catch (error) {
    console.error('Erro na query:', error.message);
    console.error('   SQL:', text);
    console.error('   Params:', params);
    throw error;
  }
}

// Função para executar transações
export async function transaction(callback) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Função para fechar o pool (para shutdown graceful)
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('Pool de conexões PostgreSQL fechado');
  }
}

// Função auxiliar para inserir novo pedido
export async function insertOrder(orderData) {
  const {
    marketplace_id,
    original_order_id,
    buyer_id,
    product_name,
    product_sku,
    quantity,
    package_weight,
    package_dimensions,
    order_status = 'pending',
    tracking_code,
    source_api,
    consent_given = false
  } = orderData;

  const queryText = `
    INSERT INTO orders (
      marketplace_id, original_order_id, buyer_id, product_name, product_sku,
      quantity, package_weight, package_dimensions, order_status, tracking_code,
      source_api, consent_given
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

  const values = [
    marketplace_id, original_order_id, buyer_id, product_name, product_sku,
    quantity, package_weight, package_dimensions, order_status, tracking_code,
    source_api, consent_given
  ];

  const result = await query(queryText, values);
  return result.rows[0];
}

// Função auxiliar para buscar pedidos
export async function getOrders(filters = {}) {
  let queryText = `
    SELECT 
      o.*,
      m.name as marketplace_name,
      b.name as buyer_name,
      b.contact as buyer_contact,
      a.street, a.number, a.neighborhood, a.city, a.state, a.zip_code,
      d.name as driver_name,
      r.route_code
    FROM orders o
    LEFT JOIN marketplaces m ON o.marketplace_id = m.id
    LEFT JOIN buyers b ON o.buyer_id = b.id
    LEFT JOIN addresses a ON b.address_id = a.id
    LEFT JOIN drivers d ON o.assigned_driver_id = d.id
    LEFT JOIN routes r ON o.route_id = r.id
  `;

  const conditions = [];
  const values = [];
  let paramCount = 0;

  // Aplicar filtros
  if (filters.status) {
    conditions.push(`o.order_status = $${++paramCount}`);
    values.push(filters.status);
  }

  if (filters.marketplace) {
    conditions.push(`m.name ILIKE $${++paramCount}`);
    values.push(`%${filters.marketplace}%`);
  }

  if (filters.tracking_code) {
    conditions.push(`o.tracking_code = $${++paramCount}`);
    values.push(filters.tracking_code);
  }

  if (filters.hub_order_id) {
    conditions.push(`o.hub_order_id = $${++paramCount}`);
    values.push(filters.hub_order_id);
  }

  if (conditions.length > 0) {
    queryText += ' WHERE ' + conditions.join(' AND ');
  }

  queryText += ' ORDER BY o.created_at DESC';

  // Aplicar limit se especificado
  if (filters.limit) {
    queryText += ` LIMIT $${++paramCount}`;
    values.push(filters.limit);
  }

  const result = await query(queryText, values);
  return result.rows;
}

export { pool };