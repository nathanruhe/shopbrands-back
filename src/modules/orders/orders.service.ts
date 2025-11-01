import { db } from '../../config/config';
import {
    CREATE_ORDER,
    CREATE_ORDER_ITEM,
    GET_ORDERS_BY_USER,
    GET_ORDER_BY_ID,
    GET_ALL_ORDERS,
    UPDATE_ORDER_STATUS,
    DELETE_ORDER,
    CREATE_RETURN_REQUEST,
    UPDATE_RETURN_STATUS,
    GET_RETURNS_BY_USER,
    GET_RETURN_BY_ID
} from '../../database/queries/orders.queries';
import { mapOrderStatus } from '../../utils/mappers.utils';
import { notifyAdminNewOrder } from '../../utils/notifications.util';
import { sendReturnApprovedEmail, sendReturnRejectedEmail, sendReturnCompletedEmail } from './notifications/send-return-updates';
import { stripe } from '../../integrations/stripe.service';

/**
 * Reconstruye el total original de un pedido teniendo en cuenta pagos parciales y descuentos
 * @param {number} dbTotal Total registrado en DB
 * @param {number | null} dbTotalPaid Total pagado por el usuario
 * @param {number | null} dbDiscount Descuento aplicado
 * @returns {number} Total reconstruido
 */
function reconstructOriginalTotal(dbTotal: number, dbTotalPaid: number | null, dbDiscount: number | null) {
    if (dbTotalPaid !== null && dbDiscount !== null) {
        if (Math.abs(dbTotal - dbTotalPaid) < 0.0001) {
            return Number((dbTotalPaid + dbDiscount).toFixed(2));
        }
    }
    return dbTotal;
}

export const OrdersService = {
    /**
     * Crear un nuevo pedido con items asociados
     * @param {number} userId ID del usuario que realiza el pedido
     * @param {number} addressId ID de la dirección de envío
     * @param {Array<{product_id:number, quantity:number, price:number}>} items Lista de items del pedido
     * @param {number} total Total del pedido
     * @returns {Promise<{message:string, orderId:number}>} Mensaje y ID del pedido creado
     */
    async createOrder(userId: number, addressId: number, items: any[], total: number) {
        const [result]: any = await db.query(CREATE_ORDER, [userId, addressId, 'pending', total]);
        const orderId = result.insertId;

        for (const item of items) {
            const { product_id, quantity, price } = item;
            await db.query(CREATE_ORDER_ITEM, [orderId, product_id, quantity, price]);
        }

        notifyAdminNewOrder(orderId, userId);

        return { message: 'Pedido creado correctamente', orderId };
    },

    /**
     * Obtener todos los pedidos de un usuario con sus items y dirección
     * @param {number} userId ID del usuario
     * @returns {Promise<any[]>} Lista de pedidos con detalle de items y dirección
     */
    async getUserOrders(userId: number) {
        const [rows]: any = await db.query(GET_ORDERS_BY_USER, [userId]);
        const ordersMap: Record<number, any> = {};

        rows.forEach((r: any) => {
            if (!ordersMap[r.id]) {
                const dbTotal = Number(r.total);
                const dbTotalPaid = r.total_paid !== null && typeof r.total_paid !== 'undefined' ? Number(r.total_paid) : null;
                const dbDiscount = r.discount_amount !== null && typeof r.discount_amount !== 'undefined' ? Number(r.discount_amount) : null;
                const originalTotal = reconstructOriginalTotal(dbTotal, dbTotalPaid, dbDiscount);

                ordersMap[r.id] = {
                    id: r.id,
                    status: r.status,
                    status_label: mapOrderStatus(r.status),
                    total: Number(originalTotal),
                    total_paid: dbTotalPaid,
                    discount_amount: dbDiscount,
                    promotion_code: r.promotion_code || null,
                    address: {
                        id: r.address_id,
                        full_name: `${r.first_name} ${r.last_name}`,
                        street: r.street,
                        city: r.city,
                        province: r.province,
                        postal_code: r.postal_code,
                        country: r.country,
                        phone: r.phone,
                    },
                    items: [],
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                };
            }

            if (r.order_item_id) {
                ordersMap[r.id].items.push({
                    id: r.order_item_id,
                    product_id: r.product_id,
                    product_name: r.product_name,
                    quantity: r.quantity,
                    price: Number(r.price),
                    image_url: r.image_url,
                    size: r.size,
                    color: r.color,
                    sku: r.sku,
                });
            }
        });

        return Object.values(ordersMap);
    },

    /**
     * Obtener un pedido por su ID
     * @param {number} orderId ID del pedido
     * @returns {Promise<any>} Pedido con items y dirección
     * @throws Error si el pedido no existe
     */
    async getOrderById(orderId: number) {
        const [rows]: any = await db.query(GET_ORDER_BY_ID, [orderId]);
        if (!rows.length) throw new Error('Pedido no encontrado');

        const r = rows[0];
        const dbTotal = Number(r.total);
        const dbTotalPaid = r.total_paid !== null && typeof r.total_paid !== 'undefined' ? Number(r.total_paid) : null;
        const dbDiscount = r.discount_amount !== null && typeof r.discount_amount !== 'undefined' ? Number(r.discount_amount) : null;
        const originalTotal = reconstructOriginalTotal(dbTotal, dbTotalPaid, dbDiscount);

        return {
            id: r.id,
            user_id: r.user_id,
            status: r.status,
            status_label: mapOrderStatus(r.status),
            total: Number(originalTotal),
            total_paid: dbTotalPaid,
            discount_amount: dbDiscount,
            promotion_code: r.promotion_code || null,
            address: {
                id: r.address_id,
                full_name: `${r.first_name} ${r.last_name}`,
                street: r.street,
                city: r.city,
                province: r.province,
                postal_code: r.postal_code,
                country: r.country,
                phone: r.phone,
            },
            items: rows.map((item: any) => ({
                id: item.order_item_id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                price: Number(item.price),
                image_url: item.image_url,
                size: item.size,
                color: item.color,
                sku: item.sku,
            })),
            created_at: r.created_at,
            updated_at: r.updated_at,
        };
    },

    /**
     * Obtener un pedido asegurando que pertenece al usuario
     * @param {number} orderId ID del pedido
     * @param {number} userId ID del usuario
     * @returns {Promise<any>} Pedido con información del usuario y items
     * @throws Error si el pedido no pertenece al usuario
     */
    async getOrderWithItems(orderId: number, userId: number) {
        const order = await this.getOrderById(orderId);
        if (order.user_id !== userId) throw new Error('No tienes permiso para ver este pedido');

        const [userRows]: any = await db.query('SELECT first_name, last_name, email FROM users WHERE id = ?', [userId]);
        if (!userRows.length) throw new Error('Usuario no encontrado');

        const user = userRows[0];

        return {
            id: order.id,
            user: {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            },
            items: order.items.map((item: any) => ({
                name: item.product_name,
                quantity: item.quantity,
                price: Number(item.price),
                image_url: item.image_url,
                size: item.size,
                color: item.color,
                sku: item.sku,
            })),
            total: Number(order.total),
            total_paid: order.total_paid !== undefined ? Number(order.total_paid) : undefined,
            discount_amount: order.discount_amount !== undefined ? Number(order.discount_amount) : 0,
            promotion_code: order.promotion_code || null,
            created_at: order.created_at,
            address: order.address,
            status: order.status,
            status_label: order.status_label,
        };
    },

    /**
     * Obtener todos los pedidos (solo para admin)
     * @returns {Promise<any[]>} Lista de todos los pedidos
     */
    async getAllOrders() {
        const [rows]: any = await db.query(GET_ALL_ORDERS);
        return rows;
    },

    /**
     * Actualizar el estado de un pedido
     * - Si el estado cambia a 'returned', procesa reembolso en Stripe
     * - Envía correos de notificación al cliente
     * @param {number} orderId ID del pedido
     * @param {string} status Nuevo estado del pedido
     * @returns {Promise<{message:string}>} Mensaje de confirmación
     */
    async updateOrderStatus(orderId: number, status: string) {
        // 🔹 Actualizar el estado del pedido
        await db.query(UPDATE_ORDER_STATUS, [status, orderId]);

        // 🔹 Si el estado pasa a "returned", procesar reembolso
        if (status === 'returned') {
            const [orderRows]: any = await db.query('SELECT user_id FROM orders WHERE id = ?', [orderId]);
            if (orderRows.length) {
                const userId = orderRows[0].user_id;

                // Traer email y nombre del usuario (necesario para la plantilla)
                const [userRows]: any = await db.query('SELECT email, first_name, last_name FROM users WHERE id = ?', [userId]);
                if (!userRows.length) throw new Error('Usuario no encontrado');

                const user = {
                    email: userRows[0].email,
                    first_name: userRows[0].first_name,
                    last_name: userRows[0].last_name,
                };

                // 🔹 Obtener pagos completados de este pedido
                const [paymentsRows]: any = await db.query(
                    'SELECT id, transaction_id, amount, status FROM payments WHERE order_id = ? AND status = "completed"',
                    [orderId]
                );

                for (const payment of paymentsRows) {
                    try {
                        if (payment.transaction_id) {
                            // 💳 Procesar reembolso en Stripe
                            await stripe.refunds.create({
                                payment_intent: payment.transaction_id,
                            });

                            // 🧾 Actualizar estado del pago en DB
                            await db.query('UPDATE payments SET status = "refunded" WHERE id = ?', [payment.id]);
                            console.log(`💸 Pago ${payment.id} reembolsado correctamente`);
                        }
                    } catch (err) {
                        console.error(`⚠️ Error reembolsando pago ${payment.id}:`, err);
                    }
                }

                // 🔹 Obtener datos del pedido (para la plantilla)
                const [orderDetails]: any = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
                const orderForEmail = orderDetails[0] || { id: orderId };

                // 📧 Enviar correo al cliente confirmando devolución completada
                await sendReturnCompletedEmail(user, orderForEmail);
            }
        }

        return { message: 'Estado del pedido actualizado' };
    },


    /**
     * Eliminar un pedido
     * @param {number} orderId ID del pedido
     * @returns {Promise<{message:string}>} Mensaje de confirmación
     */
    async deleteOrder(orderId: number) {
        await db.query(DELETE_ORDER, [orderId]);
        return { message: 'Pedido eliminado correctamente' };
    },

    /**
     * Solicitar una devolución de un pedido (por usuario)
     * @param {number} orderId ID del pedido
     * @param {number} userId ID del usuario
     * @param {string} reason Motivo de la devolución
     * @returns {Promise<{message:string, returnId:number}>} Mensaje y ID de la devolución creada
     */
    async requestReturn(orderId: number, userId: number, reason: string) {
        // Traer pedido
        const [orderRows]: any = await db.query(
            'SELECT id, user_id, status, total, total_paid FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );
        if (!orderRows.length) throw new Error('Pedido no encontrado o no pertenece al usuario');

        const order = orderRows[0];
        if (!['shipped','completed'].includes(order.status)) throw new Error('No se puede devolver este pedido');

        // Usar total_paid directamente
        const totalAmount = order.total_paid;

        // Crear la devolución
        const [result]: any = await db.query(
            CREATE_RETURN_REQUEST,
            [orderId, userId, reason, totalAmount]
        );

        return { message: 'Devolución solicitada correctamente, pendiente de aprobación', returnId: result.insertId };
    },

    /**
     * Obtener todas las devoluciones de un usuario
     * @param {number} userId ID del usuario
     * @returns {Promise<any[]>} Lista de devoluciones
     */
    async getUserReturns(userId: number) {
        const [rows]: any = await db.query(GET_RETURNS_BY_USER, [userId]);
        return rows;
    },

    /**
     * Actualizar el estado de una devolución (solo admin)
     * - status: 'approved' o 'rejected'
     * - Envía correos al usuario según la decisión
     * - Si se aprueba, actualiza estado del pedido a 'awaiting_return'
     * @param {number} returnId ID de la devolución
     * @param {'approved'|'rejected'} status Nuevo estado
     * @returns {Promise<{message:string}>} Mensaje de confirmación
     */
    async updateReturnStatus(returnId: number, status: 'approved' | 'rejected') {
        const [returnRows]: any = await db.query(GET_RETURN_BY_ID, [returnId]);
        if (!returnRows.length) throw new Error('Devolución no encontrada');

        const returnRequest = returnRows[0];
        const orderId = returnRequest.order_id;
        const userId = returnRequest.user_id;

        // Obtener datos del usuario (email + nombre) para la plantilla
        const [userRows]: any = await db.query('SELECT email, first_name, last_name FROM users WHERE id = ?', [userId]);
        if (!userRows.length) throw new Error('Usuario no encontrado');

        const user = {
            email: userRows[0].email,
            first_name: userRows[0].first_name,
            last_name: userRows[0].last_name,
        };

        // Actualizar estado de la devolución
        await db.query(UPDATE_RETURN_STATUS, [status, returnId]);

        // Normalizamos un objeto order para pasar a los emails
        const orderForEmail = { id: orderId };

        // Si se aprueba la devolución → notificar al cliente y actualizar pedido
        if (status === 'approved') {
            await db.query(UPDATE_ORDER_STATUS, ['awaiting_return', orderId]);
            await sendReturnApprovedEmail(user, orderForEmail);
        }

        // Si se rechaza la devolución → notificar al cliente solo
        if (status === 'rejected') {
            await sendReturnRejectedEmail(user, orderForEmail);
        }

        return { message: `Devolución ${status} correctamente` };
    }

};
