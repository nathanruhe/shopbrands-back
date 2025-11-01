import { Response } from 'express';
import { OrdersService } from './orders.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

/**
 * Crear un nuevo pedido para el usuario autenticado.
 * @route POST /orders
 * @access Private (usuario autenticado)
 * @param {AuthenticatedRequest} req - Request con `user` y body con datos del pedido (`address_id`, `items`, `total`).
 * @param {Response} res - Response con resultado de la creación.
 */
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { address_id, items, total } = req.body;
        const result = await OrdersService.createOrder(req.user!.id, address_id, items, total);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Obtener todos los pedidos del usuario autenticado.
 * @route GET /orders
 * @access Private (usuario autenticado)
 * @param {AuthenticatedRequest} req - Request con `user`.
 * @param {Response} res - Response con lista de pedidos del usuario.
 */
export const getUserOrders = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const orders = await OrdersService.getUserOrders(req.user!.id);
        res.json(orders);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Obtener los detalles de un pedido por su ID.
 * @route GET /orders/:id
 * @access Private (usuario autenticado)
 * @param {AuthenticatedRequest} req - Request con `params.id` del pedido.
 * @param {Response} res - Response con datos del pedido.
 */
export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const orderId = parseInt(req.params.id!);
        const order = await OrdersService.getOrderById(orderId);
        res.json(order);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Obtener todos los pedidos (solo admin).
 * @route GET /orders/all
 * @access Admin
 * @param {AuthenticatedRequest} req - Request del administrador.
 * @param {Response} res - Response con lista de todos los pedidos.
 */
export const getAllOrders = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const orders = await OrdersService.getAllOrders();
        res.json(orders);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualizar el estado de un pedido por su ID (solo admin).
 * @route PUT /orders/:id/status
 * @access Admin
 * @param {AuthenticatedRequest} req - Request con `params.id` y body `{ status: string }`.
 * @param {Response} res - Response con mensaje de actualización.
 */
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const orderId = parseInt(req.params.id!);
        const { status } = req.body;
        await OrdersService.updateOrderStatus(orderId, status);
        res.json({ message: 'Estado actualizado' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Eliminar un pedido por su ID (solo admin).
 * @route DELETE /orders/:id
 * @access Admin
 * @param {AuthenticatedRequest} req - Request con `params.id`.
 * @param {Response} res - Response con mensaje de eliminación.
 */
export const deleteOrder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const orderId = parseInt(req.params.id!);
        await OrdersService.deleteOrder(orderId);
        res.json({ message: 'Pedido eliminado' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Solicitar devolución de un pedido (usuario).
 * @route POST /orders/:id/return
 * @access Private (usuario autenticado)
 * @param {AuthenticatedRequest} req - Request con `params.id` del pedido y body `{ reason: string }`.
 * @param {Response} res - Response con mensaje de devolución creada y `returnId`.
 */
export const requestReturn = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const orderId = parseInt(req.params.id!);
        const { reason, totalAmount } = req.body;
        const result = await OrdersService.requestReturn(orderId, req.user!.id, reason);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Obtener todas las devoluciones realizadas por el usuario.
 * @route GET /orders/returns
 * @access Private (usuario autenticado)
 * @param {AuthenticatedRequest} req - Request con `user`.
 * @param {Response} res - Response con lista de devoluciones del usuario.
 */
export const getUserReturns = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const returns = await OrdersService.getUserReturns(req.user!.id);
        res.json(returns);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualizar el estado de una devolución (solo admin).
 * @route PUT /orders/returns/:id/status
 * @access Admin
 * @param {AuthenticatedRequest} req - Request con `params.id` de la devolución y body `{ status: 'approved' | 'rejected' }`.
 * @param {Response} res - Response con mensaje de actualización de estado.
 */
export const updateReturnStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const returnId = parseInt(req.params.id!);
        const { status } = req.body;
        const result = await OrdersService.updateReturnStatus(returnId, status);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
