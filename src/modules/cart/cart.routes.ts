import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { getCart, addItem, updateItem, removeItem, emptyCart, checkout } from './cart.controller';

const router = Router();

/**
 * Obtener carrito del usuario autenticado.
 * Ruta: GET /api/cart
 * @route GET /api/cart
 * @desc Retorna el carrito completo con items y totales del usuario.
 * @access Private (requiere token)
 * @async
 * @returns {Promise<void>} JSON con carrito, items y total.
 * @throws {400} Si ocurre un error al obtener el carrito.
 * @example
 * // GET /api/cart
 * const cart = await getCart(req, res);
 */
router.get('/', authenticate, getCart);

/**
 * Añadir item al carrito.
 * Ruta: POST /api/cart/items
 * @route POST /api/cart/items
 * @desc Añade un producto al carrito. Si ya existe, suma la cantidad.
 * @access Private (requiere token)
 * @async
 * @param {Object} req.body - Datos del producto a añadir.
 * @param {number} req.body.productId - ID del producto.
 * @param {number} req.body.quantity - Cantidad a añadir.
 * @returns {Promise<void>} JSON con carrito actualizado.
 * @throws {400} Si productId o quantity inválidos o stock insuficiente.
 * @example
 * // POST /api/cart/items
 * await addItem(req, res);
 */
router.post('/items', authenticate, addItem);

/**
 * Actualizar cantidad de un item en el carrito.
 * Ruta: PUT /api/cart/items/:id
 * @route PUT /api/cart/items/:id
 * @desc Reemplaza la cantidad actual de un item en el carrito.
 * @access Private (requiere token)
 * @async
 * @param {string} req.params.id - ID del item en el carrito.
 * @param {Object} req.body - Nuevo valor de cantidad.
 * @param {number} req.body.quantity - Cantidad a actualizar.
 * @returns {Promise<void>} JSON con carrito actualizado.
 * @throws {400} Si quantity inválido o stock insuficiente.
 * @example
 * // PUT /api/cart/items/7
 * await updateItem(req, res);
 */
router.put('/items/:id', authenticate, updateItem);

/**
 * Eliminar un item del carrito.
 * Ruta: DELETE /api/cart/items/:id
 * @route DELETE /api/cart/items/:id
 * @desc Elimina un item específico del carrito.
 * @access Private (requiere token)
 * @async
 * @param {string} req.params.id - ID del item a eliminar.
 * @returns {Promise<void>} JSON con carrito actualizado.
 * @throws {400} Si ocurre un error al eliminar el item.
 * @example
 * // DELETE /api/cart/items/7
 * await removeItem(req, res);
 */
router.delete('/items/:id', authenticate, removeItem);

/**
 * Vaciar completamente el carrito.
 * Ruta: DELETE /api/cart
 * @route DELETE /api/cart
 * @desc Elimina todos los items del carrito del usuario.
 * @access Private (requiere token)
 * @async
 * @returns {Promise<void>} JSON con carrito vacío.
 * @throws {400} Si ocurre un error al vaciar el carrito.
 * @example
 * // DELETE /api/cart
 * await emptyCart(req, res);
 */
router.delete('/', authenticate, emptyCart);

/**
 * Realizar checkout del carrito.
 * Ruta: POST /api/cart/checkout
 * @route POST /api/cart/checkout
 * @desc Valida stock, crea order pendiente, genera sesión Stripe y devuelve URL de pago.
 * @access Private (requiere token)
 * @async
 * @param {Object} req.body - Datos necesarios para el checkout.
 * @param {number} req.body.addressId - ID de la dirección de envío.
 * @param {string} req.body.frontendUrl - URL del frontend para redirección tras pago.
 * @returns {Promise<void>} JSON con { orderId, url }.
 * @throws {400} Si carrito vacío, stock insuficiente o parámetros inválidos.
 * @example
 * // POST /api/cart/checkout
 * await checkout(req, res);
 */
router.post('/checkout', authenticate, checkout);

export default router;
