/**
 * Query para crear un nuevo usuario en la base de datos.
 * Inserta un nuevo registro en la tabla `users` con los datos básicos de registro.
 * La contraseña debe venir previamente hasheada.
 * @example
 * ```ts
 * await db.query(CREATE_USER, [firstName, lastName, email, passwordHash, role, phone]);
 * ```
 * @param {string} firstName - Nombre del usuario.
 * @param {string} lastName - Apellido del usuario.
 * @param {string} email - Correo electrónico único del usuario.
 * @param {string} passwordHash - Contraseña en formato hash (bcrypt).
 * @param {'admin'|'user'} role - Rol del usuario (ej: 'admin' o 'user').
 * @param {string} phone - Teléfono del usuario (opcional).
 */
export const CREATE_USER = `
    INSERT INTO users (first_name, last_name, email, password_hash, role, phone)
    VALUES (?, ?, ?, ?, ?, ?)
`;

/**
 * Query para obtener un usuario por su email.
 * Devuelve los datos del usuario correspondiente al email indicado.
 * @example
 * ```ts
 * const [user] = await db.query(GET_USER_BY_EMAIL, [email]);
 * ```
 * @param {string} email - Correo electrónico del usuario a buscar.
 * @returns {Promise<any[]>} Array con los datos del usuario (máximo 1 registro).
 */
export const GET_USER_BY_EMAIL = `
    SELECT * FROM users WHERE email = ?
`;

/**
 * Query para actualizar la contraseña de un usuario.
 * Se utiliza tanto en el cambio manual de contraseña como en el restablecimiento por token.
 * @example
 * ```ts
 * await db.query(UPDATE_PASSWORD, [hashedPassword, userId]);
 * ```
 * @param {string} hashedPassword - Nueva contraseña hasheada (bcrypt).
 * @param {number} userId - ID del usuario.
 */
export const UPDATE_PASSWORD = `
    UPDATE users SET password_hash = ? WHERE id = ?
`;

/**
 * Query para guardar el token de recuperación de contraseña.
 * Se genera al solicitar un "forgot password". El token tiene una fecha de expiración.
 * @example
 * ```ts
 * await db.query(SET_RESET_TOKEN, [token, expires, email]);
 * ```
 * @param {string} token - Token aleatorio generado para la recuperación.
 * @param {Date} expires - Fecha y hora de expiración del token.
 * @param {string} email - Correo electrónico del usuario que solicitó la recuperación.
 */
export const SET_RESET_TOKEN = `
    UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?
`;

/**
 * Query para buscar un usuario por su token de recuperación.
 * Solo devuelve resultados si el token existe y no ha expirado.
 * @example
 * ```ts
 * const [user] = await db.query(GET_USER_BY_RESET_TOKEN, [token]);
 * ```
 * @param {string} token - Token de recuperación recibido desde el enlace de email.
 * @returns {Promise<any[]>} Array con el usuario encontrado si el token es válido.
 */
export const GET_USER_BY_RESET_TOKEN = `
    SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()
`;

/**
 * Query para eliminar el token de recuperación una vez usado.
 * Se ejecuta después de restablecer correctamente la contraseña.
 * @example
 * ```ts
 * await db.query(CLEAR_RESET_TOKEN, [userId]);
 * ```
 * @param {number} userId - ID del usuario al que se le eliminan los tokens.
 */
export const CLEAR_RESET_TOKEN = `
    UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?
`;