import { db } from '../../config/config';
import * as Queries from '../../database/queries/cart.queries';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';

/**
 * Servicio para manejo del carrito de la compra
 * - persiste en tablas `cart` y `cart_items`
 * - suma cantidades si ya existe el mismo producto en el carrito
 * - checkout: crea order (status pending) y genera sesión Stripe (flow A)
 */
export const CartService = {
    /**
     * Obtener o crear el carrito de un usuario.
     * @async
     * @param {number} userId - ID del usuario.
     * @returns {Promise<number>} ID del carrito.
     * @example
     * const cartId = await CartService.getOrCreateCartId(1);
     */
    async getOrCreateCartId(userId: number) {
        const [rows]: any = await db.query(Queries.GET_CART_BY_USER, [userId]);
        if (rows.length) return rows[0].id;

        const [res]: any = await db.query(Queries.CREATE_CART, [userId]);
        return res.insertId;
    },

    /**
     * Obtener el carrito completo con items enriquecidos y totales.
     * @async
     * @param {number} userId - ID del usuario.
     * @returns {Promise<{cart_id: number, items: Array<Object>, total: number}>} Carrito con items y total.
     * @example
     * const cart = await CartService.getCart(1);
     */
    async getCart(userId: number) {
        const cartId = await this.getOrCreateCartId(userId);
        const [rows]: any = await db.query(Queries.GET_CART_ITEMS_BY_CART, [cartId]);

        const items = rows.map((r: any) => ({
            id: r.id,
            product_id: r.product_id,
            product_name: r.product_name,
            price: Number(r.product_price || 0),
            quantity: Number(r.quantity || 0),
            stock: typeof r.product_stock !== 'undefined' && r.product_stock !== null ? Number(r.product_stock) : null,
            image_url: r.product_image ? `${process.env.BASE_URL || ''}/uploads/${r.product_image}` : null,
            subtotal: Number(((Number(r.product_price || 0) * Number(r.quantity || 0))).toFixed(2)),
        }));

        const total = items.reduce((acc: number, it: any) => acc + it.subtotal, 0);

        return { cart_id: cartId, items, total: Number(total.toFixed(2)) };
    },

    /**
     * Añadir un item al carrito.
     * - Si ya existe el producto, suma la cantidad.
     * - Valida stock con la nueva cantidad.
     * @async
     * @param {number} userId - ID del usuario.
     * @param {number} productId - ID del producto.
     * @param {number} quantity - Cantidad a añadir.
     * @returns {Promise<{cart_id: number, items: Array<Object>, total: number}>} Carrito actualizado.
     * @throws {Error} Si productId o quantity son inválidos o stock insuficiente.
     * @example
     * const updatedCart = await CartService.addItem(1, 42, 3);
     */
    async addItem(userId: number, productId: number, quantity: number) {
        if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
            throw new Error('product_id y quantity válidos son requeridos');
        }

        const cartId = await this.getOrCreateCartId(userId);

        // comprobar si ya existe el mismo product en el carrito
        const [foundRows]: any = await db.query(Queries.FIND_CART_ITEM_BY_PRODUCT, [cartId, productId]);

        // obtener stock y precio actual del producto
        const [prodRows]: any = await db.query('SELECT id, price, stock FROM products WHERE id = ?', [productId]);
        if (!prodRows.length) throw new Error('Producto no encontrado');
        const product = prodRows[0];
        const stock = product.stock !== null && typeof product.stock !== 'undefined' ? Number(product.stock) : null;

        if (foundRows.length) {
            const existing = foundRows[0];
            const newQuantity = Number(existing.quantity) + Number(quantity);

            if (stock !== null && newQuantity > stock) {
                throw new Error('Stock insuficiente para la cantidad solicitada');
            }

            await db.query(Queries.UPDATE_CART_ITEM, [newQuantity, existing.id, cartId]);
        } else {
            if (stock !== null && quantity > stock) {
                throw new Error('Stock insuficiente para la cantidad solicitada');
            }
            await db.query(Queries.ADD_CART_ITEM, [cartId, productId, quantity]);
        }

        return this.getCart(userId);
    },

    /**
     * Actualizar la cantidad de un item en el carrito.
     * @async
     * @param {number} userId - ID del usuario.
     * @param {number} itemId - ID del item en el carrito.
     * @param {number} quantity - Nueva cantidad.
     * @returns {Promise<{cart_id: number, items: Array<Object>, total: number}>} Carrito actualizado.
     * @throws {Error} Si quantity inválido o stock insuficiente.
     * @example
     * const updatedCart = await CartService.updateItem(1, 7, 5);
     */
    async updateItem(userId: number, itemId: number, quantity: number) {
        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error('Quantity válido es requerido y debe ser mayor que 0');
        }

        const cartId = await this.getOrCreateCartId(userId);

        // comprobar que el item pertenece al carrito y obtener product_id para validar stock
        const [rows]: any = await db.query('SELECT product_id FROM cart_items WHERE id = ? AND cart_id = ?', [itemId, cartId]);
        if (!rows.length) throw new Error('Item no encontrado en el carrito');

        const productId = rows[0].product_id;
        const [prodRows]: any = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
        if (!prodRows.length) throw new Error('Producto no encontrado');
        const stock = prodRows[0].stock !== null && typeof prodRows[0].stock !== 'undefined' ? Number(prodRows[0].stock) : null;

        if (stock !== null && quantity > stock) throw new Error('Stock insuficiente para la cantidad solicitada');

        await db.query(Queries.UPDATE_CART_ITEM, [quantity, itemId, cartId]);
        return this.getCart(userId);
    },

    /**
     * Eliminar un item del carrito.
     * @async
     * @param {number} userId - ID del usuario.
     * @param {number} itemId - ID del item a eliminar.
     * @returns {Promise<{cart_id: number, items: Array<Object>, total: number}>} Carrito actualizado.
     * @example
     * const updatedCart = await CartService.removeItem(1, 7);
     */
    async removeItem(userId: number, itemId: number) {
        const cartId = await this.getOrCreateCartId(userId);
        await db.query(Queries.DELETE_CART_ITEM, [itemId, cartId]);
        return this.getCart(userId);
    },

    /**
     * Eliminar completamente el carrito de un usuario.
     * @async
     * @param {number} userId - ID del usuario.
     * @throws {Error} Si no se puede eliminar el carrito.
     * @example
     * await CartService.deleteCart(1);
     */
    async deleteCart(userId: number): Promise<void> {
        try {
            await db.query(Queries.DELETE_CART_BY_USER, [userId]);
            console.log(`🗑️ Carrito del usuario ${userId} eliminado completamente`);
        } catch (error) {
            console.error(`❌ Error eliminando carrito del usuario ${userId}:`, error);
            throw new Error('No se pudo eliminar el carrito del usuario');
        }
    },

    /**
     * Realizar checkout del carrito.
     * - Valida items y stock.
     * - Crea order (status 'pending') usando OrdersService.createOrder.
     * - Crea Stripe Checkout session usando PaymentsService.createCheckoutSession.
     * - Vacía el carrito.
     * @async
     * @param {number} userId - ID del usuario.
     * @param {number} addressId - ID de la dirección de envío.
     * @param {string} frontendUrl - URL del frontend para redirección de Stripe.
     * @returns {Promise<{orderId: number, url: string}>} Objeto con ID de order y URL de pago.
     * @throws {Error} Si carrito vacío, stock insuficiente o parámetros inválidos.
     * @example
     * const result = await CartService.checkout(1, 3, 'https://myfrontend.com/checkout-success');
     */
    async checkout(userId: number, addressId: number, frontendUrl: string) {
        if (!addressId) throw new Error('addressId es requerido para el checkout');
        if (!frontendUrl || typeof frontendUrl !== 'string') throw new Error('frontendUrl es requerido');

        const cart = await this.getCart(userId);
        if (!cart.items.length) throw new Error('El carrito está vacío');

        // validar stock y construir items para order
        const itemsForOrder: any[] = [];
        let total = 0;
        for (const it of cart.items) {
            // volver a obtener precio/stock real por si hubo cambios
            const [prodRows]: any = await db.query('SELECT price, stock FROM products WHERE id = ?', [it.product_id]);
            if (!prodRows.length) throw new Error(`Producto ${it.product_id} no encontrado`);
            const price = Number(prodRows[0].price);
            const stock = prodRows[0].stock !== null && typeof prodRows[0].stock !== 'undefined' ? Number(prodRows[0].stock) : null;

            if (stock !== null && it.quantity > stock) {
                throw new Error(`Stock insuficiente para producto ${it.product_name}`);
            }

            itemsForOrder.push({
                product_id: it.product_id,
                quantity: it.quantity,
                price: price,
            });

            total += price * it.quantity;
        }
        total = Number(total.toFixed(2));

        // Crear order (OrdersService.createOrder inserta order + order_items y notifica admin)
        const createResult: any = await OrdersService.createOrder(userId, addressId, itemsForOrder, total);
        const orderId = createResult.orderId;

        // Crear sesión Stripe
        const session = await PaymentsService.createCheckoutSession(orderId, frontendUrl);

        return { orderId, url: session.url };
    },
};
