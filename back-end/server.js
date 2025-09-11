// server.js
import express from "express";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware CORS para permitir requisições do front-end
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware para JSON
app.use(express.json());

// Função para carregar dados dos arquivos JSON
function loadJsonData(filename) {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao carregar ${filename}:`, error);
    return [];
  }
}

// Função para filtrar pedidos
function filterOrders(orders, search) {
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
function paginate(array, page = 1, limit = 5) {
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
  results.search = '';
  
  return results;
}

// Mock Shopee - carrega dados do arquivo JSON com paginação e busca
app.get("/api/shopee/orders", (req, res) => {
  let orders = loadJsonData('shopee-orders.json');
  
  const search = req.query.search;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  
  // Aplicar filtro se houver busca
  if (search) {
    orders = filterOrders(orders, search);
  }
  
  const paginatedResults = paginate(orders, page, limit);
  res.json(paginatedResults);
});

// Mock Mercado Livre - carrega dados do arquivo JSON com paginação e busca
app.get("/api/ml/orders", (req, res) => {
  let orders = loadJsonData('mercadolivre-orders.json');
  
  const search = req.query.search;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  
  // Aplicar filtro se houver busca
  if (search) {
    orders = filterOrders(orders, search);
  }
  
  const paginatedResults = paginate(orders, page, limit);
  res.json(paginatedResults);
});

// Endpoint unificado para buscar em ambos os marketplaces
app.get("/api/orders/search", (req, res) => {
  const shopeeOrders = loadJsonData('shopee-orders.json');
  const mlOrders = loadJsonData('mercadolivre-orders.json');
  
  const search = req.query.search;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Adicionar identificador do marketplace aos pedidos
  const shopeeWithSource = shopeeOrders.map(order => ({ ...order, marketplace: 'shopee' }));
  const mlWithSource = mlOrders.map(order => ({ ...order, marketplace: 'mercadolivre' }));
  
  // Combinar todos os pedidos
  let allOrders = [...shopeeWithSource, ...mlWithSource];
  
  // Aplicar filtro se houver busca
  if (search) {
    allOrders = filterOrders(allOrders, search);
  }
  
  // Ordenar por ID do pedido
  allOrders.sort((a, b) => a.orderId.localeCompare(b.orderId));
  
  const paginatedResults = paginate(allOrders, page, limit);
  res.json(paginatedResults);
});

app.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
});
