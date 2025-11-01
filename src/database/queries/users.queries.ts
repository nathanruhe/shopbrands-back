/**
 * Obtener un usuario por su ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 * @throws {Error} Si la consulta falla
 * @example
 * const [user] = await db.query(GET_USER_BY_ID, [id]);
 */
export const GET_USER_BY_ID = `
    SELECT id, first_name, last_name, email, role, phone, created_at, updated_at
    FROM users
    WHERE id = ?
`;

/**
 * Actualizar datos de un usuario por su ID
 * @param {string} first_name - Nombre del usuario
 * @param {string} last_name - Apellido del usuario
 * @param {string} email - Email del usuario
 * @param {string} phone - Teléfono del usuario
 * @param {number} id - ID del usuario
 * @returns {Promise<any>} Resultado de la operación de actualización
 * @throws {Error} Si la consulta falla
 * @example
 * await db.query(UPDATE_USER_BY_ID, [first_name, last_name, email, phone, id]);
 */
export const UPDATE_USER_BY_ID = `
    UPDATE users
    SET first_name = ?, last_name = ?, email = ?, phone = ?
    WHERE id = ?
`;

/**
 * Obtener todos los usuarios del sistema
 * @returns {Promise<Array>} Lista de usuarios con sus datos básicos
 * @throws {Error} Si la consulta falla
 * @example
 * const users = await db.query(GET_ALL_USERS);
 */
export const GET_ALL_USERS = `
    SELECT id, first_name, last_name, email, role, phone, created_at, updated_at
    FROM users
`;

/**
 * Eliminar un usuario por su ID
 * @param {number} id - ID del usuario a eliminar
 * @returns {Promise<{message: string}>} Confirmación de eliminación
 * @throws {Error} Si la consulta falla
 * @example
 * await db.query(DELETE_USER_BY_ID, [id]);
 */
export const DELETE_USER_BY_ID = `
    DELETE FROM users WHERE id = ?
`;


