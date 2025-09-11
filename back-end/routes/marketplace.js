// routes/marketplace.js - Rotas dos marketplaces
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import marketplaceService from '../services/marketplaceService.js';
import config from '../config/config.js';

const router = express.Router();

// Middleware de autenticação condicional
const conditionalAuth = (req, res, next) => {
  if (config.auth.enabled) {
    return verifyToken(req, res, next);
  }
  next();
};

/**
 * @swagger
 * /marketplace:
 *   get:
 *     summary: Listar marketplaces disponíveis
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de marketplaces disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Marketplace'
 *                 total:
 *                   type: integer
 *                   example: 3
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', conditionalAuth, (req, res) => {
  try {
    const marketplaces = marketplaceService.getAvailableMarketplaces();
    res.json({
      success: true,
      data: marketplaces,
      total: marketplaces.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'MARKETPLACE_LIST_ERROR'
    });
  }
});

/**
 * @swagger
 * /marketplace/{marketplace}/config:
 *   get:
 *     summary: Obter configuração de um marketplace
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MarketplaceId'
 *     responses:
 *       200:
 *         description: Configuração do marketplace
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Shopee"
 *                     icon:
 *                       type: string
 *                       example: "SHOP"
 *                     color:
 *                       type: string
 *                       example: "#FF6B35"
 *                     enabled:
 *                       type: boolean
 *                       example: true
 *                     mockEnabled:
 *                       type: boolean
 *                       example: true
 *                     apiConfigured:
 *                       type: boolean
 *                       example: false
 *                     requiresAuth:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Marketplace não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:marketplace/config', conditionalAuth, (req, res) => {
  try {
    const { marketplace } = req.params;
    const config = marketplaceService.getMarketplaceConfig(marketplace);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Marketplace não encontrado',
        code: 'MARKETPLACE_NOT_FOUND'
      });
    }

    // Remover dados sensíveis antes de retornar
    const publicConfig = {
      name: config.name,
      icon: config.icon,
      color: config.color,
      enabled: config.enabled,
      mockEnabled: config.mock.enabled,
      apiConfigured: !!config.api.baseUrl,
      requiresAuth: config.api.requiresAuth
    };

    res.json({
      success: true,
      data: publicConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'CONFIG_ERROR'
    });
  }
});

/**
 * @swagger
 * /marketplace/{marketplace}/orders:
 *   get:
 *     summary: Obter pedidos de um marketplace específico
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MarketplaceId'
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Search'
 *       - $ref: '#/components/parameters/UseRealAPI'
 *     responses:
 *       200:
 *         description: Lista de pedidos do marketplace
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     marketplace:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Shopee"
 *                         icon:
 *                           type: string
 *                           example: "SHOP"
 *                         color:
 *                           type: string
 *                           example: "#FF6B35"
 *       404:
 *         description: Marketplace não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:marketplace/orders', conditionalAuth, async (req, res) => {
  try {
    const { marketplace } = req.params;
    const {
      page = config.pagination.defaultPage,
      limit = config.pagination.defaultLimit,
      search = '',
      useRealAPI = false
    } = req.query;

    // Validar limites de paginação
    const parsedLimit = Math.min(parseInt(limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
    const parsedPage = parseInt(page) || config.pagination.defaultPage;

    const options = {
      page: parsedPage,
      limit: parsedLimit,
      search: search.trim(),
      useRealAPI: useRealAPI === 'true'
    };

    const result = await marketplaceService.getOrders(marketplace, options);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error(`Erro ao buscar pedidos do ${req.params.marketplace}:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'ORDERS_FETCH_ERROR'
    });
  }
});

/**
 * @swagger
 * /marketplace/{marketplace}/auth/validate:
 *   get:
 *     summary: Validar autenticação da API do marketplace
 *     description: Verifica se as credenciais da API real do marketplace estão configuradas corretamente
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MarketplaceId'
 *     responses:
 *       200:
 *         description: Status da validação de autenticação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 marketplace:
 *                   type: string
 *                   example: "shopee"
 *                 authValid:
 *                   type: boolean
 *                   description: Se a autenticação está válida
 *                   example: false
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   description: Mensagem de erro se a autenticação for inválida
 *                   example: "Token de acesso não configurado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:marketplace/auth/validate', conditionalAuth, (req, res) => {
  try {
    const { marketplace } = req.params;
    const validation = marketplaceService.validateAPIAuth(marketplace);
    
    res.json({
      success: true,
      marketplace,
      authValid: validation.valid,
      error: validation.error || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'AUTH_VALIDATION_ERROR'
    });
  }
});

export default router;