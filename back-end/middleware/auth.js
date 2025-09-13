// middleware/auth.js - Middleware de autenticação
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/config.js';

// Simulação de banco de usuários (em produção, usar banco de dados)
const users = new Map();

// Inicializar usuário padrão
users.set(config.auth.defaultUser.username, {
  id: 1,
  username: config.auth.defaultUser.username,
  password: hashPassword(config.auth.defaultUser.password),
  role: config.auth.defaultUser.role,
  createdAt: new Date()
});

// Função para hash da senha
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + config.auth.secretKey).digest('hex');
}

// Função para verificar senha
function verifyPassword(password, hashedPassword) {
  const hash = hashPassword(password);
  return hash === hashedPassword;
}

// Função para gerar token JWT
export function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, config.auth.secretKey, { 
    expiresIn: config.auth.tokenExpiry 
  });
}

// Middleware de verificação de token
export function verifyToken(req, res, next) {
  // Se autenticação está desabilitada, pular verificação
  if (!config.auth.enabled) {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Token de acesso não fornecido',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Formato de token inválido',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }

  try {
    const decoded = jwt.verify(token, config.auth.secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
}

// Middleware de verificação de role
export function requireRole(role) {
  return (req, res, next) => {
    if (!config.auth.enabled) {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSION'
      });
    }

    next();
  };
}

// Função de login
export function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Username e password são obrigatórios',
      code: 'MISSING_CREDENTIALS'
    });
  }

  const user = users.get(username);
  
  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ 
      error: 'Credenciais inválidas',
      code: 'INVALID_CREDENTIALS'
    });
  }

  const token = generateToken(user);
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    },
    expiresIn: config.auth.tokenExpiry
  });
}

// Função para validar token
export function validateToken(req, res) {
  // Token já foi validado pelo middleware verifyToken
  res.json({
    valid: true,
    user: req.user
  });
}

// Função para logout (blacklist token - simplificado)
export function logout(req, res) {
  // Em uma implementação real, adicionar token à blacklist
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
}

export default {
  verifyToken,
  requireRole,
  login,
  validateToken,
  logout,
  generateToken
};