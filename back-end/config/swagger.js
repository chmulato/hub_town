// config/swagger.js - Configuração do Swagger/OpenAPI
import swaggerJSDoc from 'swagger-jsdoc';
import config from './config.js';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Hub Central de Pedidos API',
    version: '2.0.0',
    description: `
      API unificada para gerenciamento de pedidos de múltiplos marketplaces.
      
      ## Recursos Principais
      - **Autenticação JWT configurável**
      - **Suporte a múltiplos marketplaces** (Shopee, Mercado Livre, Shein)
      - **Busca unificada** em todos os marketplaces
      - **Estatísticas detalhadas** de pedidos
      - **APIs reais ou dados mock** configuráveis
      
      ## Autenticação
      ${config.auth.enabled ? 
        '**Autenticação habilitada** - Use o endpoint `/auth/login` para obter um token JWT.' :
        '**Autenticação desabilitada** - Todos os endpoints estão liberados para uso.'
      }
    `,
    contact: {
      name: 'Hub Team',
      email: 'contato@hub.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://${config.server.host}:${config.server.port}/api`,
      description: 'Servidor de Desenvolvimento'
    },
    {
      url: 'https://hub-api.exemplo.com/api',
      description: 'Servidor de Produção'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido através do endpoint /auth/login'
      }
    },
    schemas: {
      Order: {
        type: 'object',
        required: ['orderId', 'buyer', 'product', 'status', 'address'],
        properties: {
          orderId: {
            type: 'string',
            description: 'ID único do pedido',
            example: 'SPE240901001'
          },
          buyer: {
            type: 'string',
            description: 'Nome do comprador',
            example: 'João Silva'
          },
          product: {
            type: 'string',
            description: 'Nome do produto',
            example: 'Smartphone Galaxy A54'
          },
          status: {
            type: 'string',
            enum: ['DELIVERED', 'SHIPPED', 'READY_TO_SHIP', 'WAITING_PICKUP'],
            description: 'Status do pedido',
            example: 'SHIPPED'
          },
          address: {
            type: 'string',
            description: 'Endereço de entrega',
            example: 'Rua das Flores, 123 - Centro - São Paulo, SP'
          },
          marketplace: {
            type: 'string',
            description: 'Marketplace de origem (apenas em buscas unificadas)',
            example: 'shopee'
          },
          marketplaceInfo: {
            type: 'object',
            description: 'Informações do marketplace',
            properties: {
              name: { type: 'string', example: 'Shopee' },
              icon: { type: 'string', example: 'SHOP' },
              color: { type: 'string', example: '#FF6B35' }
            }
          }
        }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Order' }
          },
          total: {
            type: 'integer',
            description: 'Total de itens',
            example: 60
          },
          currentPage: {
            type: 'integer',
            description: 'Página atual',
            example: 1
          },
          totalPages: {
            type: 'integer',
            description: 'Total de páginas',
            example: 6
          },
          next: {
            type: 'object',
            nullable: true,
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' }
            }
          },
          previous: {
            type: 'object',
            nullable: true,
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' }
            }
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            description: 'Mensagem de erro',
            example: 'Marketplace não encontrado'
          },
          code: {
            type: 'string',
            description: 'Código do erro',
            example: 'MARKETPLACE_NOT_FOUND'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            description: 'Nome de usuário',
            example: 'admin'
          },
          password: {
            type: 'string',
            description: 'Senha',
            example: 'admin123'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          token: {
            type: 'string',
            description: 'Token JWT',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              username: { type: 'string', example: 'admin' },
              role: { type: 'string', example: 'admin' }
            }
          },
          expiresIn: {
            type: 'string',
            example: '24h'
          }
        }
      },
      Marketplace: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID do marketplace',
            example: 'shopee'
          },
          name: {
            type: 'string',
            description: 'Nome do marketplace',
            example: 'Shopee'
          },
          icon: {
            type: 'string',
            description: 'Ícone emoji',
            example: '🛍️'
          },
          color: {
            type: 'string',
            description: 'Cor em hexadecimal',
            example: '#FF6B35'
          },
          mockEnabled: {
            type: 'boolean',
            description: 'Se dados mock estão habilitados',
            example: true
          },
          apiConfigured: {
            type: 'boolean',
            description: 'Se a API real está configurada',
            example: false
          }
        }
      },
      Statistics: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            description: 'Total de pedidos',
            example: 60
          },
          byMarketplace: {
            type: 'object',
            description: 'Contagem por marketplace',
            example: {
              shopee: 20,
              mercadolivre: 20,
              shein: 20
            }
          },
          byStatus: {
            type: 'object',
            description: 'Contagem por status',
            example: {
              DELIVERED: 24,
              SHIPPED: 18,
              READY_TO_SHIP: 12,
              WAITING_PICKUP: 6
            }
          },
          summary: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 60 },
              delivered: { type: 'integer', example: 24 },
              shipped: { type: 'integer', example: 18 },
              pending: { type: 'integer', example: 18 }
            }
          }
        }
      }
    },
    parameters: {
      Page: {
        name: 'page',
        in: 'query',
        description: 'Número da página',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        }
      },
      Limit: {
        name: 'limit',
        in: 'query',
        description: 'Número de itens por página',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10
        }
      },
      Search: {
        name: 'search',
        in: 'query',
        description: 'Termo de busca (código do pedido, nome do comprador, produto ou endereço)',
        required: false,
        schema: {
          type: 'string'
        }
      },
      UseRealAPI: {
        name: 'useRealAPI',
        in: 'query',
        description: 'Usar API real ao invés de dados mock',
        required: false,
        schema: {
          type: 'boolean',
          default: false
        }
      },
      MarketplaceId: {
        name: 'marketplace',
        in: 'path',
        description: 'ID do marketplace',
        required: true,
        schema: {
          type: 'string',
          enum: ['shopee', 'mercadolivre', 'shein'],
          example: 'shopee'
        }
      }
    }
  },
  security: config.auth.enabled ? [{ bearerAuth: [] }] : [],
  tags: [
    {
      name: 'Info',
      description: 'Informações gerais da API'
    },
    {
      name: 'Auth',
      description: 'Autenticação e autorização'
    },
    {
      name: 'Marketplace',
      description: 'Gerenciamento de marketplaces'
    },
    {
      name: 'Orders',
      description: 'Gerenciamento de pedidos'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./routes/*.js', './server.js'], // Arquivos com anotações do Swagger
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerDefinition;