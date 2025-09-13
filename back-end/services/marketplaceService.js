// services/marketplaceService.js - Serviço para gerenciar APIs dos marketplaces
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/config.js';
import { query } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MarketplaceService {
  constructor() {
    this.marketplaces = config.marketplaces;
  }

  nameToSlug(name) {
    if (!name) return '';
    const lower = name.toLowerCase();
    const match = Object.keys(this.marketplaces).find(
      key => this.marketplaces[key].name.toLowerCase() === lower
    );
    return match || lower.replace(/\s+/g, '');
  }

  // Carregar dados do arquivo JSON (modo mock)
  loadMockData(marketplace) {
    try {
      const marketplaceConfig = this.marketplaces[marketplace];
      if (!marketplaceConfig || !marketplaceConfig.mock.enabled) {
        throw new Error(`Mock não habilitado para ${marketplace}`);
      }

      const filePath = path.join(__dirname, '..', 'data', marketplaceConfig.mock.dataFile);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Erro ao carregar dados mock do ${marketplace}:`, error);
      return [];
    }
  }

  // Função para filtrar pedidos
  filterOrders(orders, search) {
    if (!search) return orders;
    
    const searchTerm = search.toLowerCase();
    
    return orders.filter(order => 
      order.orderId.toLowerCase().includes(searchTerm) ||
      order.buyer.toLowerCase().includes(searchTerm) ||
      order.product.toLowerCase().includes(searchTerm) ||
      order.address.toLowerCase().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm)
    );
  }

  // Função para paginação
  paginate(array, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const results = {};
    
    if (endIndex < array.length) {
      results.next = {
        page: page + 1,
        limit: limit
      };
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      };
    }
    
    results.data = array.slice(startIndex, endIndex);
    results.total = array.length;
    results.currentPage = page;
    results.totalPages = Math.ceil(array.length / limit);
    
    return results;
  }

  // Buscar pedidos de um marketplace específico
  async getOrders(marketplace, options = {}) {
    const {
      page = config.pagination.defaultPage,
      limit = config.pagination.defaultLimit,
      search = '',
      useRealAPI = false
    } = options;

    const marketplaceConfig = this.marketplaces[marketplace];
    
    if (!marketplaceConfig) {
      throw new Error(`Marketplace ${marketplace} não configurado`);
    }

    if (!marketplaceConfig.enabled) {
      throw new Error(`Marketplace ${marketplace} está desabilitado`);
    }

    // Caminho baseado na fonte de dados
    if (config.data.source === 'api' && useRealAPI && marketplaceConfig.api.baseUrl) {
      return await this.fetchFromRealAPI(marketplace, options);
    }

    if (config.data.source === 'db') {
      return await this.getOrdersFromDB(marketplace, { page, limit, search });
    }

    // Fallback mock
    let orders = this.loadMockData(marketplace);
    if (search) orders = this.filterOrders(orders, search);
    const paginatedResults = this.paginate(orders, page, limit);
    paginatedResults.marketplace = {
      name: marketplaceConfig.name,
      icon: marketplaceConfig.icon,
      color: marketplaceConfig.color
    };
    return paginatedResults;
  }

  // Buscar pedidos de todos os marketplaces (busca unificada)
  async getAllOrders(options = {}) {
    const {
      page = config.pagination.defaultPage,
      limit = config.pagination.defaultLimit,
      search = '',
      useRealAPI = false
    } = options;

    const enabledMarketplaces = Object.keys(this.marketplaces)
      .filter(key => this.marketplaces[key].enabled);
    // Fonte DB
    if (config.data.source === 'db') {
      return await this.getAllOrdersFromDB({ page, limit, search });
    }

    // Fonte API real
    let allOrders = [];
    for (const marketplace of enabledMarketplaces) {
      try {
        let orders;
        if (config.data.source === 'api' && useRealAPI && this.marketplaces[marketplace].api.baseUrl) {
          const result = await this.fetchFromRealAPI(marketplace, { ...options, page: 1, limit: 1000 });
          orders = result.data || [];
        } else {
          orders = this.loadMockData(marketplace);
        }
        const ordersWithSource = orders.map(order => ({
          ...order,
          marketplace,
          marketplaceInfo: {
            name: this.marketplaces[marketplace].name,
            icon: this.marketplaces[marketplace].icon,
            color: this.marketplaces[marketplace].color
          }
        }));
        allOrders = [...allOrders, ...ordersWithSource];
      } catch (error) {
        console.error(`Erro ao buscar dados do ${marketplace}:`, error);
      }
    }
    if (search) allOrders = this.filterOrders(allOrders, search);
    allOrders.sort((a, b) => a.orderId.localeCompare(b.orderId));
    return this.paginate(allOrders, page, limit);
  }

  // Buscar dados da API real (implementação futura)
  async fetchFromRealAPI(marketplace, options) {
    const marketplaceConfig = this.marketplaces[marketplace];
    
    if (!marketplaceConfig.api.baseUrl) {
      throw new Error(`API não configurada para ${marketplace}`);
    }

    // TODO: Implementar chamadas para APIs reais
    // Por enquanto, retorna dados mock como fallback
    console.log(`Buscando dados reais do ${marketplace}... (não implementado ainda)`);
    
    let orders = this.loadMockData(marketplace);
    
    if (options.search) {
      orders = this.filterOrders(orders, options.search);
    }

    return this.paginate(orders, options.page, options.limit);
  }

  // Obter configurações de um marketplace
  getMarketplaceConfig(marketplace) {
    return this.marketplaces[marketplace] || null;
  }

  // Listar todos os marketplaces disponíveis
  getAvailableMarketplaces() {
    return Object.keys(this.marketplaces)
      .filter(key => this.marketplaces[key].enabled)
      .map(key => ({
        id: key,
        name: this.marketplaces[key].name,
        icon: this.marketplaces[key].icon,
        color: this.marketplaces[key].color,
        mockEnabled: this.marketplaces[key].mock.enabled,
        apiConfigured: !!this.marketplaces[key].api.baseUrl
      }));
  }

  // Validar configuração de autenticação para API real
  validateAPIAuth(marketplace) {
    const marketplaceConfig = this.marketplaces[marketplace];
    
    if (!marketplaceConfig) {
      return { valid: false, error: 'Marketplace não encontrado' };
    }

    if (!marketplaceConfig.api.requiresAuth) {
      return { valid: true };
    }

    const { authType, credentials } = marketplaceConfig.api;
    
    switch (authType) {
      case 'bearer':
        if (!credentials.token) {
          return { valid: false, error: 'Token de acesso não configurado' };
        }
        break;
      case 'apikey':
        if (!credentials.apiKey) {
          return { valid: false, error: 'API Key não configurada' };
        }
        break;
      case 'basic':
        if (!credentials.username || !credentials.password) {
          return { valid: false, error: 'Credenciais básicas não configuradas' };
        }
        break;
      default:
        return { valid: false, error: 'Tipo de autenticação não suportado' };
    }

    return { valid: true };
  }

  // ========== Fonte DB: helpers ==========
  async getOrdersFromDB(marketplace, { page, limit, search }) {
    // Map marketplace slug -> name in DB
    const marketplaceName = this.marketplaces[marketplace]?.name;
    if (!marketplaceName) throw new Error(`Marketplace ${marketplace} não configurado`);

    const offset = (page - 1) * limit;

    const baseWhere = [`m.name = $1`];
    const params = [marketplaceName];
    let paramIdx = params.length;

    if (search) {
      const like = `%${search}%`;
      baseWhere.push(`(
        o.hub_order_id ILIKE $${++paramIdx} OR
        o.original_order_id ILIKE $${++paramIdx} OR
        COALESCE(b.name,'') ILIKE $${++paramIdx} OR
        COALESCE(o.product_name,'') ILIKE $${++paramIdx} OR
        COALESCE(a.street,'') || ' ' || COALESCE(a.number,'') || ' ' || COALESCE(a.city,'') || ' ' || COALESCE(a.state,'') ILIKE $${++paramIdx}
      )`);
      params.push(like, like, like, like, like);
    }

    const whereSql = baseWhere.length ? `WHERE ${baseWhere.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM orders o
      JOIN marketplaces m ON o.marketplace_id = m.id
      LEFT JOIN buyers b ON o.buyer_id = b.id
      LEFT JOIN addresses a ON b.address_id = a.id
      ${whereSql}
    `;
    const dataSql = `
      SELECT 
        o.hub_order_id AS "orderId",
        COALESCE(b.name,'') AS buyer,
        COALESCE(o.product_name,'') AS product,
        UPPER(COALESCE(o.order_status,'')) AS status,
        TRIM(CONCAT_WS(' ', COALESCE(a.street,''), COALESCE(a.number,''), '-', COALESCE(a.city,''), COALESCE(a.state,''))) AS address,
        m.name AS marketplace_name
      FROM orders o
      JOIN marketplaces m ON o.marketplace_id = m.id
      LEFT JOIN buyers b ON o.buyer_id = b.id
      LEFT JOIN addresses a ON b.address_id = a.id
      ${whereSql}
      ORDER BY o.created_at DESC
      LIMIT $${paramIdx + 1} OFFSET $${paramIdx + 2}
    `;

    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.total || 0;

    const dataParams = [...params, limit, offset];
    const dataResult = await query(dataSql, dataParams);
    const data = dataResult.rows.map(r => {
      const slug = marketplace; // for single marketplace path we already know
      return {
        orderId: r.orderId,
        buyer: r.buyer,
        product: r.product,
        status: r.status,
        address: r.address,
        marketplace: slug,
        marketplaceInfo: {
          name: this.marketplaces[slug].name,
          icon: this.marketplaces[slug].icon,
          color: this.marketplaces[slug].color
        }
      };
    });

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      next: (offset + data.length) < total ? { page: page + 1, limit } : null,
      previous: page > 1 ? { page: page - 1, limit } : null,
      marketplace: {
        name: this.marketplaces[marketplace].name,
        icon: this.marketplaces[marketplace].icon,
        color: this.marketplaces[marketplace].color
      }
    };
  }

  async getAllOrdersFromDB({ page, limit, search }) {
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    let idx = 0;

    if (search) {
      const like = `%${search}%`;
      where.push(`(
        o.hub_order_id ILIKE $${++idx} OR
        o.original_order_id ILIKE $${++idx} OR
        COALESCE(b.name,'') ILIKE $${++idx} OR
        COALESCE(o.product_name,'') ILIKE $${++idx} OR
        COALESCE(a.street,'') || ' ' || COALESCE(a.number,'') || ' ' || COALESCE(a.city,'') || ' ' || COALESCE(a.state,'') ILIKE $${++idx}
      )`);
      params.push(like, like, like, like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM orders o
      JOIN marketplaces m ON o.marketplace_id = m.id
      LEFT JOIN buyers b ON o.buyer_id = b.id
      LEFT JOIN addresses a ON b.address_id = a.id
      ${whereSql}
    `;
    const dataSql = `
      SELECT 
        o.hub_order_id AS "orderId",
        COALESCE(b.name,'') AS buyer,
        COALESCE(o.product_name,'') AS product,
        UPPER(COALESCE(o.order_status,'')) AS status,
        TRIM(CONCAT_WS(' ', COALESCE(a.street,''), COALESCE(a.number,''), '-', COALESCE(a.city,''), COALESCE(a.state,''))) AS address,
        m.name AS marketplace_name
      FROM orders o
      JOIN marketplaces m ON o.marketplace_id = m.id
      LEFT JOIN buyers b ON o.buyer_id = b.id
      LEFT JOIN addresses a ON b.address_id = a.id
      ${whereSql}
      ORDER BY o.created_at DESC
      LIMIT $${idx + 1} OFFSET $${idx + 2}
    `;

    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.total || 0;

    const dataParams = [...params, limit, offset];
    const dataResult = await query(dataSql, dataParams);
    const rows = dataResult.rows;
    const data = rows.map(r => {
      const slug = this.nameToSlug(r.marketplace_name);
      return {
        orderId: r.orderId,
        buyer: r.buyer,
        product: r.product,
        status: r.status,
        address: r.address,
        marketplace: slug,
        marketplaceInfo: {
          name: this.marketplaces[slug]?.name || r.marketplace_name,
          icon: this.marketplaces[slug]?.icon || '',
          color: this.marketplaces[slug]?.color || '#999999'
        }
      };
    });

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      next: (offset + data.length) < total ? { page: page + 1, limit } : null,
      previous: page > 1 ? { page: page - 1, limit } : null
    };
  }

  async getStatsFromDB() {
    const totalSql = 'SELECT COUNT(*)::int AS total FROM orders';
    const byMarketplaceSql = `
      SELECT LOWER(m.name) AS marketplace, COUNT(*)::int AS count
      FROM orders o
      JOIN marketplaces m ON o.marketplace_id = m.id
      GROUP BY LOWER(m.name)
    `;
    const byStatusSql = `
      SELECT UPPER(o.order_status) AS status, COUNT(*)::int AS count
      FROM orders o
      GROUP BY o.order_status
    `;
    const recentSql = `
      SELECT 
        o.hub_order_id AS "orderId",
        COALESCE(b.name,'') AS buyer,
        COALESCE(o.product_name,'') AS product,
        UPPER(COALESCE(o.order_status,'')) AS status,
        TRIM(CONCAT_WS(' ', COALESCE(a.street,''), COALESCE(a.number,''), '-', COALESCE(a.city,''), COALESCE(a.state,''))) AS address,
        m.name AS marketplace_name
      FROM orders o
      JOIN marketplaces m ON o.marketplace_id = m.id
      LEFT JOIN buyers b ON o.buyer_id = b.id
      LEFT JOIN addresses a ON b.address_id = a.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `;

    const [totalRes, byMarketRes, byStatusRes, recentRes] = await Promise.all([
      query(totalSql),
      query(byMarketplaceSql),
      query(byStatusSql),
      query(recentSql)
    ]);

    const total = totalRes.rows[0]?.total || 0;
    const byMarketplace = {};
    for (const row of byMarketRes.rows) {
      byMarketplace[row.marketplace] = row.count;
    }
    const byStatus = {};
    for (const row of byStatusRes.rows) {
      byStatus[row.status] = row.count;
    }
    const recentOrders = recentRes.rows.map(r => {
      const slug = this.nameToSlug(r.marketplace_name);
      return {
        orderId: r.orderId,
        buyer: r.buyer,
        product: r.product,
        status: r.status,
        address: r.address,
        marketplace: slug,
        marketplaceInfo: {
          name: this.marketplaces[slug]?.name || r.marketplace_name,
          icon: this.marketplaces[slug]?.icon || '',
          color: this.marketplaces[slug]?.color || '#999999'
        }
      };
    });

    const delivered = byStatus['DELIVERED'] || 0;
    const shipped = byStatus['SHIPPED'] || 0;
    const pending = (byStatus['READY_TO_SHIP'] || 0) + (byStatus['WAITING_PICKUP'] || 0);

    return {
      total,
      byMarketplace,
      byStatus,
      summary: { total, delivered, shipped, pending },
      recentOrders
    };
  }
}

export default new MarketplaceService();