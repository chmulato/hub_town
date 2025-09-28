// routes/orders.js - Rotas de pedidos
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
 * /orders/search:
 *   get:
 *     summary: Busca unificada em todos os marketplaces
 *     description: |
 *       Realiza busca simultânea em todos os marketplaces habilitados.
 *       Os resultados incluem pedidos de Shopee, Mercado Livre e Shein.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Search'
 *       - $ref: '#/components/parameters/UseRealAPI'
 *     responses:
 *       200:
 *         description: Resultados da busca unificada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *             examples:
 *               exemplo_busca:
 *                 summary: Exemplo de busca unificada
 *                 value:
 *                   success: true
 *                   data:
 *                     - orderId: "SPE240901001"
 *                       buyer: "João Silva"
 *                       product: "Smartphone Galaxy A54"
 *                       status: "SHIPPED"
 *                       address: "Rua das Flores, 123 - Centro - São Paulo, SP"
 *                       marketplace: "shopee"
 *                       marketplaceInfo:
 *                         name: "Shopee"
 *                         icon: "SHOP"
 *                         color: "#FF6B35"
 *                   total: 60
 *                   currentPage: 1
 *                   totalPages: 6
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/search', conditionalAuth, async (req, res) => {
  try {
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

    const result = await marketplaceService.getAllOrders(options);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erro na busca unificada:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'UNIFIED_SEARCH_ERROR'
    });
  }
});

/**
 * @swagger
 * /orders/stats:
 *   get:
 *     summary: Estatísticas gerais de pedidos
 *     description: |
 *       Retorna estatísticas detalhadas de todos os pedidos, incluindo:
 *       - Contagem total
 *       - Distribuição por marketplace
 *       - Distribuição por status
 *       - Pedidos recentes
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UseRealAPI'
 *     responses:
 *       200:
 *         description: Estatísticas detalhadas dos pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Statistics'
 *             examples:
 *               exemplo_stats:
 *                 summary: Exemplo de estatísticas
 *                 value:
 *                   success: true
 *                   data:
 *                     total: 60
 *                     byMarketplace:
 *                       shopee: 20
 *                       mercadolivre: 20
 *                       shein: 20
 *                     byStatus:
 *                       DELIVERED: 24
 *                       SHIPPED: 18
 *                       READY_TO_SHIP: 12
 *                       WAITING_PICKUP: 6
 *                     summary:
 *                       total: 60
 *                       delivered: 24
 *                       shipped: 18
 *                       pending: 18
 *                     recentOrders:
 *                       - orderId: "SPE240901020"
 *                         buyer: "Maria Santos"
 *                         product: "Notebook Dell"
 *                         status: "DELIVERED"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', conditionalAuth, async (req, res) => {
  try {
    const { useRealAPI = false } = req.query;
    
    // Se a fonte é DB, use agregações SQL
    if (config.data.source === 'db') {
      const stats = await marketplaceService.getStatsFromDB();
      return res.json({ success: true, data: stats });
    }

    // Caso contrário, agregue em memória
    const allOrders = await marketplaceService.getAllOrders({
      page: 1,
      limit: 10000,
      useRealAPI: useRealAPI === 'true'
    });

    const stats = {
      total: allOrders.total,
      byMarketplace: {},
      byStatus: {},
      recentOrders: allOrders.data.slice(0, 5)
    };

    allOrders.data.forEach(order => {
      const marketplace = order.marketplace;
      stats.byMarketplace[marketplace] = (stats.byMarketplace[marketplace] || 0) + 1;
      const status = order.status;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    const delivered = stats.byStatus['DELIVERED'] || 0;
    const shipped = stats.byStatus['SHIPPED'] || 0;
    const pending = (stats.byStatus['READY_TO_SHIP'] || 0) + (stats.byStatus['WAITING_PICKUP'] || 0);

    stats.summary = { total: stats.total, delivered, shipped, pending };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'STATS_ERROR'
    });
  }
});

export default router;