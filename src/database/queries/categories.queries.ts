/**
 * Obtener todas las categorías.
 * @returns {Promise<Array>} Lista de categorías ordenadas por nombre
 * @throws {Error} Si la consulta falla
 * @example
 * const categories = await db.query(GET_ALL_CATEGORIES);
 */
export const GET_ALL_CATEGORIES = `
    SELECT id, name, description, created_at, updated_at
    FROM categories
    ORDER BY name
`;

/**
 * Obtener una categoría por su ID.
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} Datos de la categoría
 * @throws {Error} Si la consulta falla
 * @example
 * const [category] = await db.query(GET_CATEGORY_BY_ID, [id]);
 */
export const GET_CATEGORY_BY_ID = `
    SELECT id, name, description, created_at, updated_at
    FROM categories
    WHERE id = ?
`;

/**
 * Crear una nueva categoría.
 * @param {string} name - Nombre de la categoría
 * @param {string} description - Descripción de la categoría
 * @returns {Promise<any>} Resultado de la operación de inserción
 * @throws {Error} Si la consulta falla
 * @example
 * await db.query(CREATE_CATEGORY, [name, description]);
 */
export const CREATE_CATEGORY = `
    INSERT INTO categories (name, description)
    VALUES (?, ?)
`;

/**
 * Actualizar una categoría por su ID.
 * @param {string} name - Nuevo nombre de la categoría
 * @param {string} description - Nueva descripción de la categoría
 * @param {number} id - ID de la categoría
 * @returns {Promise<any>} Resultado de la operación de actualización
 * @throws {Error} Si la consulta falla
 * @example
 * await db.query(UPDATE_CATEGORY_BY_ID, [name, description, id]);
 */
export const UPDATE_CATEGORY_BY_ID = `
    UPDATE categories
    SET name = ?, description = ?
    WHERE id = ?
`;

/**
 * Eliminar una categoría por su ID.
 * @param {number} id - ID de la categoría a eliminar
 * @returns {Promise<{message: string}>} Confirmación de eliminación
 * @throws {Error} Si la consulta falla
 * @example
 * await db.query(DELETE_CATEGORY_BY_ID, [id]);
 */
export const DELETE_CATEGORY_BY_ID = `
    DELETE FROM categories WHERE id = ?
`;