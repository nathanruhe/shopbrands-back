import { db } from '../../config/config';
import bcrypt from 'bcryptjs';
import { signJwt } from '../../utils/jwt.util';
import { CREATE_USER, GET_USER_BY_EMAIL } from '../../database/queries/auth.queries';

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
    }
};
