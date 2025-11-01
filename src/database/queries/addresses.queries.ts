/**
 * Crear una nueva dirección de usuario
 * @param {number} userId - ID del usuario al que pertenece la dirección
 * @param {string} firstName - Nombre del destinatario
 * @param {string} lastName - Apellido del destinatario
 * @param {string} street - Calle y número
 * @param {string} city - Ciudad
 * @param {string} province - Provincia o estado
 * @param {string} postalCode - Código postal
 * @param {string} country - País
 * @param {string} phone - Teléfono de contacto
 * @param {string} type - Tipo de dirección (ej: 'home', 'work')
 * @returns {Promise<void>} Inserta la dirección en la tabla `addresses`
 * @example
 * await db.query(CREATE_ADDRESS, [userId, firstName, lastName, street, city, province, postalCode, country, phone, type]);
 */
export const CREATE_ADDRESS = `
    INSERT INTO addresses (user_id, first_name, last_name, street, city, province, postal_code, country, phone, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

/**
 * Obtener todas las direcciones de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Lista de direcciones del usuario
 * @example
 * const addresses = await db.query(GET_ADDRESSES_BY_USER, [userId]);
 */
export const GET_ADDRESSES_BY_USER = `
    SELECT id, first_name, last_name, street, city, province, postal_code, country, phone, type, created_at, updated_at
    FROM addresses
    WHERE user_id = ?
`;

/**
 * Actualizar una dirección específica de un usuario
 * @param {string} firstName - Nombre del destinatario
 * @param {string} lastName - Apellido del destinatario
 * @param {string} street - Calle y número
 * @param {string} city - Ciudad
 * @param {string} province - Provincia o estado
 * @param {string} postalCode - Código postal
 * @param {string} country - País
 * @param {string} phone - Teléfono de contacto
 * @param {string} type - Tipo de dirección (ej: 'home', 'work')
 * @param {number} addressId - ID de la dirección a actualizar
 * @param {number} userId - ID del usuario propietario
 * @returns {Promise<void>} Actualiza la dirección en la base de datos
 * @example
 * await db.query(UPDATE_ADDRESS_BY_ID, [firstName, lastName, street, city, province, postalCode, country, phone, type, addressId, userId]);
 */
export const UPDATE_ADDRESS_BY_ID = `
    UPDATE addresses
    SET first_name = ?, last_name = ?, street = ?, city = ?, province = ?, postal_code = ?, country = ?, phone = ?, type = ?
    WHERE id = ? AND user_id = ?
`;

/**
 * Eliminar una dirección específica de un usuario
 * @param {number} addressId - ID de la dirección a eliminar
 * @param {number} userId - ID del usuario propietario
 * @returns {Promise<void>} Elimina la dirección de la base de datos
 * @example
 * await db.query(DELETE_ADDRESS_BY_ID, [addressId, userId]);
 */
export const DELETE_ADDRESS_BY_ID = `
    DELETE FROM addresses WHERE id = ? AND user_id = ?
`;

/**
 * Obtener una dirección específica de un usuario
 * @param {number} addressId - ID de la dirección
 * @param {number} userId - ID del usuario propietario
 * @returns {Promise<Object>} Información de la dirección
 * @example
 * const address = await db.query(GET_ADDRESS_BY_ID, [addressId, userId]);
 */
export const GET_ADDRESS_BY_ID = `
    SELECT * FROM addresses WHERE id = ? AND user_id = ?
`;
