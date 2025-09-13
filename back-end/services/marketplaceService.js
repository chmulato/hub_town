// services/marketplaceService.js - Serviço para gerenciar APIs dos marketplaces
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MarketplaceService {
  constructor() {
    this.marketplaces = config.marketplaces;
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

    // Se deve usar API real e está configurada
    if (useRealAPI && marketplaceConfig.api.baseUrl) {
      return await this.fetchFromRealAPI(marketplace, options);
    }

    // Caso contrário, usar dados mock
    let orders = this.loadMockData(marketplace);
    
    // Aplicar filtro se houver busca
    if (search) {
      orders = this.filterOrders(orders, search);
    }

    // Aplicar paginação
    const paginatedResults = this.paginate(orders, page, limit);
    
    // Adicionar metadados do marketplace
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

    let allOrders = [];

    // Buscar dados de todos os marketplaces
    for (const marketplace of enabledMarketplaces) {
      try {
        let orders;
        
        if (useRealAPI && this.marketplaces[marketplace].api.baseUrl) {
          const result = await this.fetchFromRealAPI(marketplace, { ...options, page: 1, limit: 1000 });
          orders = result.data || [];
        } else {
          orders = this.loadMockData(marketplace);
        }

        // Adicionar identificador do marketplace aos pedidos
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

    // Aplicar filtro se houver busca
    if (search) {
      allOrders = this.filterOrders(allOrders, search);
    }

    // Ordenar por ID do pedido
    allOrders.sort((a, b) => a.orderId.localeCompare(b.orderId));

    // Aplicar paginação
    const paginatedResults = this.paginate(allOrders, page, limit);
    
    return paginatedResults;
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
}

export default new MarketplaceService();