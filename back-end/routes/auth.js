// routes/auth.js - Rotas de autenticação
import express from 'express';
import { login, logout, validateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login e obter token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Fazer logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout realizado com sucesso"
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', verifyToken, logout);

/**
 * @swagger
 * /auth/validate:
 *   get:
 *     summary: Validar token JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "admin"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/validate', verifyToken, validateToken);

/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: Status da autenticação do sistema
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Status da autenticação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authEnabled:
 *                   type: boolean
 *                   description: Se a autenticação está habilitada
 *                   example: false
 *                 requiresAuth:
 *                   type: boolean
 *                   description: Se os endpoints requerem autenticação
 *                   example: false
 */
router.get('/status', (req, res) => {
  res.json({
    authEnabled: process.env.AUTH_ENABLED === 'true',
    requiresAuth: process.env.AUTH_ENABLED === 'true'
  });
});

export default router;