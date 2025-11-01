/**
 * Crear un nuevo producto
 * @param {string} name - Nombre del producto
 * @param {string} [description] - Descripción del producto
 * @param {string} [image_url] - Nombre del archivo de la imagen
 * @param {number} [price] - Precio del producto
 * @param {number} [stock] - Stock disponible
 * @param {string} [size] - Talla o tamaño
 * @param {string} [color] - Color del producto
 * @param {string} [sku] - SKU del producto
 * @returns {Promise<any>} Resultado de la inserción en la base de datos
 * @example
 * await db.query(CREATE_PRODUCT, [name, description, image_url, price, stock, size, color, sku]);
 */
export const CREATE_PRODUCT = `
    INSERT INTO products 
    (name, description, image_url, price, stock, size, color, sku)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

/**
 * Relacionar un producto con varias categorías (bulk insert)
 * @param {Array<[number, number]>} values - Array de pares [productId, categoryId]
 * @returns {Promise<any>} Resultado de la inserción en product_categories
 * @example
 * await db.query(ADD_PRODUCT_CATEGORIES, [values]);
 */
export const ADD_PRODUCT_CATEGORIES = `
    INSERT INTO product_categories (product_id, category_id) VALUES ?
`;

/**
 * Obtener un producto por ID con sus categorías en formato JSON
 * @param {number} id - ID del producto
 * @returns {Promise<Object>} Producto con información completa y sus categorías
 * @example
 * const product = await db.query(GET_PRODUCT_BY_ID, [id]);
 */
export const GET_PRODUCT_BY_ID = `
    SELECT 
        p.*,
        IFNULL(JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'name', c.name, 'description', c.description)), JSON_ARRAY()) AS categories
    FROM products p
    LEFT JOIN product_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE p.id = ?
    GROUP BY p.id
`;

/**
 * Obtener todos los productos con sus categorías en formato JSON
 * @returns {Promise<Array>} Lista de productos con sus categorías
 * @example
 * const products = await db.query(GET_ALL_PRODUCTS);
 */
export const GET_ALL_PRODUCTS = `
    SELECT 
        p.*,
        IFNULL(JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'name', c.name, 'description', c.description)), JSON_ARRAY()) AS categories
    FROM products p
    LEFT JOIN product_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    GROUP BY p.id
`;

/**
 * Obtener productos filtrados por varias categorías (AND) con límite y offset
 * @param {number[]} categoryIds - Array de IDs de categorías
 * @param {number} [limit] - Número máximo de resultados
 * @param {number} [offset] - Desplazamiento de resultados para paginación
 * @returns {string} SQL dinámico
 * @example
 * const sql = GET_PRODUCTS_BY_CATEGORIES_AND([1,2], 10, 0);
 */
export const GET_PRODUCTS_BY_CATEGORIES_AND = (categoryIds: number[], limit?: number, offset?: number) => {
    const idsList = categoryIds.map(id => Number(id)).join(',');
    let sql = `
        SELECT 
            p.*, 
            IFNULL(JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'name', c.name, 'description', c.description)), JSON_ARRAY()) AS categories
        FROM products p
        INNER JOIN product_categories pc ON p.id = pc.product_id
        INNER JOIN categories c ON pc.category_id = c.id
        WHERE p.id IN (
            SELECT product_id
            FROM product_categories
            WHERE category_id IN (${idsList})
            GROUP BY product_id
            HAVING COUNT(DISTINCT category_id) = ${categoryIds.length}
        )
        GROUP BY p.id
    `;
    if (typeof limit === 'number' && limit > 0) sql += ` LIMIT ${limit}`;
    if (typeof offset === 'number' && offset >= 0) sql += ` OFFSET ${offset}`;
    return sql;
};

/**
 * Actualizar un producto por ID
 * @param {string} name - Nombre del producto
 * @param {string} [description] - Descripción del producto
 * @param {string} [image_url] - Nombre del archivo de imagen
 * @param {number} [price] - Precio del producto
 * @param {number} [stock] - Stock disponible
 * @param {string} [size] - Talla
 * @param {string} [color] - Color
 * @param {string} [sku] - SKU del producto
 * @param {number} id - ID del producto a actualizar
 * @returns {Promise<any>} Resultado de la actualización en la base de datos
 * @example
 * await db.query(UPDATE_PRODUCT_BY_ID, [name, description, image_url, price, stock, size, color, sku, id]);
 */
export const UPDATE_PRODUCT_BY_ID = `
    UPDATE products 
    SET name = ?, description = ?, image_url = ?, price = ?, stock = ?, size = ?, color = ?, sku = ?
    WHERE id = ?
`;

/**
 * Eliminar un producto por ID
 * @param {number} id - ID del producto a eliminar
 * @returns {Promise<any>} Resultado de la operación de eliminación
 * @example
 * await db.query(DELETE_PRODUCT_BY_ID, [id]);
 */
export const DELETE_PRODUCT_BY_ID = `
    DELETE FROM products WHERE id = ?
`;
