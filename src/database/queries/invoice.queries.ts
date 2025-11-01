/**
 * Obtener información de un pedido junto con la dirección y datos del usuario
 * @param {number} orderId - ID del pedido
 * @returns {Promise<Object>} Información completa del pedido, incluyendo dirección y datos del usuario
 * @example
 * const [order] = await db.query(GET_ORDER_WITH_ADDRESS, [orderId]);
 */
export const GET_ORDER_WITH_ADDRESS = `
    SELECT 
        o.id, o.user_id, o.total, o.total_paid, o.discount_amount, o.promotion_code, o.created_at, o.status,
        u.first_name, u.last_name, u.email,
        CONCAT(a.first_name, ' ', a.last_name) AS full_name,
        a.street, a.city, a.province, a.postal_code, a.country, a.phone
    FROM orders o
    LEFT JOIN addresses a ON o.address_id = a.id
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.id = ?;
`;

/**
 * Obtener información básica de un usuario por su ID
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Datos básicos del usuario (first_name, last_name, email)
 * @example
 * const [user] = await db.query(GET_USER_BY_ID, [userId]);
 */
export const GET_USER_BY_ID = `
    SELECT first_name, last_name, email
    FROM users
    WHERE id = ?;
`;

/**
 * Obtener los items de un pedido junto con información del producto
 * @param {number} orderId - ID del pedido
 * @returns {Promise<Array>} Lista de items del pedido con información del producto
 * @example
 * const items = await db.query(GET_ORDER_ITEMS_WITH_PRODUCT, [orderId]);
 */
export const GET_ORDER_ITEMS_WITH_PRODUCT = `
    SELECT 
        oi.quantity, oi.price, 
        p.name, p.image_url, p.size, p.color, p.sku
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?;
`;

/**
 * Obtener todos los pagos realizados para un pedido específico
 * @param {number} orderId - ID del pedido
 * @returns {Promise<Array>} Lista de pagos asociados al pedido
 * @example
 * const payments = await db.query(GET_PAYMENTS_BY_ORDER, [orderId]);
 */
export const GET_PAYMENTS_BY_ORDER = `
    SELECT id, method, status, transaction_id, amount, discount_amount, promotion_code, created_at
    FROM payments
    WHERE order_id = ?;
`;
