import { db } from '../../config/config';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { signJwt } from '../../utils/jwt.util';
import { CREATE_USER, GET_USER_BY_EMAIL, UPDATE_PASSWORD, SET_RESET_TOKEN, GET_USER_BY_RESET_TOKEN, CLEAR_RESET_TOKEN } from '../../database/queries/auth.queries';
import { sendPasswordResetEmail } from './notifications/send-password-reset';


export const AuthService = {
    /**
     * Registra un nuevo usuario en la base de datos.
     * - Verifica que no exista un usuario con el mismo email.
     * - Hashea la contraseña usando bcrypt antes de guardar.
     * 
     * @async
     * @param {string} first_name - Nombre del usuario.
     * @param {string} last_name - Apellido del usuario.
     * @param {string} email - Email del usuario. Debe ser único.
     * @param {string} password - Contraseña en texto plano. Será hasheada antes de guardar.
     * @param {'admin'|'user'} role - Rol del usuario. Por ejemplo, 'admin' o 'user'.
     * @param {string} phone - Número de teléfono del usuario.
     * @returns {Promise<{ message: string }>} Objeto con mensaje de éxito si el registro fue correcto.
     * @throws {Error} Si ya existe un usuario con el mismo email.
     * @example
     * await AuthService.register('Juan', 'Pérez', 'juan@example.com', 'password123', 'user', '555-1234');
     */
    async register(first_name: string, last_name: string, email: string, password: string, role: string, phone: string) {
        // 1️⃣ Verificar si ya existe un usuario con el mismo email
        const [existing]: any = await db.query(GET_USER_BY_EMAIL, [email]);
        if (existing.length > 0) throw new Error('Ya existe un usuario registrado con este email');

        // 2️⃣ Hashear la contraseña usando bcrypt con 10 salt rounds
        const hashed = await bcrypt.hash(password, 10);

        // 3️⃣ Insertar el nuevo usuario en la base de datos
        await db.query(CREATE_USER, [first_name, last_name, email, hashed, role, phone]);

        // 4️⃣ Devolver mensaje de éxito
        return { message: 'Usuario registrado correctamente' };
    },

    /**
     * Realiza el login de un usuario o administrador.
     * - Verifica que el email exista en la base de datos.
     * - Compara la contraseña proporcionada con la almacenada (hash bcrypt).
     * - Genera un JWT que contiene `id` y `role` del usuario.
     * - Retorna los datos del usuario sin incluir la contraseña.
     * 
     * @async
     * @param {string} email - Email del usuario.
     * @param {string} password - Contraseña en texto plano.
     * @returns {Promise<{ token: string, user: { id: number, first_name: string, last_name: string, email: string, role: string, phone: string } }>} 
     * Objeto que contiene:
     *  - `token`: JWT firmado con id y rol del usuario.
     *  - `user`: Datos del usuario sin la contraseña.
     * @throws {Error} Si el usuario no existe o la contraseña es incorrecta.
     * @example
     * const result = await AuthService.login('juan@example.com', 'password123');
     * console.log(result.token); // JWT
     * console.log(result.user); // { id: 1, first_name: 'Juan', ... }
     */
    async login(email: string, password: string) {
        // 1️⃣ Verificar si el email existe en la base de datos
        const [rows]: any = await db.query(GET_USER_BY_EMAIL, [email]);
        if (!rows.length) throw new Error('Usuario no encontrado');

        const user = rows[0];

        // 2️⃣ Verificar que la contraseña proporcionada coincide con la hash guardada
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) throw new Error('Contraseña incorrecta');

        // 3️⃣ Generar un token JWT usando id y role del usuario
        const token = signJwt({ id: user.id, role: user.role });

        // 4️⃣ Eliminar la contraseña antes de devolver los datos del usuario
        const { password_hash, ...userSafe } = user;

        // 5️⃣ Retornar token y usuario seguro
        return { token, user: userSafe };
    },


    /**
     * Cambiar la contraseña de un usuario autenticado.
     * 
     * Flujo:
     * 1. Verifica que el usuario exista.
     * 2. Compara la contraseña actual con la almacenada.
     * 3. Hashea la nueva contraseña y la actualiza.
     * 
     * @async
     * @param {number} userId - ID del usuario autenticado.
     * @param {string} currentPassword - Contraseña actual.
     * @param {string} newPassword - Nueva contraseña deseada.
     * @returns {Promise<{ message: string }>} Mensaje de confirmación.
     * @throws {Error} Si el usuario no existe o la contraseña actual no coincide.
     *
     * @example
     * ```ts
     * await AuthService.changePassword(1, 'actual123', 'nueva456');
     * ```
     */
    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const [rows]: any = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (!rows.length) throw new Error('Usuario no encontrado');
        const user = rows[0];

        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) throw new Error('Contraseña actual incorrecta');

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query(UPDATE_PASSWORD, [hashed, userId]);
        return { message: 'Contraseña actualizada correctamente' };
    },

    /**
     * Solicitar recuperación de contraseña ("Forgot Password").
     * 
     * Flujo:
     * 1. Verifica si el correo existe.
     * 2. Genera un token aleatorio y una fecha de expiración (1 hora).
     * 3. Guarda el token en la base de datos.
     * 4. Crea el enlace de recuperación (`resetLink`).
     * 5. Envía el email con el enlace al usuario.
     * 
     * @async
     * @param {string} email - Correo electrónico del usuario que solicita la recuperación.
     * @returns {Promise<{ message: string }>} Mensaje de confirmación del envío del email.
     * @throws {Error} Si el correo no está registrado en el sistema.
     *
     * @example
     * ```ts
     * await AuthService.requestPasswordReset('juan@example.com');
     * ```
     */
    async requestPasswordReset(email: string) {
        // 1️⃣ Buscar el usuario por email
        const [rows]: any = await db.query(GET_USER_BY_EMAIL, [email]);
        if (!rows.length) {
            throw new Error('No existe una cuenta registrada con este correo');
        }

        // 2️⃣ Generar token único y fecha de expiración (1 hora)
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

        // 3️⃣ Guardar el token en la base de datos
        await db.query(SET_RESET_TOKEN, [token, expires, email]);

        // 4️⃣ Generar el enlace de recuperación
        // const resetLink = `https://shopbrands.com/reset-password?token=${token}`;

        // Usa variable de entorno o localhost en desarrollo
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        // 5️⃣ Enviar el email usando el sistema de notificaciones
        await sendPasswordResetEmail(email, resetLink);

        console.log(`✅ Token de recuperación generado para ${email}`);

        // 6️⃣ Respuesta al cliente
        return { message: 'Hemos enviado un correo con las instrucciones para restablecer tu contraseña.' };
    },

    /**
     * Restablecer la contraseña usando un token válido.
     * 
     * Flujo:
     * 1. Busca al usuario asociado al token.
     * 2. Verifica que el token no haya expirado.
     * 3. Hashea la nueva contraseña.
     * 4. Actualiza la contraseña y limpia el token de la base de datos.
     * 
     * @async
     * @param {string} token - Token de recuperación válido.
     * @param {string} newPassword - Nueva contraseña que se desea establecer.
     * @returns {Promise<{ message: string }>} Mensaje de éxito si se restableció correctamente.
     * @throws {Error} Si el token es inválido o ha expirado.
     *
     * @example
     * ```ts
     * await AuthService.resetPassword('abcd1234efgh5678', 'nuevaPassword123');
     * ```
     */
    async resetPassword(token: string, newPassword: string) {
        const [rows]: any = await db.query(GET_USER_BY_RESET_TOKEN, [token]);
        if (!rows.length) throw new Error('Token inválido o expirado');

        const user = rows[0];
        const hashed = await bcrypt.hash(newPassword, 10);

        await db.query(UPDATE_PASSWORD, [hashed, user.id]);
        await db.query(CLEAR_RESET_TOKEN, [user.id]);

        return { message: 'Contraseña restablecida correctamente' };
    },
};
