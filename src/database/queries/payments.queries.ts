/**
 * Obtener un pedido por su ID junto con datos de usuario y dirección
 * @param {number} orderId - ID del pedido
 * @returns {Promise<Object>} Información completa del pedido, incluyendo datos del usuario y dirección
 * @example
 * const [order] = await db.query(GET_ORDER_BY_ID, [orderId]);
 */
export const GET_ORDER_BY_ID = `
    SELECT 
        o.*, 
        u.first_name, u.last_name, u.email,
        a.street, a.city, a.province, a.postal_code, a.country, a.phone
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN addresses a ON o.address_id = a.id
    WHERE o.id = ?;
`;

/**
 * Actualizar el estado de un pedido
 * @param {string} status - Nuevo estado del pedido (ej: 'completed', 'pending', 'shipped')
 * @param {number} orderId - ID del pedido
 * @returns {Promise<void>} No devuelve resultados, solo actualiza el estado
 * @example
 * await db.query(UPDATE_ORDER_STATUS, [status, orderId]);
 */
export const UPDATE_ORDER_STATUS = `
    UPDATE orders
    SET status = ?
    WHERE id = ?;
`;

/**
 * Insertar un registro de pago asociado a un pedido
 * @param {number} orderId - ID del pedido
 * @param {string} transactionId - ID de la transacción (Stripe u otro proveedor)
 * @param {number} amount - Monto pagado
 * @param {string} status - Estado del pago (ej: 'completed', 'pending')
 * @param {string} method - Método de pago (ej: 'card', 'paypal')
 * @param {number} discountAmount - Monto de descuento aplicado
 * @param {string|null} promotionCode - Código de promoción usado, si aplica
 * @returns {Promise<void>} Inserta el registro de pago en la tabla `payments`
 * @example
 * await db.query(INSERT_PAYMENT_RECORD, [orderId, transactionId, amount, status, method, discountAmount, promotionCode]);
 */
export const INSERT_PAYMENT_RECORD = `
    INSERT INTO payments (order_id, transaction_id, amount, status, method, discount_amount, promotion_code, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW());
`;

/**
 * Actualizar totales de un pedido
 * @param {number} totalPaid - Total pagado por el pedido
 * @param {number} discountAmount - Descuento aplicado
 * @param {string|null} promotionCode - Código de promoción usado, si aplica
 * @param {number} orderId - ID del pedido
 * @returns {Promise<void>} Actualiza los campos `total_paid`, `discount_amount` y `promotion_code` de un pedido
 * @example
 * await db.query(UPDATE_ORDER_TOTALS, [totalPaid, discountAmount, promotionCode, orderId]);
 */
export const UPDATE_ORDER_TOTALS = `
    UPDATE orders
    SET total_paid = ?, discount_amount = ?, promotion_code = ?
    WHERE id = ?;
`;
