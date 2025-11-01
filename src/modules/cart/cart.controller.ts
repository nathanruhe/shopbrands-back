import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

/**
 * GET /api/cart
 * Obtiene el carrito completo del usuario autenticado.
 * @async
 * @param {AuthenticatedRequest} req - Request autenticado con `user.id`.
 * @param {Response} res - Respuesta con objeto { cart_id, items[], total }.
 * @throws {400} Si ocurre un error al obtener el carrito.
 * @example
 * await getCart(req, res);
 */
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const data = await CartService.getCart(req.user!.id);
        res.json(data);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * POST /api/cart/items
 * Añade un item al carrito. Si ya existe, suma la cantidad.
 * @async
 * @param {AuthenticatedRequest} req - Request autenticado con `user.id`.
 * @param {Object} req.body
 * @param {number} req.body.product_id - ID del producto.
 * @param {number} req.body.quantity - Cantidad a añadir.
 * @param {Response} res - Respuesta con carrito actualizado { cart_id, items[], total }.
 * @throws {400} Si product_id o quantity inválidos, o stock insuficiente.
 * @example
 * await addItem(req, res);
 */
export const addItem = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { product_id, quantity } = req.body;
        const data = await CartService.addItem(req.user!.id, Number(product_id), Number(quantity));
        res.json(data);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * PUT /api/cart/items/:id
 * Actualiza la cantidad de un item en el carrito.
 * @async
 * @param {AuthenticatedRequest} req - Request autenticado con `user.id`.
 * @param {Object} req.body
 * @param {number} req.body.quantity - Nueva cantidad.
 * @param {Object} req.params
 * @param {string} req.params.id - ID del item en el carrito.
 * @param {Response} res - Respuesta con carrito actualizado { cart_id, items[], total }.
 * @throws {400} Si quantity inválido o stock insuficiente.
 * @example
 * await updateItem(req, res);
 */
export const updateItem = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const itemId = parseInt(req.params.id!, 10);
        const { quantity } = req.body;
        const data = await CartService.updateItem(req.user!.id, itemId, Number(quantity));
        res.json(data);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * DELETE /api/cart/items/:id
 * Elimina un item del carrito.
 * @async
 * @param {AuthenticatedRequest} req - Request autenticado con `user.id`.
 * @param {Object} req.params
 * @param {string} req.params.id - ID del item a eliminar.
 * @param {Response} res - Respuesta con carrito actualizado { cart_id, items[], total }.
 * @throws {400} Si ocurre un error al eliminar el item.
 * @example
 * await removeItem(req, res);
 */
export const removeItem = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const itemId = parseInt(req.params.id!, 10);
        const data = await CartService.removeItem(req.user!.id, itemId);
        res.json(data);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * DELETE /api/cart
 * Vacía completamente el carrito del usuario.
 * @async
 * @param {AuthenticatedRequest} req - Request autenticado con `user.id`.
 * @param {Response} res - Respuesta vacía o confirmación de eliminación.
 * @throws {400} Si ocurre un error al vaciar el carrito.
 * @example
 * await emptyCart(req, res);
 */
export const emptyCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const data = await CartService.deleteCart(req.user!.id);
        res.json(data);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * POST /api/cart/checkout
 * Realiza el checkout del carrito y genera sesión de pago (Stripe).
 * @async
 * @param {AuthenticatedRequest} req - Request autenticado con `user.id`.
 * @param {Object} req.body
 * @param {number} req.body.address_id - ID de la dirección de envío.
 * @param {string} req.body.frontendUrl - URL del frontend para redirección tras pago.
 * @param {Response} res - Respuesta con objeto { orderId, url } de Stripe Checkout.
 * @throws {400} Si carrito vacío, stock insuficiente o parámetros inválidos.
 * @example
 * await checkout(req, res);
 */
export const checkout = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { address_id, frontendUrl } = req.body;
        const result = await CartService.checkout(req.user!.id, Number(address_id), frontendUrl);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
