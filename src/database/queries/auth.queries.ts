/**
 * Query para crear un nuevo usuario en la base de datos.
 * 
 * @example
 * ```ts
 * await db.query(CREATE_USER, [firstName, lastName, email, passwordHash, role, phone]);
 * ```
 * @param firstName Nombre del usuario
 * @param lastName Apellido del usuario
 * @param email Correo electrónico del usuario
 * @param passwordHash Hash de la contraseña
 * @param role Rol del usuario (ej: 'admin', 'customer')
 * @param phone Teléfono del usuario (opcional)
 */
export const CREATE_USER = `
    INSERT INTO users (first_name, last_name, email, password_hash, role, phone)
    VALUES (?, ?, ?, ?, ?, ?)
`;

/**
 * Query para obtener un usuario por su email
 * 
 * @example
 * ```ts
 * const [user] = await db.query(GET_USER_BY_EMAIL, [email]);
 * ```
 * @param email Correo electrónico del usuario a buscar
 * @returns Array de usuarios encontrados (normalmente máximo 1)
 */
export const GET_USER_BY_EMAIL = `
    SELECT * FROM users WHERE email = ?
`;
