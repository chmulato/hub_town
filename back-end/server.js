// server.js - Servidor principal reorganizado
import express from "express";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import config from './config/config.js';
import { swaggerSpec } from './config/swagger.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import marketplaceRoutes from './routes/marketplace.js';
import ordersRoutes from './routes/orders.js';

const app = express();
const PORT = config.server.port;

// Middleware CORS configurável
app.use(cors({
  origin: config.server.cors.origins,
  methods: config.server.cors.methods,
  allowedHeaders: config.server.cors.headers,
  credentials: true
}));

// Middleware para JSON
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Configurar Swagger UI
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Hub Central de Pedidos - API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'tag',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Endpoint para obter o spec JSON do Swagger
app.get('/api/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Configurar rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/orders', ordersRoutes);

// Endpoint de informações da API
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Hub Central de Pedidos API',
    version: '2.0.0',
    description: 'API unificada para gerenciamento de pedidos de múltiplos marketplaces',
    endpoints: {
      auth: '/api/auth',
      marketplace: '/api/marketplace',
      orders: '/api/orders'
    },
    features: {
      authentication: config.auth.enabled,
      marketplaces: Object.keys(config.marketplaces).filter(key => config.marketplaces[key].enabled),
      pagination: true,
      search: true,
      realAPI: true
    },
    documentation: '/api/swagger'
  });
});

// Endpoint de documentação (deprecated)
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Hub Central de Pedidos - Documentação da API',
    version: '2.0.0',
    swaggerUI: '/api/swagger',
    message: 'Use /api/swagger para documentação interativa completa'
  });
});

// Rotas de compatibilidade com versão anterior (deprecated)
app.get("/api/shopee/orders", (req, res) => {
  res.redirect(301, `/api/marketplace/shopee/orders?${new URLSearchParams(req.query)}`);
});

app.get("/api/ml/orders", (req, res) => {
  res.redirect(301, `/api/marketplace/mercadolivre/orders?${new URLSearchParams(req.query)}`);
});

app.get("/api/shein/orders", (req, res) => {
  res.redirect(301, `/api/marketplace/shein/orders?${new URLSearchParams(req.query)}`);
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    code: 'NOT_FOUND',
    availableEndpoints: [
      '/api/info',
      '/api/docs',
      '/api/auth/*',
      '/api/marketplace/*',
      '/api/orders/*'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, config.server.host, () => {
  console.log(`Hub Central de Pedidos API iniciada!`);
  console.log(`Servidor: http://${config.server.host}:${PORT}`);
  console.log(`Swagger UI: http://${config.server.host}:${PORT}/api/swagger`);
  console.log(`Documentação: http://${config.server.host}:${PORT}/api/docs`);
  console.log(`Autenticação: ${config.auth.enabled ? 'Habilitada' : 'Desabilitada'}`);
  console.log(`Marketplaces ativos: ${Object.keys(config.marketplaces).filter(key => config.marketplaces[key].enabled).join(', ')}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
