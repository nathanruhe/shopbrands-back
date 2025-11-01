import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
    requestReturn,
    getUserReturns,
    updateReturnStatus
} from './orders.controller';
import invoiceRoutes from './invoice/invoice.routes';

const router = Router();

// Subrutas de facturas/invoice
router.use('/invoice', invoiceRoutes);

/**
 * @route POST /orders
 * @desc Crear un nuevo pedido para el usuario autenticado.
 * @access Private (Usuario autenticado)
 * @param {object} req.body
 * @param {number} req.body.address_id ID de la dirección de envío
 * @param {Array} req.body.items Lista de items del pedido ({ product_id, quantity, price })
 * @param {number} req.body.total Total del pedido
 * @returns {object} { message: string, orderId: number }
 */
router.post('/', authenticate, createOrder);

/**
 * @route GET /orders/me
 * @desc Obtener todos los pedidos del usuario autenticado.
 * @access Private (Usuario autenticado)
 * @returns {Array} Lista de pedidos con items y dirección
 */
router.get('/me', authenticate, getUserOrders);

/**
 * @route GET /orders/:id
 * @desc Obtener los detalles de un pedido propio por ID.
 * @access Private (Usuario autenticado)
 * @param {number} req.params.id ID del pedido
 * @returns {object} Detalles del pedido con items, dirección y total
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @route POST /orders/:id/return
 * @desc Solicitar devolución de un pedido.
 * @access Private (Usuario autenticado)
 * @param {number} req.params.id ID del pedido
 * @param {object} req.body
 * @param {string} req.body.reason Motivo de la devolución
 * @returns {object} { message: string, returnId: number }
 */
router.post('/:id/return', authenticate, requestReturn);

/**
 * @route GET /orders/me/returns
 * @desc Obtener todas las devoluciones realizadas por el usuario autenticado.
 * @access Private (Usuario autenticado)
 * @returns {Array} Lista de devoluciones del usuario
 */
router.get('/me/returns', authenticate, getUserReturns);

/**
 * @route GET /orders
 * @desc Listar todos los pedidos (solo admin).
 * @access Admin
 * @returns {Array} Lista completa de pedidos
 */
router.get('/', authenticate, authorize('admin'), getAllOrders);

/**
 * @route PUT /orders/:id/status
 * @desc Actualizar el estado de un pedido (solo admin).
 * @access Admin
 * @param {number} req.params.id ID del pedido
 * @param {object} req.body
 * @param {string} req.body.status Nuevo estado del pedido
 * @returns {object} { message: string }
 */
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus);

/**
 * @route DELETE /orders/:id
 * @desc Eliminar un pedido (solo admin).
 * @access Admin
 * @param {number} req.params.id ID del pedido
 * @returns {object} { message: string }
 */
router.delete('/:id', authenticate, authorize('admin'), deleteOrder);

/**
 * @route PUT /orders/returns/:id/status
 * @desc Actualizar el estado de una devolución (aprobar o rechazar) (solo admin).
 * @access Admin
 * @param {number} req.params.id ID de la devolución
 * @param {object} req.body
 * @param {'approved'|'rejected'} req.body.status Nuevo estado de la devolución
 * @returns {object} { message: string }
 */
router.put('/returns/:id/status', authenticate, authorize('admin'), updateReturnStatus);

export default router;
