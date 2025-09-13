// config.js - Configurações centralizadas do sistema
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Fonte de dados (mock | db | api)
  data: {
    source: process.env.DATA_SOURCE || 'mock'
  },
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    cors: {
      origins: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
    }
  },

  // Configurações do banco de dados PostgreSQL
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hubtown_db',
    user: process.env.DB_USER || 'hubtown_user',
    password: process.env.DB_PASSWORD || 'hubtown_pass',
    ssl: process.env.DB_SSL === 'true' || false,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000
  },

  // Configurações de autenticação
  auth: {
    enabled: process.env.AUTH_ENABLED === 'true' || false,
    secretKey: process.env.JWT_SECRET || 'hub-central-secret-key-2024',
    tokenExpiry: process.env.TOKEN_EXPIRY || '24h',
    defaultUser: {
      username: process.env.DEFAULT_USER || 'admin',
      password: process.env.DEFAULT_PASSWORD || 'admin123',
      role: 'admin'
    }
  },

  // Configurações dos marketplaces
  marketplaces: {
    shopee: {
      name: 'Shopee',
      icon: 'SHOP',
      color: '#FF6B35',
      enabled: true,
      mock: {
        enabled: true,
        dataFile: 'shopee-orders.json'
      },
      api: {
        baseUrl: process.env.SHOPEE_API_URL || null,
        authType: 'bearer', // 'bearer', 'apikey', 'basic'
        credentials: {
          token: process.env.SHOPEE_TOKEN || null,
          apiKey: process.env.SHOPEE_API_KEY || null,
          secret: process.env.SHOPEE_SECRET || null
        },
        endpoints: {
          orders: '/api/v2/orders',
          orderDetails: '/api/v2/orders/{orderId}'
        },
        requiresAuth: true
      }
    },

    mercadolivre: {
      name: 'Mercado Livre',
      icon: 'STORE',
      color: '#FFE600',
      enabled: true,
      mock: {
        enabled: true,
        dataFile: 'mercadolivre-orders.json'
      },
      api: {
        baseUrl: process.env.ML_API_URL || 'https://api.mercadolibre.com',
        authType: 'bearer',
        credentials: {
          token: process.env.ML_ACCESS_TOKEN || null,
          clientId: process.env.ML_CLIENT_ID || null,
          clientSecret: process.env.ML_CLIENT_SECRET || null
        },
        endpoints: {
          orders: '/orders/search',
          orderDetails: '/orders/{orderId}'
        },
        requiresAuth: true
      }
    },

    shein: {
      name: 'Shein',
      icon: 'FASHION',
      color: '#8B5CF6',
      enabled: true,
      mock: {
        enabled: true,
        dataFile: 'shein-orders.json'
      },
      api: {
        baseUrl: process.env.SHEIN_API_URL || null,
        authType: 'apikey',
        credentials: {
          apiKey: process.env.SHEIN_API_KEY || null,
          merchantId: process.env.SHEIN_MERCHANT_ID || null
        },
        endpoints: {
          orders: '/api/orders/list',
          orderDetails: '/api/orders/detail/{orderId}'
        },
        requiresAuth: true
      }
    }
  },

  // Configurações de paginação
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    defaultPage: 1
  },

  // Configurações de cache
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true' || false,
    ttl: process.env.CACHE_TTL || 300 // 5 minutos
  },

  // Configurações de log
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/hub.log'
  }
};

export default config;