/**
 * Obtener el carrito de un usuario por su ID.
 * @constant
 * @type {string}
 * @param {number} user_id - ID del usuario.
 * @returns {Promise<Object>} Carrito del usuario (id).
 * @example
 * const [cart] = await db.query(GET_CART_BY_USER, [userId]);
 */
export const GET_CART_BY_USER = `
    SELECT id
    FROM cart
    WHERE user_id = ?
    LIMIT 1
`;

/**
 * Crear un nuevo carrito para un usuario.
 * @constant
 * @type {string}
 * @param {number} user_id - ID del usuario.
 * @returns {Promise<void>}
 * @example
 * await db.query(CREATE_CART, [userId]);
 */
export const CREATE_CART = `
    INSERT INTO cart (user_id) VALUES (?)
`;

/**
 * Obtener los productos de un carrito por su ID.
 * @constant
 * @type {string}
 * @param {number} cart_id - ID del carrito.
 * @returns {Promise<Array<Object>>} Lista de productos con información del producto.
 * @example
 * const items = await db.query(GET_CART_ITEMS_BY_CART, [cartId]);
 */
export const GET_CART_ITEMS_BY_CART = `
    SELECT
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.name AS product_name,
        p.price AS product_price,
        p.stock AS product_stock,
        p.image_url AS product_image
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = ?
`;

/**
 * Buscar un producto específico en el carrito por producto.
 * @constant
 * @type {string}
 * @param {number} cart_id - ID del carrito.
 * @param {number} product_id - ID del producto.
 * @returns {Promise<Object|null>} producto encontrado o null si no existe.
 * @example
 * const item = await db.query(FIND_CART_ITEM_BY_PRODUCT, [cartId, productId]);
 */
export const FIND_CART_ITEM_BY_PRODUCT = `
    SELECT id, quantity
    FROM cart_items
    WHERE cart_id = ? AND product_id = ?
    LIMIT 1
`;

/**
 * Añadir un producto al carrito.
 * @constant
 * @type {string}
 * @param {number} cart_id - ID del carrito.
 * @param {number} product_id - ID del producto.
 * @param {number} quantity - Cantidad a añadir.
 * @returns {Promise<void>}
 * @example
 * await db.query(ADD_CART_ITEM, [cartId, productId, quantity]);
 */
export const ADD_CART_ITEM = `
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES (?, ?, ?)
`;

/**
 * Actualizar la cantidad de un producto en el carrito.
 * @constant
 * @type {string}
 * @param {number} quantity - Nueva cantidad.
 * @param {number} id - ID del producto en el carrito.
 * @param {number} cart_id - ID del carrito.
 * @returns {Promise<void>}
 * @example
 * await db.query(UPDATE_CART_ITEM, [quantity, itemId, cartId]);
 */
export const UPDATE_CART_ITEM = `
    UPDATE cart_items
    SET quantity = ?
    WHERE id = ? AND cart_id = ?
`;

/**
 * Eliminar un producto del carrito.
 * @constant
 * @type {string}
 * @param {number} id - ID del producto.
 * @param {number} cart_id - ID del carrito.
 * @returns {Promise<void>}
 * @example
 * await db.query(DELETE_CART_ITEM, [itemId, cartId]);
 */
export const DELETE_CART_ITEM = `
    DELETE FROM cart_items
    WHERE id = ? AND cart_id = ?
`;

/**
 * Vaciar todos los productos de un carrito.
 * @constant
 * @type {string}
 * @param {number} cart_id - ID del carrito.
 * @returns {Promise<void>}
 * @example
 * await db.query(EMPTY_CART_ITEMS, [cartId]);
 */
export const EMPTY_CART_ITEMS = `
    DELETE FROM cart_items
    WHERE cart_id = ?
`;

/**
 * Eliminar el carrito de un usuario.
 * @constant
 * @type {string}
 * @param {number} user_id - ID del usuario.
 * @returns {Promise<void>}
 * @example
 * await db.query(DELETE_CART_BY_USER, [userId]);
 */
export const DELETE_CART_BY_USER = `
    DELETE FROM cart
    WHERE user_id = ?
`;
