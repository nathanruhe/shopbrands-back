/**
 * Crear un nuevo pedido
 * @constant
 * @type {string}
 * @param {number} userId - ID del usuario que realiza el pedido
 * @param {number} addressId - ID de la dirección de envío
 * @param {string} status - Estado inicial del pedido (ej: 'pending')
 * @param {number} total - Total del pedido
 * @returns {Promise<void>}
 * @example
 * await db.query(CREATE_ORDER, [userId, addressId, status, total]);
 */
export const CREATE_ORDER = `
    INSERT INTO orders (user_id, address_id, status, total)
    VALUES (?, ?, ?, ?)
`;

/**
 * Crear un item asociado a un pedido
 * @constant
 * @type {string}
 * @param {number} orderId - ID del pedido
 * @param {number} productId - ID del producto
 * @param {number} quantity - Cantidad del producto
 * @param {number} price - Precio unitario del producto
 * @returns {Promise<void>}
 * @example
 * await db.query(CREATE_ORDER_ITEM, [orderId, productId, quantity, price]);
 */
export const CREATE_ORDER_ITEM = `
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?)
`;

/**
 * Obtener todos los pedidos de un usuario junto con items y dirección
 * @constant
 * @type {string}
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array<Object>>} Lista de pedidos con sus items y dirección
 * @example
 * const orders = await db.query(GET_ORDERS_BY_USER, [userId]);
 */
export const GET_ORDERS_BY_USER = `
    SELECT 
        o.id, o.user_id, o.status, o.total, o.total_paid, o.discount_amount, o.promotion_code, o.address_id, o.created_at, o.updated_at,
        a.first_name, a.last_name, a.street, a.city, a.province, a.postal_code, a.country, a.phone,
        oi.id AS order_item_id, oi.product_id, oi.quantity, oi.price,
        p.name AS product_name, p.image_url, p.size, p.color, p.sku
    FROM orders o
    LEFT JOIN addresses a ON o.address_id = a.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC;
`;

/**
 * Obtener un pedido por su ID junto con items y dirección
 * @constant
 * @type {string}
 * @param {number} orderId - ID del pedido
 * @returns {Promise<Object>} Pedido con sus items y dirección
 * @example
 * const order = await db.query(GET_ORDER_BY_ID, [orderId]);
 */
export const GET_ORDER_BY_ID = `
    SELECT 
        o.id, o.user_id, o.status, o.total, o.total_paid, o.discount_amount, o.promotion_code, o.address_id, o.created_at, o.updated_at,
        a.first_name, a.last_name, a.street, a.city, a.province, a.postal_code, a.country, a.phone,
        oi.id AS order_item_id, oi.product_id, oi.quantity, oi.price,
        p.name AS product_name, p.image_url, p.size, p.color, p.sku
    FROM orders o
    LEFT JOIN addresses a ON o.address_id = a.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.id = ?;
`;

/**
 * Obtener todos los pedidos
 * @constant
 * @type {string}
 * @returns {Promise<Array<Object>>} Lista de todos los pedidos
 * @example
 * const allOrders = await db.query(GET_ALL_ORDERS);
 */
export const GET_ALL_ORDERS = `
    SELECT * FROM orders
`;

/**
 * Actualizar el estado de un pedido
 * @constant
 * @type {string}
 * @param {string} status - Nuevo estado del pedido (ej: 'completed')
 * @param {number} orderId - ID del pedido
 * @returns {Promise<void>}
 * @example
 * await db.query(UPDATE_ORDER_STATUS, [status, orderId]);
 */
export const UPDATE_ORDER_STATUS = `
    UPDATE orders SET status = ? WHERE id = ?
`;

/**
 * Eliminar un pedido por su ID
 * @constant
 * @type {string}
 * @param {number} orderId - ID del pedido
 * @returns {Promise<void>}
 * @example
 * await db.query(DELETE_ORDER, [orderId]);
 */
export const DELETE_ORDER = `
    DELETE FROM orders WHERE id = ?
`;

/**
 * Crear una solicitud de devolución
 * @constant
 * @type {string}
 * @param {number} orderId - ID del pedido
 * @param {number} userId - ID del usuario
 * @param {string} reason - Motivo de la devolución
 * @param {number} totalAmount - Total a devolver
 * @returns {Promise<void>}
 * @example
 * await db.query(CREATE_RETURN_REQUEST, [orderId, userId, reason, totalAmount]);
 */
export const CREATE_RETURN_REQUEST = `
    INSERT INTO returns (order_id, user_id, reason, total_amount, status)
    VALUES (?, ?, ?, ?, 'pending')
`;

/**
 * Actualizar el estado de una devolución
 * @constant
 * @type {string}
 * @param {string} status - Nuevo estado ('approved' o 'rejected')
 * @param {number} returnId - ID de la devolución
 * @returns {Promise<void>}
 * @example
 * await db.query(UPDATE_RETURN_STATUS, [status, returnId]);
 */
export const UPDATE_RETURN_STATUS = `
    UPDATE returns SET status = ? WHERE id = ?
`;

/**
 * Obtener todas las devoluciones de un usuario
 * @constant
 * @type {string}
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array<Object>>} Lista de devoluciones con el estado del pedido original
 * @example
 * const returns = await db.query(GET_RETURNS_BY_USER, [userId]);
 */
export const GET_RETURNS_BY_USER = `
    SELECT r.*, o.status AS order_status
    FROM returns r
    LEFT JOIN orders o ON r.order_id = o.id
    WHERE r.user_id = ?
`;

/**
 * Obtener una devolución por su ID
 * @constant
 * @type {string}
 * @param {number} returnId - ID de la devolución
 * @returns {Promise<Object>} Datos de la devolución con estado del pedido
 * @example
 * const returnRequest = await db.query(GET_RETURN_BY_ID, [returnId]);
 */
export const GET_RETURN_BY_ID = `
    SELECT r.*, o.status AS order_status
    FROM returns r
    LEFT JOIN orders o ON r.order_id = o.id
    WHERE r.id = ?
`;
